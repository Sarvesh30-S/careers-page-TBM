"use client";

import React from "react";
import { QUIZ, QWHY } from "@/data/data";

interface QuizResultsProps {
  answers: boolean[];
  onReset: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ answers, onReset }) => {
  const n = answers.filter(Boolean).length;
  const split = QUIZ.map((_, j) => (answers[j] ? null : QWHY[j])).filter(
    (item): item is (typeof QWHY)[number] => Boolean(item)
  );

  const [heading, paragraph] =
    n === 6
      ? [
          "You'd feel at home.",
          "Every pick lines up with how we work. Go find a problem worth owning.",
        ]
      : n >= 4
      ? [
          "Mostly a fit. Good sign.",
          `We split on ${split.join(
            " and "
          )}. That's a great thing to talk about in an interview.`,
        ]
      : [
          "Honest heads-up.",
          "This place might frustrate you. That's fine. Not every team fits every person, and we'd rather say so now.",
        ];

  return (
    <div className="qres">
      <h3>{heading}</h3>
      <p className="muted">{paragraph}</p>
      <ul>
        {QUIZ.map((pair, j) => {
          const selectedText = answers[j] ? pair[0] : pair[1];
          const isAligned = answers[j];
          return (
            <li key={j}>
              <span
                className="dot"
                style={
                  isAligned
                    ? undefined
                    : { background: "transparent", border: "1px solid var(--muted)" }
                }
                aria-hidden="true"
              />
              {selectedText}
            </li>
          );
        })}
      </ul>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <a className="btn primary" href="#roles">
          See open roles <span className="arr" aria-hidden="true">→</span>
        </a>
        <button
          type="button"
          className="btn ghost"
          data-qreset
          onClick={onReset}
        >
          Start over
        </button>
      </div>
    </div>
  );
};
