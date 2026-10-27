import { describe, expect, it } from "vitest";
import { generateReport, PRICE_PAISE, SAMPLE_ANSWERS, sunSeason, answersSchema } from "@/lib/report";
import { hmacSha256Hex, verifyCheckoutSignature } from "@/lib/razorpay-signature";

describe("pricing", () => {
  it("is fixed at INR 10 (1000 paise)", () => expect(PRICE_PAISE).toBe(1000));
});

describe("report", () => {
  it("is deterministic and has exactly 3 next steps", () => {
    const a = generateReport(SAMPLE_ANSWERS);
    expect(generateReport(SAMPLE_ANSWERS)).toEqual(a);
    expect(a.nextSteps).toHaveLength(3);
  });
  it("maps sun seasons from date", () => {
    expect(sunSeason("2008-01-05").sign).toBe("Capricorn");
    expect(sunSeason("2008-12-25").sign).toBe("Capricorn");
    expect(sunSeason("2008-08-30").sign).toBe("Virgo");
  });
  it("requires consent", () => {
    expect(answersSchema.safeParse({ ...SAMPLE_ANSWERS, consent: false }).success).toBe(false);
  });
});

describe("razorpay signature", () => {
  it("accepts correct and rejects tampered signatures", async () => {
    const sig = await hmacSha256Hex("secret", "order_1|pay_1");
    expect(await verifyCheckoutSignature("order_1", "pay_1", sig, "secret")).toBe(true);
    expect(await verifyCheckoutSignature("order_1", "pay_2", sig, "secret")).toBe(false);
  });
});