"use client";

import React, { useState } from "react";
import { CHAINS } from "@/data/data";
import { ScenarioSelector } from "@/components/thinking/ScenarioSelector";
import { DecisionChoices } from "@/components/thinking/DecisionChoices";
import { ConsequenceChain } from "@/components/thinking/ConsequenceChain";

export const SecondOrderThinking: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const currentChain = CHAINS[selectedScenario];
  const activeOption =
    selectedChoice !== null ? currentChain.opts[selectedChoice] : null;

  const handleSelectScenario = (index: number) => {
    setSelectedScenario(index);
    setSelectedChoice(null); // Reset choice on scenario switch, matching original drawChain(null)
  };

  const handleSelectChoice = (index: number) => {
    setSelectedChoice(index);
  };

  return (
    <section
      className="band"
      id="next"
      aria-labelledby="next-h"
      style={{ paddingTop: "clamp(32px, 5vw, 64px)" }}
    >
      <div className="wrap">
        <p className="kicker">Second-order thinking</p>
        <h2 id="next-h" className="sec-h" style={{ maxWidth: "16ch" }}>
          Every choice has a second chapter.
        </h2>
        <ScenarioSelector
          scenarios={CHAINS}
          selectedIndex={selectedScenario}
          onSelect={handleSelectScenario}
        />
        <DecisionChoices
          question={currentChain.q}
          options={currentChain.opts}
          selectedChoice={selectedChoice}
          onSelect={handleSelectChoice}
        />
        <ConsequenceChain
          option={activeOption}
          animationKey={`${selectedScenario}-${selectedChoice}`}
        />
      </div>
    </section>
  );
};
