"use client";

import React, { useState, useEffect, useRef } from "react";
import { QUIZ } from "@/data/data";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResults } from "@/components/quiz/QuizResults";

export const CultureFitQuiz: React.FC = () => {
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [flipOrder, setFlipOrder] = useState<boolean[]>(() =>
    Array(QUIZ.length).fill(false)
  );
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Randomize option order on client mount to match original behavior without SSR hydration mismatch
    setFlipOrder(QUIZ.map(() => Math.random() < 0.5));
  }, []);

  const currentIndex = answers.length;
  const isComplete = currentIndex >= QUIZ.length;

  useEffect(() => {
    // Focus first option on step advancement, matching original $("#quiz .qopt")?.focus()
    if (answers.length > 0 && !isComplete) {
      firstButtonRef.current?.focus();
    }
  }, [answers.length, isComplete]);

  const handleSelectOption = (isAligned: boolean) => {
    setAnswers((prev) => [...prev, isAligned]);
  };

  const handleReset = () => {
    setAnswers([]);
    setFlipOrder(QUIZ.map(() => Math.random() < 0.5));
  };

  const currentPair = !isComplete ? QUIZ[currentIndex] : null;
  const flip = !isComplete ? flipOrder[currentIndex] : false;
  const currentOptions: [string, boolean][] = currentPair
    ? flip
      ? [
          [currentPair[1], false],
          [currentPair[0], true],
        ]
      : [
          [currentPair[0], true],
          [currentPair[1], false],
        ]
    : [];

  return (
    <section className="band" id="fit" aria-labelledby="fit-h">
      <div className="wrap fitgrid">
        <div>
          <p className="kicker">Before you apply</p>
          <h2 id="fit-h" className="sec-h" style={{ maxWidth: "12ch" }}>
            Would you like it here?
          </h2>
          <p className="muted" style={{ marginTop: "16px", maxWidth: "40ch" }}>
            Six quick choices. Go with your gut. Nothing is saved and nobody sees
            it but you.
          </p>
        </div>
        <div className="quiz" id="quiz" aria-live="polite">
          {!isComplete ? (
            <>
              <QuizProgress
                currentStep={currentIndex}
                totalSteps={QUIZ.length}
              />
              <QuizQuestion
                options={currentOptions}
                onSelect={handleSelectOption}
                firstButtonRef={firstButtonRef}
              />
            </>
          ) : (
            <QuizResults answers={answers} onReset={handleReset} />
          )}
        </div>
      </div>
    </section>
  );
};

export default CultureFitQuiz;
