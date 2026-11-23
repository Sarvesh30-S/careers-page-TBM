"use client";

import React from "react";
import { SecondOrderOption } from "@/types";

interface DecisionChoicesProps {
  question: string;
  options: SecondOrderOption[];
  selectedChoice: number | null;
  onSelect: (index: number) => void;
}

export const DecisionChoices: React.FC<DecisionChoicesProps> = ({
  question,
  options,
  selectedChoice,
  onSelect,
}) => {
  return (
    <>
      <p className="twq" id="twq">
        {question}
      </p>
      <div className="twopts" id="twopts">
        {options.map((opt, i) => {
          const isPressed = selectedChoice === i;
          return (
            <button
              key={opt.label}
              className="chip"
              aria-pressed={isPressed}
              data-twopt={i}
              onClick={() => onSelect(i)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
};
