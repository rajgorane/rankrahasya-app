import { z } from "zod";

/** Fixed price. Server code must use this constant — never a client value. */
export const PRICE_PAISE = 1000;
export const PRICE_LABEL = "₹10";

export const answersSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter a first name or nickname")
    .max(30, "Keep it under 30 characters")
    .regex(/^[\p{L} .'-]+$/u, "Letters and spaces only"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose your birth date")
    .refine((v) => {
      const [year, month, day] = v.split("-").map(Number);
      const d = new Date(Date.UTC(year!, month! - 1, day!));
      const isRealDate =
        d.getUTCFullYear() === year &&
        d.getUTCMonth() === month! - 1 &&
        d.getUTCDate() === day;
      const today = new Date();
      const cutoff = new Date(Date.UTC(today.getUTCFullYear() - 16, today.getUTCMonth(), today.getUTCDate()));
      return isRealDate && d.getTime() <= cutoff.getTime();
    }, "You must be at least 16 years old"),
  exam: z.enum(["JEE", "NEET", "Other"]),
  studyHours: z.enum(["lt3", "3to6", "6to9", "9plus"]),
  bestTime: z.enum(["morning", "afternoon", "evening", "night"]),
  focus: z.enum(["scattered", "variable", "steady"]),
  distraction: z.enum(["phone", "people", "overthinking", "fatigue"]),
  motivation: z.enum(["family", "dream", "curiosity", "proving"]),
  challenge: z.enum(["revision", "consistency", "doubts", "tests"]),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept to continue" }) }),
});

export type Answers = z.infer<typeof answersSchema>;

export type Report = {
  name: string;
  exam: Answers["exam"];
  theme: { sign: string; element: string; keyword: string };
  selfReflection: string[];
  strengths: string[];
  studyPatterns: string[];
  nextSteps: { title: string; detail: string }[];
};

const SIGNS: { sign: string; element: string; keyword: string; from: [number, number] }[] = [
  { sign: "Capricorn", element: "Earth", keyword: "steady climb", from: [12, 22] },
  { sign: "Aquarius", element: "Air", keyword: "original thinking", from: [1, 20] },
  { sign: "Pisces", element: "Water", keyword: "quiet intuition", from: [2, 19] },
  { sign: "Aries", element: "Fire", keyword: "bold starts", from: [3, 21] },
  { sign: "Taurus", element: "Earth", keyword: "patient building", from: [4, 20] },
  { sign: "Gemini", element: "Air", keyword: "curious connections", from: [5, 21] },
  { sign: "Cancer", element: "Water", keyword: "protective care", from: [6, 21] },
  { sign: "Leo", element: "Fire", keyword: "warm confidence", from: [7, 23] },
  { sign: "Virgo", element: "Earth", keyword: "careful refinement", from: [8, 23] },
  { sign: "Libra", element: "Air", keyword: "balanced judgement", from: [9, 23] },
  { sign: "Scorpio", element: "Water", keyword: "deep focus", from: [10, 23] },
  { sign: "Sagittarius", element: "Fire", keyword: "big-picture drive", from: [11, 22] },
];

/** Tropical sun-season from birth date only (no time/place, no chart). */
export function sunSeason(birthDate: string) {
  const [, m = 1, d = 1] = birthDate.split("-").map(Number);
  const md = m * 100 + d;
  // Capricorn (SIGNS[0]) wraps Dec 22 – Jan 19, so it is the default.
  let found = SIGNS[0]!;
  for (const s of SIGNS.slice(1)) if (md >= s.from[0] * 100 + s.from[1]) found = s;
  if (md >= 1222) found = SIGNS[0]!;
  return { sign: found.sign, element: found.element, keyword: found.keyword };
}

const ELEMENT_REFLECTION: Record<string, string> = {
  Fire: "Fire-season themes are traditionally linked with momentum and courage. Ask yourself: do you start strong and then need help sustaining pace?",
  Earth: "Earth-season themes are traditionally linked with structure and patience. Ask yourself: do routines comfort you, and does change unsettle your rhythm?",
  Air: "Air-season themes are traditionally linked with ideas and connections. Ask yourself: do you understand concepts quickly but drift when practice gets repetitive?",
  Water: "Water-season themes are traditionally linked with feeling and intuition. Ask yourself: does your mood shape how well a study day goes?",
};

const HOURS_TEXT: Record<Answers["studyHours"], string> = {
  lt3: "You currently study under 3 focused hours a day. That is a real starting point — the gain now comes from consistency, not from sudden long days.",
  "3to6": "You study 3–6 hours a day. This is a workable base; quality of those hours (active recall, timed practice) will matter more than adding more.",
  "6to9": "You study 6–9 hours a day. Your effort is substantial; watch for diminishing returns in the last hours and protect sleep.",
  "9plus": "You report 9+ hours a day. That is a heavy load — burnout risk is real, so planned rest is part of the strategy, not a break from it.",
};

const TIME_TEXT: Record<Answers["bestTime"], string> = {
  morning: "You feel sharpest in the morning — reserve it for your hardest new concepts or full-length problem sets.",
  afternoon: "You feel sharpest in the afternoon — schedule tough practice right after lunch-slump recovery, around 2–5 pm.",
  evening: "You feel sharpest in the evening — use it for problem-solving, and keep mornings for lighter revision.",
  night: "You feel sharpest at night — fine, but anchor a fixed sleep window so your mock-test timing (usually daytime) doesn't suffer.",
};

const FOCUS_TEXT: Record<Answers["focus"], string> = {
  scattered: "You describe your focus as often scattered. Short, timed blocks (25–40 minutes) with one clear goal each are likely to suit you better than long sessions.",
  variable: "Your focus varies day to day. Tracking which days go well — sleep, food, phone use — can reveal a pattern you can design around.",
  steady: "You describe your focus as mostly steady. Use that by taking on longer, uninterrupted mock tests to build exam stamina.",
};

const DISTRACTION_TEXT: Record<Answers["distraction"], string> = {
  phone: "Your main distraction is your phone. Physical distance (another room, a locked box during study blocks) beats willpower.",
  people: "People and surroundings pull you away. A fixed study spot and a visible 'do not disturb' signal can reduce interruptions.",
  overthinking: "Overthinking is your main distraction. A two-minute 'worry dump' on paper before studying can clear mental space.",
  fatigue: "Fatigue is your main obstacle. Sleep, water and a short walk often lift focus more than an extra hour at the desk.",
};

const STRENGTH_BY_MOTIVATION: Record<Answers["motivation"], string> = {
  family: "A sense of responsibility towards people who support you — a deep source of persistence when it feels like care rather than pressure.",
  dream: "A clear picture of the future you want — this gives direction when daily work feels repetitive.",
  curiosity: "Genuine curiosity about how things work — the kind of motivation that tends to last longest.",
  proving: "A drive to prove what you can do — powerful fuel, best paired with self-kindness after setbacks.",
};

const STRENGTH_BY_FOCUS: Record<Answers["focus"], string> = {
  scattered: "Honesty about where you struggle — self-awareness is the first step to a better system.",
  variable: "Adaptability — you can still get work done on uneven days.",
  steady: "Sustained attention — a real advantage for long exam papers.",
};

const STEP_BY_CHALLENGE: Record<Answers["challenge"], { title: string; detail: string }> = {
  revision: {
    title: "Build a spaced-revision loop",
    detail: "Revise each new topic on day 1, day 3, day 7 and day 21. Keep a one-page summary per chapter to make revision fast.",
  },
  consistency: {
    title: "Shrink the minimum day",
    detail: "Define a 'minimum day' you can do even when tired (e.g. 30 problems + 1 revision sheet). Never skip the minimum; extra is a bonus.",
  },
  doubts: {
    title: "Batch your doubts",
    detail: "Keep a running doubt list. Spend 10 minutes trying each one yourself, then clear the rest with a teacher or peer once a day.",
  },
  tests: {
    title: "Analyse every mock for 30 minutes",
    detail: "After each test, sort mistakes into concept, calculation and time-pressure. Fix the biggest category first next week.",
  },
};

const EXAM_STEP: Record<Answers["exam"], { title: string; detail: string }> = {
  JEE: {
    title: "Protect one timed problem block daily",
    detail: "Solve a mixed set of Physics, Chemistry and Maths questions under a timer each day to train switching between subjects.",
  },
  NEET: {
    title: "Read NCERT actively every day",
    detail: "Spend a daily block on NCERT Biology line-by-line with self-made questions; pair it with timed MCQ sets.",
  },
  Other: {
    title: "Map the syllabus on one page",
    detail: "Write every topic of your exam on a single sheet and mark confidence (red/amber/green). Review it every Sunday.",
  },
};

/** Deterministic, rules-based report. Same answers always produce the same report. */
export function generateReport(a: Answers): Report {
  const theme = sunSeason(a.birthDate);
  const name = a.name.trim();
  return {
    name,
    exam: a.exam,
    theme,
    selfReflection: [
      `${name}, you were born in the ${theme.sign} season — ${/^[AEIOU]/.test(theme.element) ? "an" : "a"} ${theme.element}-element period associated in astrological tradition with “${theme.keyword}”. Treat this only as a reflective lens, not a description of who you are.`,
      ELEMENT_REFLECTION[theme.element] ?? "",
      `You say your biggest driver is ${{ family: "your family", dream: "a dream you hold", curiosity: "curiosity", proving: "proving yourself" }[a.motivation]}. Notice when that driver energises you and when it starts to feel heavy.`,
    ],
    strengths: [
      STRENGTH_BY_MOTIVATION[a.motivation],
      STRENGTH_BY_FOCUS[a.focus],
      `The ${theme.element.toLowerCase()} theme of “${theme.keyword}” — if it resonates — can be a reminder of a quality you already want to grow.`,
    ],
    studyPatterns: [HOURS_TEXT[a.studyHours], TIME_TEXT[a.bestTime], FOCUS_TEXT[a.focus], DISTRACTION_TEXT[a.distraction]],
    nextSteps: [
      STEP_BY_CHALLENGE[a.challenge],
      EXAM_STEP[a.exam],
      {
        title: "Run a 7-day self-experiment",
        detail: `For one week, study your hardest subject during your ${a.bestTime} peak and note focus (1–5) after each session. Keep what works.`,
      },
    ],
  };
}

export const SAMPLE_ANSWERS: Answers = {
  name: "Aarav",
  birthDate: "2008-08-30",
  exam: "JEE",
  studyHours: "6to9",
  bestTime: "morning",
  focus: "variable",
  distraction: "phone",
  motivation: "dream",
  challenge: "tests",
  consent: true,
};