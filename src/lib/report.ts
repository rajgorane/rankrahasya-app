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
      const minAllowed = new Date(Date.UTC(today.getUTCFullYear() - 70, today.getUTCMonth(), today.getUTCDate()));
      const maxAllowed = new Date(Date.UTC(today.getUTCFullYear() - 16, today.getUTCMonth(), today.getUTCDate()));
      const iso = (date: Date) => date.toISOString().slice(0, 10);
      return isRealDate && v >= iso(minAllowed) && v <= iso(maxAllowed);
    }, "You must be between 16 and 70 years old"),
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
  personalSnapshot: string[];
  personalPlan: { title: string; detail: string }[];
  nextSteps: { title: string; detail: string }[];
  /** Optional for compatibility with reports created before this feature. */
  discoveryProfile?: {
    title: string;
    tagline: string;
    tags: { label: string; detail: string }[];
    insight: { title: string; observation: string; alternative: string; experiment: string };
  };
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

function buildPersonalSnapshot(a: Answers): string[] {
  const effortFocus =
    a.studyHours === "9plus" && a.focus === "scattered"
      ? "You report long study days but scattered focus. Your best experiment is not to add more hours: protect two distraction-free blocks and measure completed questions instead."
      : a.studyHours === "lt3" && a.focus === "steady"
        ? "You report steady focus but fewer than three focused hours. That suggests your first experiment could be to extend one existing focused block by 15 minutes, rather than redesigning your whole day."
        : a.studyHours === "6to9" && a.focus === "variable"
          ? "You report substantial study time with focus that varies. Compare your best and worst sessions for sleep, task difficulty and phone access before changing your total hours."
          : a.studyHours === "9plus"
            ? "You report 9+ focused hours. Protect sleep and recovery; judge the day by learning and error correction, not by stretching the timetable further."
            : a.studyHours === "lt3"
              ? "You report under three focused hours. Start with a repeatable baseline you can keep for seven days before increasing the workload."
              : a.focus === "scattered"
                ? "You report scattered focus. Use short, single-task blocks and make the phone or your main distraction physically harder to reach."
                : a.focus === "steady"
                  ? "You report mostly steady focus. Use that strength for timed practice, then review mistakes while the reasoning is still fresh."
                  : "You report focus that varies. Track the conditions around two good and two difficult sessions to identify a change you can actually control.";
  const challengeDistraction: Record<Answers["challenge"], Record<Answers["distraction"], string>> = {
    revision: {
      phone: "Because revision is your main challenge and your phone is the main distraction, put the phone away and finish one closed-book recall sheet before checking messages.",
      people: "Because revision is your main challenge and your surroundings interrupt you, choose one predictable quiet slot and finish a small recall target before moving on.",
      overthinking: "Because revision is your main challenge and overthinking gets in the way, write down distracting thoughts, then test recall from memory before rereading notes.",
      fatigue: "Because revision is your main challenge and tiredness gets in the way, place recall practice in your sharper time window and use shorter reviews when energy is low.",
    },
    consistency: {
      phone: "For consistency, define a small minimum task before opening your phone; keep the phone out of reach until that task is done.",
      people: "For consistency, set a fixed start time and tell people your first study block is protected; make the minimum task small enough to finish on a difficult day.",
      overthinking: "For consistency, write the next physical action on paper before you begin. Your goal is to start the first 10 minutes, not solve the whole day in your head.",
      fatigue: "For consistency, set a realistic minimum for low-energy days and protect sleep rather than relying on a late-night catch-up session.",
    },
    doubts: {
      phone: "For clearing doubts, keep a doubt list on paper and attempt each item before using your phone to search for a solution.",
      people: "For clearing doubts, collect questions during study and book a predictable slot with a teacher or peer instead of waiting for interruptions to resolve them.",
      overthinking: "For clearing doubts, write what you know, identify the exact missing step, and ask one precise question rather than repeatedly circling the whole problem.",
      fatigue: "For clearing doubts, mark difficult questions and return to them in your sharper time window; do not confuse tiredness with not understanding.",
    },
    tests: {
      phone: "For mock-test improvement, keep the phone away during the test and its review; classify each error before looking at solutions.",
      people: "For mock-test improvement, protect the test and review window from interruptions so you can identify whether errors came from concepts, calculation or timing.",
      overthinking: "For mock-test improvement, label each error by cause and choose one correction. Avoid turning one poor question into a judgement about your ability.",
      fatigue: "For mock-test improvement, take the test when reasonably rested and review errors in a separate focused block rather than forcing a long review while exhausted.",
    },
  };
  return [effortFocus, challengeDistraction[a.challenge][a.distraction]];
}

function buildPersonalPlan(a: Answers): { title: string; detail: string }[] {
  const hours = {
    lt3: "Keep the first target small: one 25-minute block, a short break, then continue only if your energy allows.",
    "3to6": "Use two or three focused blocks and finish each with a visible output: solved questions, recalled facts, or corrected errors.",
    "6to9": "Do your two most demanding tasks first. Use remaining time for retrieval and corrections, and compare the quality of early and late blocks.",
    "9plus": "Set a stopping time and protect sleep. Track what you retain rather than extending an already long study day.",
  }[a.studyHours];
  const timing = {
    morning: "Schedule the hardest task in your morning peak before messages or routine work.",
    afternoon: "Use your afternoon peak for difficult questions; prepare the exact task before that window starts.",
    evening: "Choose the task before your evening peak so the session begins with work, not planning.",
    night: "Use your night-time peak for planned study, while keeping sleep steady and practising some exam-style work in daytime.",
  }[a.bestTime];
  const friction = {
    phone: "Leave your phone in another room until the block ends, then check it during a planned break.",
    people: "Tell people your study block's start and end time, and use the same quieter spot where possible.",
    overthinking: "Write the next physical action on paper and park unrelated thoughts for later; start before trying to solve everything mentally.",
    fatigue: "Before adding hours, check sleep and breaks. If tiredness persists, shorten the block and review whether your energy improves.",
  }[a.distraction];
  const focusAdjustment = {
    scattered: "Use a single task and a timer; record whether you finished it before switching.",
    variable: "Repeat the same task format across three sessions and note sleep, interruptions and accuracy to find what changes.",
    steady: "Keep the structure that supports your focus and use one block for timed, uninterrupted practice.",
  }[a.focus];
  const challengeAction = {
    revision: "Close the book and write five key points from memory, then check and correct the gaps.",
    consistency: "Set a ten-minute minimum for the session. Mark whether you started, even if you did not complete the full plan.",
    doubts: "Choose one unresolved question, write the exact step where you get stuck, and ask a precise question about that step.",
    tests: "Review the last practice set and choose the single most repeated error type to target in your next set.",
  }[a.challenge];
  const motivationCue = {
    family: "Treat the session as a promise to your process, not a measure of what you owe anyone.",
    dream: "Connect the session to one small, measurable step towards your longer-term goal.",
    curiosity: "Ask yourself why the method works, then explain it without looking at the solution.",
    proving: "Use the challenge as a cue to practise; do not use one result as a verdict on your ability.",
  }[a.motivation];
  return [
    { title: `Your ${a.bestTime} anchor`, detail: `${timing} ${hours}` },
    { title: "Make focus easier", detail: `${friction} ${focusAdjustment}` },
    { title: `Your ${a.challenge === "revision" ? "recall" : a.challenge === "consistency" ? "restart" : a.challenge === "doubts" ? "doubt-clearing" : "test-review"} move`, detail: `${challengeAction} ${motivationCue}` },
  ];
}

/**
 * Builds a concise, evidence-linked profile from combinations of the student's own answers.
 * These are reflective hypotheses, not validated psychological assessments.
 */
function buildDiscoveryProfile(a: Answers): NonNullable<Report["discoveryProfile"]> {
  const identity = {
    phone: {
      scattered: ["The Focus-Block Architect", "You are working with two friction points: attention that wanders and a phone close at hand."],
      variable: ["The Attention Tuner", "Your focus varies, and your phone may be one condition worth testing rather than blaming yourself."],
      steady: ["The Protected-Focus Planner", "You report steady focus; protecting it from phone interruptions may help preserve your strongest sessions."],
    },
    people: {
      scattered: ["The Quiet-Space Seeker", "Your answers point to both environmental interruptions and focus that can drift."],
      variable: ["The Environment Designer", "Your focus varies, and your surroundings may be one part of the pattern to investigate."],
      steady: ["The Boundary Keeper", "You report steady focus, so a predictable study space may help you protect that advantage."],
    },
    overthinking: {
      scattered: ["The Thought-to-Action Builder", "You report scattered focus and overthinking; a small written next step may help turn thought into action."],
      variable: ["The Mental-Clarity Seeker", "Your focus varies, and you identify overthinking as a distraction worth experimenting with."],
      steady: ["The Deliberate Problem-Solver", "You report steady focus, but overthinking can still consume time; use a clear stopping rule when stuck."],
    },
    fatigue: {
      scattered: ["The Energy-Aware Learner", "You report both scattered focus and fatigue, so energy and recovery deserve attention alongside study technique."],
      variable: ["The Rhythm Finder", "Your focus varies and fatigue is a challenge; tracking energy across the day may reveal a useful pattern."],
      steady: ["The Sustainable Performer", "You report steady focus but also fatigue; protecting recovery may help you sustain that focus."],
    },
  }[a.distraction][a.focus];

  const challengeTag: Record<Answers["challenge"], { label: string; detail: string }> = {
    revision: { label: "The Recall Builder", detail: "Try closed-book recall before rereading. Track which facts you can retrieve without notes." },
    consistency: { label: "The Restart Designer", detail: "Set a five-to-ten-minute minimum task for difficult days. Measure how often it helps you restart." },
    doubts: { label: "The Doubt Unblocker", detail: "Write the exact step you cannot explain, attempt it briefly, then ask a focused question." },
    tests: { label: "The Error Investigator", detail: "After a test, label errors as concept, calculation, or timing. Pick the most frequent category to work on next." },
  };
  const motivationTag: Record<Answers["motivation"], { label: string; detail: string }> = {
    family: { label: "The Care-Fuelled Striver", detail: "Let support from family give direction, while setting goals that are also meaningful to you." },
    dream: { label: "The Future-Driven Builder", detail: "Connect one daily task to your longer-term goal, then judge progress by actions you control." },
    curiosity: { label: "The Why-Seeker", detail: "Turn curiosity into retrieval practice: explain why a method works without looking at the solution." },
    proving: { label: "The Challenge Channeler", detail: "Use the urge to prove yourself to start a practice block, not to judge your worth by one result." },
  };
  const hoursTag: Record<Answers["studyHours"], { label: string; detail: string }> = {
    lt3: { label: "The Small-Wins Starter", detail: "Keep a realistic baseline for seven days before increasing hours; consistency is easier to assess than one intense day." },
    "3to6": { label: "The Quality-Hours Optimiser", detail: "Track completed questions or recall, not only time at the desk, for three sessions." },
    "6to9": { label: "The Effort-to-Outcome Auditor", detail: "Compare your first and last study blocks to see when effort still translates into learning." },
    "9plus": { label: "The Recovery Strategist", detail: "Check sleep and retention as well as hours; don't increase workload unless the evidence supports it." },
  };

  let insight: NonNullable<Report["discoveryProfile"]>["insight"];
  if (a.studyHours === "9plus" && a.focus !== "steady") {
    insight = {
      title: "A useful tension to investigate: effort versus usable focus",
      observation: "You report long study days, but your focus is not consistently steady. That does not mean your effort is wasted; it suggests the quality and timing of blocks may deserve as much attention as their length.",
      alternative: "The variation could also come from difficult topics, sleep, health, or interruptions—not simply from how you study.",
      experiment: "Across three sessions, record focused minutes and what you can recall or solve afterwards. Compare the results before changing your timetable.",
    };
  } else if (a.studyHours === "lt3" && a.focus === "steady") {
    insight = {
      title: "A possibility: your bottleneck may be time, not focus",
      observation: "You report relatively steady focus but fewer than three study hours. If those answers reflect a typical week, extending one successful block may be a more manageable experiment than rebuilding your whole routine.",
      alternative: "Your available time, school schedule, sleep, or responsibilities may limit study hours; those constraints matter too.",
      experiment: "For three days, add just 15 minutes to one focused session and note whether concentration and recall remain similar.",
    };
  } else if (a.challenge === "tests" && a.distraction === "overthinking") {
    insight = {
      title: "Check whether reviewing mistakes turns into self-judgement",
      observation: "You named tests as your hardest area and overthinking as a distraction. One possibility is that analysing a mistake sometimes takes more energy than deciding what to practise next.",
      alternative: "The real obstacle could be a content gap or test strategy rather than overthinking.",
      experiment: "After your next practice test, classify each error and write one corrective action. Limit the review to a planned time, then check whether the next practice improves.",
    };
  } else if (a.challenge === "consistency" && a.motivation === "proving") {
    insight = {
      title: "A possibility: high standards make restarting feel heavier",
      observation: "You selected consistency as a challenge and proving yourself as a motivator. It may be worth checking whether a missed day feels like more than a missed day—and makes the next start harder.",
      alternative: "Consistency can also be affected by an unrealistic timetable, tiredness, or competing responsibilities.",
      experiment: "Choose a five-minute minimum task for one week. After a missed session, do only that minimum and note whether it helps you restart sooner.",
    };
  } else if (a.bestTime === "night" && a.exam !== "Other") {
    insight = {
      title: "Your preferred rhythm and exam conditions may differ",
      observation: "You feel sharpest at night, while your exam practice may need to prepare you for daytime performance. This is a scheduling question to test, not a flaw in your natural rhythm.",
      alternative: "Your night preference may reflect your current routine rather than an unchangeable body clock.",
      experiment: "Keep sleep consistent and schedule two short daytime timed-practice sessions this week. Compare alertness and accuracy without sacrificing rest.",
    };
  } else {
    const challengeName = {
      revision: "revision and recall",
      consistency: "getting started consistently",
      doubts: "resolving difficult questions",
      tests: "learning from mock tests",
    }[a.challenge];
    const distractionName = {
      phone: "phone access",
      people: "interruptions from people or surroundings",
      overthinking: "thoughts that keep looping",
      fatigue: "low energy",
    }[a.distraction];
    const motivationFrame = {
      family: "Because supporting people matters to you, make the next step a promise to your process—not a judgement of your worth.",
      dream: "Because you are working towards a future goal, connect the next task to progress you can actually measure today.",
      curiosity: "Because curiosity drives you, turn the obstacle into a question you can investigate rather than a label about yourself.",
      proving: "Because proving yourself matters to you, use the challenge as a cue to practise—not as evidence you must be perfect.",
    }[a.motivation];
    const focusFrame = {
      scattered: "Since you report scattered focus, make the experiment short and remove one source of friction before you begin.",
      variable: "Since your focus varies, compare more than one session before deciding what the pattern means.",
      steady: "Since you report steady focus, keep the structure that works and test whether a small adjustment improves the result.",
    }[a.focus];
    const effortFrame = {
      lt3: "With under three focused hours reported, test a small repeatable block rather than a bigger timetable.",
      "3to6": "With 3–6 focused hours reported, look for a better return from an existing block before adding more time.",
      "6to9": "With 6–9 focused hours reported, compare the quality of your earlier and later work instead of assuming every hour helps equally.",
      "9plus": "With 9+ focused hours reported, check retention and recovery before considering any increase in workload.",
    }[a.studyHours];
    const challengeQuestion = {
      revision: "Can you retrieve the idea without notes, rather than only recognising it while rereading?",
      consistency: "What is the smallest useful action you can still complete on a difficult day?",
      doubts: "Can you name the exact step where your reasoning stops, instead of marking the whole topic as unclear?",
      tests: "Which error category repeats most often: concept, calculation, or time management?",
    }[a.challenge];
    const experimentAction = {
      revision: "close your notes and write what you remember before checking gaps",
      consistency: "start with a ten-minute minimum task and record whether you continue",
      doubts: "write the exact stuck step, attempt it, then ask one focused question",
      tests: "classify each error and choose one correction for the next practice set",
    }[a.challenge];
    insight = {
      title: `Test the link between ${challengeName} and ${distractionName}`,
      observation: `You named ${challengeName} as your main challenge and ${distractionName} as a distraction. ${focusFrame} The useful question is: ${challengeQuestion}`,
      alternative: `${motivationFrame} This is only a hypothesis from your answers; topic difficulty, sleep, schedule and support can also affect the pattern.`,
      experiment: `For three sessions, ${experimentAction}. Keep your usual study time around the ${a.bestTime} window and record what you completed, not just how long you sat down. ${effortFrame}`,
    };
  }

  const timeTag: Record<Answers["bestTime"], { label: string; detail: string }> = {
    morning: { label: "The Morning Momentum", detail: "Use your sharper morning window for one task with a clear finish line, then check whether recall is better than later sessions." },
    afternoon: { label: "The Afternoon Strategist", detail: "Reserve your reported high-energy window for active problem-solving and compare accuracy with another time slot." },
    evening: { label: "The Evening Builder", detail: "Prepare the task before your evening focus window begins so you can spend that energy on practice, not deciding what to do." },
    night: { label: "The Night-Rhythm Planner", detail: "Protect sleep while testing your night-time focus; include some daytime timed practice if your exam takes place then." },
  };
  const examTag: Record<Answers["exam"], { label: string; detail: string }> = {
    JEE: { label: "The Problem-Solving Trainee", detail: "Build fluency by solving mixed Physics, Chemistry and Maths questions, then review the exact step where your reasoning broke." },
    NEET: { label: "The Recall-and-Accuracy Builder", detail: "Combine active NCERT recall with timed MCQs and maintain a short list of facts or concepts you repeatedly miss." },
    Other: { label: "The Syllabus Mapper", detail: "Break your syllabus into visible topics, mark confidence honestly, and choose the weakest high-priority area for the next session." },
  };
  const signaturePair: Record<Answers["motivation"], Record<Answers["challenge"], string>> = {
    family: {
      revision: "The Promise-to-Progress Keeper",
      consistency: "The Steady Commitment Builder",
      doubts: "The Support-Seeking Problem Solver",
      tests: "The Responsible Test Analyst",
    },
    dream: {
      revision: "The Future-Focused Reviser",
      consistency: "The Dream-to-Routine Builder",
      doubts: "The Curious Doubt Chaser",
      tests: "The Goal-Driven Error Analyst",
    },
    curiosity: {
      revision: "The Concept Connector",
      consistency: "The Curiosity-to-Consistency Builder",
      doubts: "The Question-First Explorer",
      tests: "The Mistake-to-Discovery Learner",
    },
    proving: {
      revision: "The Quiet Progress Prover",
      consistency: "The Comeback Architect",
      doubts: "The Determined Gap Closer",
      tests: "The Challenge-to-Strategy Learner",
    },
  };
  const tags = [
    challengeTag[a.challenge],
    {
      ...timeTag[a.bestTime],
      detail: `${timeTag[a.bestTime].detail} Your reported focus is ${({ scattered: "scattered", variable: "variable", steady: "steady" } as const)[a.focus]}, so ${({ phone: "put your phone out of reach", people: "protect this slot from interruptions", overthinking: "write the next action before starting", fatigue: "check your energy and recovery first" } as const)[a.distraction]}.`,
    },
    {
      ...hoursTag[a.studyHours],
      detail: `${hoursTag[a.studyHours].detail} ${({ family: "Let family support encourage you without turning study into guilt.", dream: "Link the session to one measurable step toward your goal.", curiosity: "Use a why-question to make the practice more engaging.", proving: "Measure progress by practice and learning, not by self-worth." } as const)[a.motivation]} For ${a.exam === "Other" ? "your exam" : a.exam}, use the relevant syllabus and question format.`,
    },
  ];
  // Titles and tags use multiple answer dimensions; the same answer set stays stable,
  // while changing the student's responses changes the resulting profile.
  return {
    title: `${signaturePair[a.motivation][a.challenge]} · ${identity[0]}`,
    tagline: `${identity[1]} You report ${({ lt3: "under 3", "3to6": "3–6", "6to9": "6–9", "9plus": "9+" } as const)[a.studyHours]} focused study hours, feel sharpest in the ${a.bestTime}, and are preparing for ${a.exam === "Other" ? "your chosen exam" : a.exam}. Your main challenge is ${({ revision: "revision", consistency: "consistency", doubts: "clearing doubts", tests: "mock tests" } as const)[a.challenge]}, and you say ${({ phone: "your phone", people: "your surroundings", overthinking: "overthinking", fatigue: "fatigue" } as const)[a.distraction]} most often gets in the way. Treat this as a starting hypothesis to test, not a fixed label.`,
    tags,
    insight,
  };
}

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
    personalSnapshot: buildPersonalSnapshot(a),
    personalPlan: buildPersonalPlan(a),
    discoveryProfile: buildDiscoveryProfile(a),
    nextSteps: [
      {
        title: ({
          revision: "Test your recall before rereading",
          consistency: "Create a restart rule",
          doubts: "Turn one doubt into a precise question",
          tests: "Find the pattern in your errors",
        } as const)[a.challenge],
        detail: ({
          revision: `At your ${a.bestTime} peak, write five points from memory before opening notes. Use this for a topic you studied recently.`,
          consistency: `On low-energy days, complete a ten-minute minimum at your ${a.bestTime} study time. Track starts across seven days, not just perfect days.`,
          doubts: `Choose one question in ${a.exam === "Other" ? "your subject" : a.exam}, attempt it for ten minutes, and record the exact step you cannot justify.`,
          tests: `After your next practice set, classify errors as concept, calculation, or timing. Choose one category for the next session.`,
        } as const)[a.challenge],
      },
      {
        title: ({
          JEE: "Practise mixed PCM under exam conditions",
          NEET: "Combine NCERT recall with timed MCQs",
          Other: "Prioritise one high-value syllabus gap",
        } as const)[a.exam],
        detail: `${({
          JEE: "Mix Physics, Chemistry and Maths questions and write down why each wrong option or step failed.",
          NEET: "Recall Biology facts without notes, then use timed MCQs to check accuracy and recurring gaps.",
          Other: "Choose a topic that is both important and uncertain, attempt exam-style questions, and update your confidence after checking.",
        } as const)[a.exam]} ${({
          phone: "Keep your phone out of the room during the set.",
          people: "Choose a time and place where interruptions are less likely.",
          overthinking: "Set a review limit and write one correction instead of replaying every mistake.",
          fatigue: "Take the set when reasonably rested rather than using exhausted hours.",
        } as const)[a.distraction]}`,
      },
      {
        title: "Run a personal 7-day check",
        detail: `For seven days, track one ${a.challenge === "revision" ? "closed-book recall result" : a.challenge === "consistency" ? "successful study start" : a.challenge === "doubts" ? "doubt resolved or precisely stated" : "error corrected"} during your ${a.bestTime} window. Since you report ${a.studyHours === "lt3" ? "under 3" : a.studyHours === "3to6" ? "3–6" : a.studyHours === "6to9" ? "6–9" : "9+"} study hours and ${a.focus} focus, keep the tracking lightweight. Use ${({
          family: "supportive encouragement",
          dream: "your longer-term goal",
          curiosity: "a question you genuinely want to answer",
          proving: "practice progress rather than perfection",
        } as const)[a.motivation]} as your reminder to return to the plan.`,
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