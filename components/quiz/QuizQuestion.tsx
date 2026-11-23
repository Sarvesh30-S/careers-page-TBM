"use client";

import React from "react";

interface QuizQuestionProps {
  options: [string, boolean][];
  onSelect: (value: boolean) => void;
  firstButtonRef?: React.Ref<HTMLButtonElement>;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  options,
  onSelect,
  firstButtonRef,
}) => {
  return (
    <div className="qopts">
      {options.map(([text, value], k) => (
        <button
          key={text}
          ref={k === 0 ? firstButtonRef : undefined}
          type="button"
          className="qopt"
          data-q={value ? "1" : "0"}
          onClick={() => onSelect(value)}
        >
          <span>{text}</span>
          <span className="k">{k ? "or this" : "this"}</span>
        </button>
      ))}
    </div>
  );
};
