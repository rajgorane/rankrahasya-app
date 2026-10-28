import { describe, expect, it } from "vitest";
import { generateReport, SAMPLE_ANSWERS, type Answers } from "./report";

function answers(overrides: Partial<Answers> = {}): Answers {
  return { ...SAMPLE_ANSWERS, ...overrides };
}

describe("generateReport personalisation", () => {
  it("is deterministic for the same answer set", () => {
    const input = answers();
    expect(generateReport(input)).toEqual(generateReport(input));
  });

  it("changes the discovery profile and practical advice when answers change", () => {
    const first = generateReport(answers({
      exam: "JEE",
      studyHours: "lt3",
      bestTime: "morning",
      focus: "scattered",
      distraction: "phone",
      motivation: "family",
      challenge: "revision",
    }));
    const second = generateReport(answers({
      exam: "NEET",
      studyHours: "9plus",
      bestTime: "night",
      focus: "steady",
      distraction: "fatigue",
      motivation: "curiosity",
      challenge: "tests",
    }));

    expect(first.discoveryProfile?.title).not.toBe(second.discoveryProfile?.title);
    expect(first.discoveryProfile?.tags).toHaveLength(3);
    expect(second.discoveryProfile?.tags).toHaveLength(3);
    expect(first.discoveryProfile?.tagline).not.toBe(second.discoveryProfile?.tagline);
    expect(first.discoveryProfile?.insight).not.toEqual(second.discoveryProfile?.insight);
    expect(first.personalPlan).not.toEqual(second.personalPlan);
    expect(first.nextSteps).not.toEqual(second.nextSteps);
    expect(first.studyPatterns).not.toEqual(second.studyPatterns);
  });

  it("creates distinct generic insight titles for all challenge/distraction pairs", () => {
    const titles = new Set<string>();
    const challenges = ["revision", "consistency", "doubts", "tests"] as const;
    const distractions = ["phone", "people", "overthinking", "fatigue"] as const;

    for (const challenge of challenges) {
      for (const distraction of distractions) {
        // Keep other answers fixed so this checks variation across every
        // challenge/distraction pairing, including any dedicated insight rules.
        const report = generateReport(answers({
          studyHours: "3to6",
          bestTime: "evening",
          focus: "steady",
          motivation: "dream",
          exam: "Other",
          challenge,
          distraction,
        }));
        titles.add(report.discoveryProfile!.insight.title);
      }
    }

    expect(titles.size).toBe(16);
  });
});
