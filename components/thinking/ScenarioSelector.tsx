"use client";

import React from "react";
import { SecondOrderChain } from "@/types";

interface ScenarioSelectorProps {
  scenarios: readonly SecondOrderChain[] | SecondOrderChain[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedIndex,
  onSelect,
}) => {
  return (
    <div
      className="filters"
      role="tablist"
      aria-label="Pick a situation"
      id="twtabs"
    >
      {scenarios.map((scenario, i) => {
        const isSelected = i === selectedIndex;
        return (
          <button
            key={scenario.tab}
            className="chip"
            role="tab"
            aria-selected={isSelected}
            aria-pressed={isSelected}
            data-tw={i}
            onClick={() => onSelect(i)}
          >
            {scenario.tab}
          </button>
        );
      })}
    </div>
  );
};
