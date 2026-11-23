"use client";

import React from "react";
import { SecondOrderOption } from "@/types";

interface ConsequenceChainProps {
  option: SecondOrderOption | null;
  animationKey: string;
}

const WHEN_LABELS = ["Today", "This week", "Next week", "Next month"] as const;

export const ConsequenceChain: React.FC<ConsequenceChainProps> = ({
  option,
  animationKey,
}) => {
  if (!option) {
    return (
      <ol className="chain" id="chain" aria-live="polite">
        <li className="hint">Pick one to see what happens next.</li>
      </ol>
    );
  }

  return (
    <ol key={animationKey} className="chain" id="chain" aria-live="polite">
      {option.steps.map((text, i) => {
        const isEnd = i === 3;
        const endClass = isEnd
          ? `end ${option.good ? "good" : "bad"}`
          : "";
        return (
          <li
            key={i}
            style={{ "--i": i } as React.CSSProperties}
            className={endClass}
          >
            <small>{WHEN_LABELS[i]}</small>
            <b>{text}</b>
          </li>
        );
      })}
    </ol>
  );
};
