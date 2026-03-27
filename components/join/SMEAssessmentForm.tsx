"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

/* ─── DATA ─── */

interface Option {
  text: string;
  points: number;
}

interface Question {
  id: string;
  text: string;
  sectionIdx: number;
  threshold?: number;
  triggerMessage?: string;
  triggerLink?: string;
  options: Option[];
}

interface Section {
  id: string;
  title: string;
  weight: number;
  maxPts: number;
  tip: string;
  feedback: { high: string; mid: string; low: string; lowThreshold: number; midThreshold: number };
  courseLink: string;
  courseLinkLabel: string;
  courseScoreThreshold: number;
}

/** Fallback when no dedicated course URL exists (content spec) */
const LIBRARY_URL = "https://agdil.com/library/";
const MSME_BOOK_PDF =
  "http://ikore.org/Agdil/wp-content/uploads/2025/05/MSME-BOOK-FINAL-1-4.pdf";

const sections: Section[] = [
  {
    id: "A",
    title: "Business Fundamentals",
    weight: 20,
    maxPts: 15,
    tip: "Lenders want to see that your business is real, documented, and separate from your personal life. These 3 questions help us check that.",
    feedback: {
      high: "Excellent! Your business is well-established and formally structured. Lenders will see this as a strong foundation.",
      mid: "Good progress! Completing your registration or separating accounts will strengthen your application.",
      low: "Your business has foundational gaps. We recommend the Business Basics short course before pursuing credit.",
      lowThreshold: 8,
      midThreshold: 13,
    },
    courseLink: LIBRARY_URL,
    courseLinkLabel: "Business Formalisation & Compliance Short Course",
    courseScoreThreshold: 8,
  },
  {
    id: "B",
    title: "Financial Records",
    weight: 30,
    maxPts: 15,
    tip: "Banks and lenders need proof that your business makes money and manages it well. These questions reveal your financial management strength \u2014 no accounting degree needed!",
    feedback: {
      high: "Strong financial records \u2014 you\u2019re in great shape. Lenders will trust your numbers.",
      mid: "You\u2019re on the right track. Improving your record-keeping consistency will make a big difference.",
      low: "Financial records are a top reason loans get rejected. Let\u2019s fix that first.",
      lowThreshold: 8,
      midThreshold: 13,
    },
    courseLink: LIBRARY_URL,
    courseLinkLabel: "Financial Record-Keeping for Agribusinesses",
    courseScoreThreshold: 10,
  },
  {
    id: "C",
    title: "Cash Flow & Repayment",
    weight: 25,
    maxPts: 15,
    tip: "A lender\u2019s biggest question is: \u2018Can this business repay?\u2019 Help us show them that you can.",
    feedback: {
      high: "Outstanding! You have strong repayment capacity \u2014 this is exactly what lenders want to see.",
      mid: "Decent cash position. Preparing a clearer loan proposal will push your score higher.",
      low: "Cash flow challenges could affect your repayment. Let\u2019s build a plan first.",
      lowThreshold: 8,
      midThreshold: 13,
    },
    courseLink: "http://ikore.org/Agdil/wp-content/uploads/2025/05/MSME-BOOK-FINAL-1-4.pdf",
    courseLinkLabel: "Loan Readiness & Business Planning",
    courseScoreThreshold: 10,
  },
  {
    id: "D",
    title: "Collateral & Support",
    weight: 15,
    maxPts: 10,
    tip: "Don\u2019t worry if you don\u2019t own land \u2014 there are loan products designed for businesses like yours. Let\u2019s see what support you have available.",
    feedback: {
      high: "You have strong collateral options \u2014 this significantly improves your loan eligibility.",
      mid: "Limited collateral, but group lending or documented assets can still open doors for you.",
      low: "No collateral? No problem yet. Let us show you collateral-free loan products available for agribusinesses.",
      lowThreshold: 4,
      midThreshold: 9,
    },
    courseLink: LIBRARY_URL,
    courseLinkLabel: "Cooperative Advantage & Group Finance",
    courseScoreThreshold: 4,
  },
  {
    id: "E",
    title: "Credit Character",
    weight: 10,
    maxPts: 10,
    tip: "Your reputation as a borrower matters, even outside formal banks. Your history with any kind of credit \u2014 cooperatives, suppliers \u2014 counts.",
    feedback: {
      high: "Excellent repayment character \u2014 this builds lender confidence in your reliability.",
      mid: "Some credit history. Continue building on time to strengthen your profile over the next 3\u20136 months.",
      low: "Past defaults are not the end \u2014 but you\u2019ll need to demonstrate recovery. A counsellor can help.",
      lowThreshold: 4,
      midThreshold: 9,
    },
    courseLink: LIBRARY_URL,
    courseLinkLabel: "Credit History & Recovery Resources",
    courseScoreThreshold: 4,
  },
];

const questions: Question[] = [
  // Section A
  {
    id: "A1", text: "How long has your business been operating?", sectionIdx: 0, threshold: 2,
    triggerMessage: "We recommend our Business Foundations course before applying for credit.",
    triggerLink: "https://ikore.org/Agdil/wp-content/uploads/2026/03/template-business-plan.doc",
    options: [
      { text: "Less than 1 year", points: 0 },
      { text: "1\u20132 years", points: 2 },
      { text: "3\u20135 years", points: 4 },
      { text: "More than 5 years", points: 5 },
    ],
  },
  {
    id: "A2", text: "Is your business formally registered (CAC)?", sectionIdx: 0, threshold: 2,
    triggerMessage: "Formal registration significantly improves credit eligibility.",
    triggerLink: "https://ikore.org/Agdil/cac-registration-form/",
    options: [
      { text: "No, not registered", points: 0 },
      { text: "Registration in progress", points: 2 },
      { text: "Yes, registered with up-to-date CAC returns", points: 5 },
    ],
  },
  {
    id: "A3", text: "Do you maintain a dedicated business bank account?", sectionIdx: 0, threshold: 2,
    options: [
      { text: "No bank account", points: 0 },
      { text: "Yes, but mixed with personal funds", points: 2 },
      { text: "Yes, exclusively for business use", points: 5 },
    ],
  },
  // Section B
  {
    id: "B1", text: "How do you track your income and expenses?", sectionIdx: 1, threshold: 3,
    triggerMessage: "We recommend starting with a simple cash book. Our Record-Keeping for Farmers course teaches you how.",
    options: [
      { text: "No records / memory only", points: 0 },
      { text: "Manual notebook or basic spreadsheet", points: 3 },
      { text: "Accounting software", points: 5 },
    ],
  },
  {
    id: "B2", text: "Can you show 6 months of business bank statements?", sectionIdx: 1, threshold: 3,
    options: [
      { text: "No statements available", points: 0 },
      { text: "Statements for some months only", points: 3 },
      { text: "Yes \u2014 full 6 months available", points: 5 },
    ],
  },
  {
    id: "B3", text: "What is your business\u2019s average annual revenue?", sectionIdx: 1,
    options: [
      { text: "Below \u20A61 million", points: 1 },
      { text: "\u20A61 million \u2013 \u20A65 million", points: 3 },
      { text: "\u20A65 million \u2013 \u20A620 million", points: 4 },
      { text: "Above \u20A620 million", points: 5 },
    ],
  },
  // Section C
  {
    id: "C1", text: "Does your business generate consistent positive cash flow?", sectionIdx: 2, threshold: 3,
    triggerMessage: "Consistent cash flow is critical for loan repayment.",
    options: [
      { text: "No \u2014 expenses regularly exceed income", points: 0 },
      { text: "Sometimes positive but seasonal", points: 3 },
      { text: "Yes \u2014 consistently positive", points: 5 },
    ],
  },
  {
    id: "C2", text: "Do you have a clear plan for how you\u2019ll use and repay the loan?", sectionIdx: 2, threshold: 2,
    options: [
      { text: "No \u2014 I haven\u2019t thought it through yet", points: 0 },
      { text: "Vague idea of the purpose", points: 2 },
      { text: "Clear purpose with repayment plan", points: 5 },
    ],
  },
  {
    id: "C3", text: "Do you have existing loans? If yes, what is your repayment record?", sectionIdx: 2,
    options: [
      { text: "Missed or defaulted on payments", points: 0 },
      { text: "No existing loans", points: 3 },
      { text: "Always paid on time", points: 5 },
    ],
  },
  // Section D
  {
    id: "D1", text: "Do you have assets that could serve as collateral?", sectionIdx: 3,
    options: [
      { text: "No assets available", points: 0 },
      { text: "Assets exist but ownership unclear", points: 2 },
      { text: "Clear title/documented ownership", points: 5 },
    ],
  },
  {
    id: "D2", text: "Are you part of a cooperative or farmer group?", sectionIdx: 3,
    options: [
      { text: "Not part of any group", points: 0 },
      { text: "Member but no lending scheme", points: 2 },
      { text: "Group lending access", points: 5 },
    ],
  },
  // Section E
  {
    id: "E1", text: "Have you taken a loan from a formal institution and repaid it?", sectionIdx: 4,
    options: [
      { text: "Yes but defaulted", points: 0 },
      { text: "No \u2014 first time borrower", points: 2 },
      { text: "Yes \u2014 repaid on time", points: 5 },
    ],
  },
  {
    id: "E2", text: "Have you used informal credit (supplier or cooperative)?", sectionIdx: 4,
    options: [
      { text: "No credit experience", points: 1 },
      { text: "Yes but had delays", points: 2 },
      { text: "Yes always paid on time", points: 5 },
    ],
  },
];

const TOTAL_MAX = 65;

interface RecommendedCourse {
  label: string;
  href: string;
}

interface FullRecommendation {
  intro: string;
  steps: string[];
  courses: RecommendedCourse[];
}

function getStarRating(pct: number) {
  if (pct >= 80) return { stars: 4, label: "Credit-Ready!", icon: "\uD83C\uDFC6", summary: "You\u2019re ready to apply. Let\u2019s match you to a lender." };
  if (pct >= 60) return { stars: 3, label: "Almost There", icon: "\uD83D\uDCC8", summary: "A few steps away. Fill identified gaps first." };
  if (pct >= 40) return { stars: 2, label: "Building Up", icon: "\uD83D\uDD27", summary: "Foundational work needed. Courses will help." };
  return { stars: 1, label: "Start Here", icon: "\uD83C\uDF31", summary: "Get support before applying. We\u2019re here to help." };
}

function getFullRecommendation(stars: number): FullRecommendation {
  if (stars === 4) {
    return {
      intro:
        "Congratulations! Your business shows strong credit readiness across all key dimensions. You have demonstrated the fundamentals that formal lenders look for.",
      steps: [
        "Explore our Marketplace to identify suitable products for your business size and sector.",
        "Prepare your loan application pack: business plan, 6-month bank statements, CAC certificate, and collateral documents.",
        "Consider our \u2018Scaling Your Agribusiness\u2019 long course to grow beyond your first credit cycle.",
      ],
      courses: [
        { label: "Scaling for Growth (Long Course)", href: LIBRARY_URL },
      ],
    };
  }
  if (stars === 3) {
    return {
      intro:
        "You\u2019re in a solid position \u2014 just a few gaps stand between you and a successful credit application. The good news is these gaps are fixable within 3\u20136 months.",
      steps: [
        "Complete or improve financial records \u2014 aim for 6 full months of bank statements.",
        "Document any collateral with clear proof of ownership.",
        "Write a clear loan purpose and repayment plan.",
      ],
      courses: [
        { label: "Loan Application Preparation (Short Course)", href: MSME_BOOK_PDF },
        { label: "Financial Records Bootcamp (Short Course)", href: LIBRARY_URL },
      ],
    };
  }
  if (stars === 2) {
    return {
      intro:
        "Your business has potential, but several critical foundations need attention before applying for a loan. Proceeding without these could result in rejection or over-indebtedness.",
      steps: [
        "Start keeping a simple cash book immediately (even a notebook counts).",
        "Open or regularise a dedicated business bank account.",
        "Explore joining a cooperative or farmer group with lending linkage.",
        "Re-take this assessment in 3 months after completing the recommended courses.",
      ],
      courses: [
        { label: "Business Fundamentals for Farmers (Short Course)", href: LIBRARY_URL },
        { label: "Cash Flow & Record Keeping (Short Course)", href: LIBRARY_URL },
        { label: "Cooperative Finance Explained (Short Course)", href: LIBRARY_URL },
      ],
    };
  }
  return {
    intro:
      "Every strong agribusiness started somewhere. Your score tells us you need foundational support before pursuing formal credit \u2014 and that\u2019s completely okay. We were built exactly for businesses at this stage.",
    steps: [
      "Start with our FREE \u2018Agribusiness Basics\u2019 short course \u2014 it takes under 2 hours.",
      "Connect with our business advisor for 1-on-1 guidance.",
      "Explore alternative support: input-credit schemes, grants, and cooperative savings.",
      "Retake this assessment in 6 months after building your foundation.",
    ],
    courses: [
      { label: "Agribusiness Basics (FREE Short Course)", href: LIBRARY_URL },
      { label: "Business Registration Guide", href: LIBRARY_URL },
      { label: "Savings & Cooperative Finance (Short Course)", href: LIBRARY_URL },
    ],
  };
}

/* ─── COMPONENT ─── */

type Phase = "question" | "section-feedback" | "results";

export default function SMEAssessmentForm() {
  const [phase, setPhase] = useState<Phase>("question");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(questions.length).fill(null),
  );
  const [animateStars, setAnimateStars] = useState(0);

  const q = questions[currentQ];
  const section = sections[q.sectionIdx];
  const progressPct = ((currentQ + 1) / questions.length) * 100;

  const isLastInSection = useMemo(() => {
    const nextQ = questions[currentQ + 1];
    return !nextQ || nextQ.sectionIdx !== q.sectionIdx;
  }, [currentQ, q.sectionIdx]);

  const sectionScore = useCallback(
    (sIdx: number) => {
      let total = 0;
      questions.forEach((qu, i) => {
        if (qu.sectionIdx === sIdx && answers[i] !== null) {
          total += qu.options[answers[i]!].points;
        }
      });
      return total;
    },
    [answers],
  );

  const totalRaw = useMemo(
    () => answers.reduce<number>((sum, a, i) => sum + (a !== null ? questions[i].options[a].points : 0), 0),
    [answers],
  );

  const totalPct = Math.round((totalRaw / TOTAL_MAX) * 100);
  const rating = getStarRating(totalPct);

  const selectedAnswer = answers[currentQ];
  const selectedPoints = selectedAnswer !== null ? q.options[selectedAnswer].points : null;
  const thresholdTriggered = q.threshold !== undefined && selectedPoints !== null && selectedPoints < q.threshold;

  function selectOption(idx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
  }

  function next() {
    if (selectedAnswer === null) return;
    if (isLastInSection) {
      setPhase("section-feedback");
    } else {
      setCurrentQ((c) => c + 1);
    }
  }

  function continueFromFeedback() {
    if (currentQ >= questions.length - 1) {
      setPhase("results");
    } else {
      setCurrentQ((c) => c + 1);
      setPhase("question");
    }
  }

  function prev() {
    if (currentQ > 0) setCurrentQ((c) => c - 1);
    setPhase("question");
  }

  function restart() {
    setAnswers(new Array(questions.length).fill(null));
    setCurrentQ(0);
    setPhase("question");
    setAnimateStars(0);
  }

  useEffect(() => {
    if (phase === "results") {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setAnimateStars(count);
        if (count >= rating.stars) clearInterval(interval);
      }, 350);
      return () => clearInterval(interval);
    }
  }, [phase, rating.stars]);

  /* ─── QUESTION SCREEN ─── */
  if (phase === "question") {
    return (
      <div className="mx-auto w-full max-w-[680px] font-[family-name:var(--font-jakarta)]">
        {/* Progress header */}
        <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_2px_8px_rgba(26,61,43,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#6b7e78]">{section.title}</span>
            <span className="text-[13px] font-bold text-[#247a4f]">
              Question {currentQ + 1} of {questions.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#f2f5f4]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #2a9e67, #32c47e)",
              }}
            />
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-[20px] bg-[#e6f7ef] px-3 py-1 text-xs font-bold text-[#247a4f]">
            Module {q.sectionIdx + 1} of 5: {section.title}
          </div>
        </div>

        {/* Section tip */}
        {questions.findIndex((x) => x.sectionIdx === q.sectionIdx) === currentQ && (
          <div className="mb-5 rounded-[16px] border border-[#e6f7ef] bg-[#f0faf5] px-5 py-4 text-[14px] leading-relaxed text-[#374a47]">
            <span className="mr-1 font-bold text-[#247a4f]">Tip:</span> {section.tip}
          </div>
        )}

        {/* Question card */}
        <div
          key={currentQ}
          className="mb-5 animate-[slideIn_0.3s_ease] rounded-[24px] bg-white p-7 shadow-[0_2px_8px_rgba(26,61,43,0.08)] max-md:p-5"
        >
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6b7e78]">
            Question {currentQ + 1}
          </div>

          {q.threshold !== undefined && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-[20px] bg-[#fef9ec] px-3 py-1 text-xs font-semibold text-[#a86200]">
              Critical Requirement
            </div>
          )}

          <div className="mb-7 text-[19px] font-bold leading-[1.45] text-[#1c2b2b] max-md:text-[17px]">
            {q.text}
          </div>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const selected = selectedAnswer === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectOption(i)}
                  className={`flex items-start gap-3.5 rounded-[16px] border-2 px-[18px] py-4 text-left transition-all ${
                    selected
                      ? "border-[#2a9e67] bg-[#f0faf5] shadow-[0_0_0_3px_rgba(42,158,103,0.12)]"
                      : "border-[#c4d0cc] bg-white hover:border-[#32c47e] hover:bg-[#f0faf5]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      selected ? "border-[#2a9e67] bg-[#2a9e67]" : "border-[#c4d0cc]"
                    }`}
                  >
                    {selected && <span className="block h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-[15px] font-medium leading-[1.4] text-[#374a47]">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Threshold warning */}
          {thresholdTriggered && q.triggerMessage && (
            <div className="mt-5 flex gap-3 rounded-[16px] border-2 border-[#f5a623] bg-[#fff3e0] px-5 py-4">
              <span className="shrink-0 text-xl">&#9888;&#65039;</span>
              <div>
                <p className="text-[14px] font-medium leading-relaxed text-[#7a4900]">
                  {q.triggerMessage}
                </p>
                {q.triggerLink && (
                  <a
                    href={q.triggerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[13px] font-semibold text-[#247a4f] underline"
                  >
                    Learn more &rarr;
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={prev}
            className={`max-w-[120px] flex-1 rounded-[16px] border-2 border-[#c4d0cc] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#374a47] transition-all hover:border-[#6b7e78] hover:bg-[#f2f5f4] ${
              currentQ === 0 ? "invisible" : ""
            }`}
          >
            &larr; Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={selectedAnswer === null}
            className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#1e5438] px-7 py-3.5 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#247a4f] disabled:cursor-not-allowed disabled:bg-[#c4d0cc]"
          >
            {currentQ === questions.length - 1 ? "Submit & View Results" : "Next"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {currentQ === questions.length - 1 ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <path d="M5 12h14M12 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ─── SECTION FEEDBACK ─── */
  if (phase === "section-feedback") {
    const secIdx = q.sectionIdx;
    const sec = sections[secIdx];
    const score = sectionScore(secIdx);
    const fb = sec.feedback;
    const message = score >= fb.midThreshold ? fb.high : score >= fb.lowThreshold ? fb.mid : fb.low;
    const pct = Math.round((score / sec.maxPts) * 100);
    const barColor = score >= fb.midThreshold ? "#2a9e67" : score >= fb.lowThreshold ? "#f5a623" : "#e05a5a";

    return (
      <div className="mx-auto w-full max-w-[680px] font-[family-name:var(--font-jakarta)]">
        <div className="rounded-[24px] bg-white p-8 shadow-[0_2px_8px_rgba(26,61,43,0.08)] max-md:p-5">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6b7e78]">
            Section {sec.id} Complete
          </div>
          <h3 className="mb-4 text-xl font-bold text-[#1c2b2b]">{sec.title}</h3>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#374a47]">Your score</span>
            <span className="text-[13px] font-bold" style={{ color: barColor }}>
              {score} / {sec.maxPts} ({pct}%)
            </span>
          </div>
          <div className="mb-6 h-2.5 overflow-hidden rounded-full bg-[#f2f5f4]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>

          <div
            className="rounded-[12px] p-5 text-[15px] font-medium leading-relaxed"
            style={{
              background: score >= fb.midThreshold ? "#f0faf5" : score >= fb.lowThreshold ? "#fef9ec" : "#fef2f2",
              color: score >= fb.midThreshold ? "#1a3d2b" : score >= fb.lowThreshold ? "#7a4900" : "#9b2020",
              borderLeft: `4px solid ${barColor}`,
            }}
          >
            {message}
          </div>

          {score < sec.courseScoreThreshold && (
            <a
              href={sec.courseLink}
              target={sec.courseLink.startsWith("http") ? "_blank" : undefined}
              rel={sec.courseLink.startsWith("http") ? "noopener noreferrer" : undefined}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-[#e6f7ef] px-4 py-2.5 text-[13px] font-bold text-[#247a4f] transition-all hover:bg-[#d0f0e0]"
            >
              <span className="text-base">&#128218;</span>
              {sec.courseLinkLabel} &rarr;
            </a>
          )}

          <button
            type="button"
            onClick={continueFromFeedback}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#1e5438] px-7 py-3.5 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#247a4f]"
          >
            {currentQ >= questions.length - 1 ? "View My Results" : "Continue to Next Section"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ─── RESULTS ─── */
  const reco = getFullRecommendation(rating.stars);

  const sectionScores = sections.map((s, i) => ({
    ...s,
    score: sectionScore(i),
    pct: Math.round((sectionScore(i) / s.maxPts) * 100),
  }));

  const strengths = sectionScores
    .filter((s) => s.pct >= 60)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2);

  const gaps = sectionScores
    .filter((s) => s.pct < 60)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-[800px] font-[family-name:var(--font-jakarta)]">
      {/* Rating header */}
      <div
        className="mb-6 grid items-center gap-6 rounded-[24px] p-8 text-white shadow-[0_16px_48px_rgba(26,61,43,0.16)] max-md:p-6"
        style={{
          background: "linear-gradient(135deg, #1a3d2b 0%, #247a4f 100%)",
          gridTemplateColumns: "1fr auto",
        }}
      >
        <div>
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-wider opacity-70">
            Your Credit Readiness Rating
          </div>
          <div className="mb-3 font-[family-name:var(--font-dm-serif)] text-[32px] max-md:text-2xl">
            {rating.label}
          </div>
          <div className="mb-4 flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className="text-[28px] transition-all duration-300"
                style={{
                  opacity: s <= animateStars ? 1 : 0.3,
                  fontSize: s <= animateStars ? "28px" : "22px",
                  filter: s <= animateStars ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
                }}
              >
                {s <= animateStars ? "\u2B50" : "\u2606"}
              </span>
            ))}
          </div>
          <div className="inline-flex items-baseline gap-1 rounded-full bg-white/15 px-[18px] py-2 backdrop-blur-sm">
            <span className="text-4xl font-extrabold">{totalPct}</span>
            <span className="text-base font-medium opacity-70">/ 100</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex h-[110px] w-[110px] flex-col items-center justify-center rounded-full border-[3px] border-white/30 bg-white/[0.12]">
            <span className="text-[38px] font-extrabold leading-none">{totalPct}</span>
            <span className="text-xs opacity-70">Score</span>
          </div>
        </div>
      </div>

      {/* Section breakdown + Strengths/Gaps */}
      <div className="mb-6 grid grid-cols-2 gap-5 max-sm:grid-cols-1">
        {/* Score Breakdown */}
        <div className="rounded-[24px] border border-[#c4d0cc] bg-white p-6 shadow-[0_2px_8px_rgba(26,61,43,0.08)]">
          <div className="mb-4 text-[14px] font-bold uppercase tracking-wider text-[#6b7e78]">
            Score Breakdown
          </div>
          <div className="flex flex-col gap-3">
            {sectionScores.map((s) => {
              const barColor = s.pct >= 70 ? "#2a9e67" : s.pct >= 40 ? "#f5a623" : "#e05a5a";
              return (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#374a47]">{s.title}</span>
                    <span className="text-[13px] font-bold" style={{ color: barColor }}>
                      {s.pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f2f5f4]">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${s.pct}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[24px] border border-[#c4d0cc] bg-white p-6 shadow-[0_2px_8px_rgba(26,61,43,0.08)]">
            <div className="mb-3 text-[14px] font-bold uppercase tracking-wider text-[#6b7e78]">
              Strengths
            </div>
            <div className="flex flex-col gap-2.5">
              {strengths.length === 0 ? (
                <div className="flex items-start gap-2.5 text-[14px] font-medium text-[#374a47]">
                  <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-[#32c47e]" />
                  Complete the assessment to identify strengths
                </div>
              ) : (
                strengths.map((s) => (
                  <div key={s.id} className="flex items-start gap-2.5 text-[14px] font-medium text-[#374a47]">
                    <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-[#32c47e]" />
                    {s.title} ({s.pct}%)
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-[24px] border border-[#c4d0cc] bg-white p-6 shadow-[0_2px_8px_rgba(26,61,43,0.08)]">
            <div className="mb-3 text-[14px] font-bold uppercase tracking-wider text-[#6b7e78]">
              Areas to Improve
            </div>
            <div className="flex flex-col gap-2.5">
              {gaps.length === 0 ? (
                <div className="flex items-start gap-2.5 text-[14px] font-medium text-[#374a47]">
                  <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-[#f5a623]" />
                  Excellent — no major areas of concern
                </div>
              ) : (
                gaps.map((s) => (
                  <div key={s.id} className="flex items-start gap-2.5 text-[14px] font-medium text-[#374a47]">
                    <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-[#f5a623]" />
                    {s.title} ({s.pct}%)
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6 rounded-[24px] border border-[#c4d0cc] bg-white p-7 shadow-[0_2px_8px_rgba(26,61,43,0.08)]">
        <div className="mb-5 flex items-center gap-3">
          <span className="text-2xl">{rating.icon}</span>
          <span className="text-lg font-bold text-[#1c2b2b]">Personalised Recommendations</span>
        </div>
        <p className="mb-5 text-[15px] font-medium leading-relaxed text-[#374a47]">
          {reco.intro}
        </p>
        <div className="flex flex-col gap-3">
          <div className="text-[14px] font-bold text-[#1c2b2b]">Your Next Steps:</div>
          {reco.steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-[10px] border-l-[3px] border-[#32c47e] bg-[#f0faf5] px-4 py-3.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#247a4f] text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[14px] font-medium leading-relaxed text-[#374a47]">
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[#e6ece9] pt-6">
          <div className="mb-3 text-[14px] font-bold text-[#1c2b2b]">Recommended courses</div>
          <ul className="flex flex-col gap-2.5">
            {reco.courses.map((course) => {
              const external =
                course.href.startsWith("http://") || course.href.startsWith("https://");
              return (
                <li key={course.label}>
                  <a
                    href={course.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#247a4f] underline decoration-[#247a4f]/40 underline-offset-2 transition-colors hover:text-[#1e5438]"
                  >
                    {course.label}
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Restart */}
      <button
        type="button"
        onClick={restart}
        className="mb-8 w-full rounded-[16px] border-2 border-[#2a9e67] bg-white px-7 py-3.5 text-center text-[15px] font-bold text-[#1e5438] transition-all hover:bg-[#f0faf5]"
      >
        Retake Assessment
      </button>

      <div className="mb-4 text-center">
        <Link
          href="/credit-worthiness-assessment-form"
          className="text-[14px] font-semibold text-[#247a4f] underline"
        >
          &larr; Back to Credit Readiness Overview
        </Link>
      </div>
    </div>
  );
}
