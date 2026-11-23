"use client";

import React from "react";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <>
      <div className="qbar" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, j) => (
          <i key={j} className={j < currentStep ? "on" : ""} />
        ))}
      </div>
      <p className="small muted" style={{ marginBottom: "14px" }}>
        {currentStep + 1} of {totalSteps} · which sounds more like you?
      </p>
    </>
  );
};
