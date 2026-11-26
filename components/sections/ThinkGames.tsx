"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LADDERS, CHAINS, QUIZ, QWHY } from "@/data/data";

const WHEN_LABELS = ["Today", "This week", "Next week", "Next month"];

export default function ThinkGames() {
  // Active game (0: Why Ladder, 1: Second-Order, 2: Quiz)
  const [activeGame, setActiveGame] = useState<number>(0);

  // -------------------------------------------------------------
  // GAME 0: First Principle Thinking (The Why Ladder)
  // -------------------------------------------------------------
  const [ladderIndex, setLadderIndex] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const currentLadder = LADDERS[ladderIndex];
  const ladderSteps = currentLadder.steps;
  const lastStep = ladderSteps.length - 1;
  const isRoot = stepIndex === lastStep;

  const countText =
    stepIndex === 0
      ? "The request"
      : isRoot
      ? "The real problem"
      : `Why #${stepIndex}`;

  const whyText =
    stepIndex === 0
      ? "Sounds reasonable. But why?"
      : isRoot
      ? "So the real fix:"
      : "Why?";

  const historySteps = ladderSteps.slice(Math.max(0, stepIndex - 3), stepIndex);

  const handleNextStep = () => {
    if (isRoot) {
      setLadderIndex((prev) => (prev + 1) % LADDERS.length);
      setStepIndex(0);
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  // -------------------------------------------------------------
  // GAME 1: Second-Order Thinking (And then what?)
  // -------------------------------------------------------------
  const [chainIndex, setChainIndex] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const currentChain = CHAINS[chainIndex];

  const handleSelectScenario = (index: number) => {
    setChainIndex(index);
    setSelectedOpt(null);
  };

  const handleSelectOpt = (index: number) => {
    setSelectedOpt((prev) => (prev === index ? null : index));
  };

  // -------------------------------------------------------------
  // GAME 2: Culture Fit Quiz (Would you like it here?)
  // -------------------------------------------------------------
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [flipOrder, setFlipOrder] = useState<boolean[]>(() =>
    Array(QUIZ.length).fill(false)
  );

  useEffect(() => {
    setFlipOrder(QUIZ.map(() => Math.random() < 0.5));
  }, []);

  const quizCurrent = quizAnswers.length;
  const isQuizComplete = quizCurrent >= QUIZ.length;

  const handleQuizAnswer = (value: number) => {
    setQuizAnswers((prev) => [...prev, value]);
  };

  const handleQuizReset = () => {
    setQuizAnswers([]);
    setFlipOrder(QUIZ.map(() => Math.random() < 0.5));
  };

  const alignedCount = quizAnswers.filter((a) => a === 1).length;
  const misalignedTraits = QUIZ.map((_, idx) =>
    quizAnswers[idx] === 1 ? null : QWHY[idx]
  ).filter(Boolean);

  let resultHeadline = "";
  let resultParagraph = "";
  if (alignedCount === 6) {
    resultHeadline = "You'd feel at home.";
    resultParagraph =
      "Every pick lines up with how we work. Go find a problem worth owning.";
  } else if (alignedCount >= 4) {
    resultHeadline = "Mostly a fit. Good sign.";
    resultParagraph = `We split on ${misalignedTraits.join(
      " and "
    )}. That's a great thing to talk about in an interview.`;
  } else {
    resultHeadline = "Honest heads-up.";
    resultParagraph =
      "This place might frustrate you. That's fine. Not every team fits every person, and we'd rather say so now.";
  }

  // Handle Tab Click
  const handleTabClick = (gameIndex: number) => {
    setActiveGame(gameIndex);
    if (gameIndex === 1) {
      setChainIndex(0);
      setSelectedOpt(null);
    }
  };

  // Keyboard navigation across the game tabs
  const handleTablistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (activeGame + 1) % 3;
      handleTabClick(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (activeGame - 1 + 3) % 3;
      handleTabClick(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleTabClick(0);
    } else if (e.key === "End") {
      e.preventDefault();
      handleTabClick(2);
    }
  };

  return (
    <section
      className="band"
      id="think"
      aria-labelledby="life-h"
      style={{ marginTop: "clamp(56px, 9vw, 120px)" }}
    >
      <div className="wrap">
        <div className="games-head">
          <div>
            <p className="kicker">How we think at TBM</p>
            <h2 id="life-h" className="sec-h" style={{ maxWidth: "16ch" }}>
              Three ways we think. Try each in 30 seconds.
            </h2>
          </div>
          <p className="muted" style={{ maxWidth: "38ch" }}>
            Nothing is saved and nobody sees your answers. Pick a tab, play, switch.
          </p>
        </div>

        <div className="games">
          {/* Tab buttons */}
          <div
            className="gtabs"
            role="tablist"
            aria-label="Pick a game"
            id="gtabs"
            onKeyDown={handleTablistKeyDown}
          >
            <button
              role="tab"
              id="gt-0"
              aria-controls="g-0"
              aria-selected={activeGame === 0}
              tabIndex={activeGame === 0 ? 0 : -1}
              data-game="0"
              onClick={() => handleTabClick(0)}
            >
              <span className="gn">1</span>
              <span>
                <b>First principle thinking</b>
                <small>(Always asking why)</small>
              </span>
            </button>

            <button
              role="tab"
              id="gt-1"
              aria-controls="g-1"
              aria-selected={activeGame === 1}
              tabIndex={activeGame === 1 ? 0 : -1}
              data-game="1"
              onClick={() => handleTabClick(1)}
            >
              <span className="gn">2</span>
              <span>
                <b>And then what?</b>
                <small>(Second-order thinking)</small>
              </span>
            </button>

            <button
              role="tab"
              id="gt-2"
              aria-controls="g-2"
              aria-selected={activeGame === 2}
              tabIndex={activeGame === 2 ? 0 : -1}
              data-game="2"
              onClick={() => handleTabClick(2)}
            >
              <span className="gn">3</span>
              <span>
                <b>Would you like it here?</b>
                <small>Six quick choices</small>
              </span>
            </button>
          </div>

          {/* GAME 0: Why Ladder */}
          <div
            className="game"
            role="tabpanel"
            id="g-0"
            aria-labelledby="gt-0"
            hidden={activeGame !== 0}
          >
            <p className="gintro">
              Most requests arrive dressed as solutions. Pick one and keep asking
              “why?” until the real problem shows up.
            </p>

            <div className="filters" aria-label="Pick a request" role="group" id="ltabs">
              {LADDERS.map((l, i) => (
                <button
                  key={l.tab}
                  className="chip"
                  aria-pressed={i === ladderIndex}
                  onClick={() => {
                    setLadderIndex(i);
                    setStepIndex(0);
                  }}
                >
                  {l.tab}
                </button>
              ))}
            </div>

            <div className="lmeta">
              <span id="lcount">{countText}</span>
              <span className="ldots" id="ldots">
                {ladderSteps.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Step ${i + 1}`}
                    className={i === lastStep ? "root" : ""}
                    aria-current={i === stepIndex}
                    onClick={() => setStepIndex(i)}
                  />
                ))}
              </span>
            </div>

            {historySteps.length > 0 && (
              <ol className="lhist" id="lhist" aria-hidden="true">
                {historySteps.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ol>
            )}

            <p className="lwhy" id="lwhy" aria-hidden="true">
              {whyText}
            </p>

            <h3 className={`lstate ${isRoot ? "root" : ""}`} id="lstate" aria-live="polite">
              {ladderSteps[stepIndex]}
            </h3>

            <div className="gact">
              <button className="btn primary" id="lnext" onClick={handleNextStep}>
                {isRoot ? (
                  "Try another request"
                ) : (
                  <>
                    {stepIndex === 0 ? "Ask why" : "Next why"}{" "}
                    <span className="arr" aria-hidden="true">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GAME 1: Second-Order Thinking */}
          <div
            className="game"
            role="tabpanel"
            id="g-1"
            aria-labelledby="gt-1"
            hidden={activeGame !== 1}
          >
            <p className="gintro">
              Every choice has a second chapter. Pick a situation, make a call, see
              where it leads.
            </p>

            <div className="filters" role="group" aria-label="Pick a situation" id="twtabs">
              {CHAINS.map((x, i) => (
                <button
                  key={x.tab}
                  className="chip"
                  aria-pressed={i === chainIndex}
                  onClick={() => handleSelectScenario(i)}
                >
                  {x.tab}
                </button>
              ))}
            </div>

            <p className="twq" id="twq">
              {currentChain.q}
            </p>

            <div className="twopts" id="twopts">
              {currentChain.opts.map((o, i) => (
                <button
                  key={o.label}
                  className="chip"
                  aria-pressed={selectedOpt === i}
                  onClick={() => handleSelectOpt(i)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <ol className="chain" id="chain" aria-live="polite">
              {selectedOpt === null ? (
                <li className="hint">Pick one to see what happens next.</li>
              ) : (
                currentChain.opts[selectedOpt].steps.map((t, i) => {
                  const isEnd = i === 3;
                  const isGood = currentChain.opts[selectedOpt].good;
                  const className = isEnd ? `end ${isGood ? "good" : "bad"}` : "";
                  return (
                    <li
                      key={i}
                      style={{ ["--i" as string]: i }}
                      className={className}
                    >
                      <small>{WHEN_LABELS[i]}</small>
                      <b>{t}</b>
                    </li>
                  );
                })
              )}
            </ol>
          </div>

          {/* GAME 2: Culture Fit Quiz */}
          <div
            className="game"
            role="tabpanel"
            id="g-2"
            aria-labelledby="gt-2"
            hidden={activeGame !== 2}
          >
            <p className="gintro">Six this-or-that choices. Go with your gut.</p>

            <div className="quiz" id="quiz" aria-live="polite">
              {!isQuizComplete ? (
                <>
                  <div className="qbar" aria-hidden="true">
                    {QUIZ.map((_, j) => (
                      <i key={j} className={j < quizCurrent ? "on" : ""} />
                    ))}
                  </div>

                  <p className="small muted" style={{ marginBottom: "14px" }}>
                    {quizCurrent + 1} of {QUIZ.length} · which sounds more like you?
                  </p>

                  <div className="qopts">
                    {(() => {
                      const pair = QUIZ[quizCurrent];
                      const flip = flipOrder[quizCurrent];
                      const options: [string, number][] = flip
                        ? [
                            [pair[1], 0],
                            [pair[0], 1],
                          ]
                        : [
                            [pair[0], 1],
                            [pair[1], 0],
                          ];

                      return options.map(([t, val], k) => (
                        <button
                          key={k}
                          className="qopt"
                          onClick={() => handleQuizAnswer(val)}
                        >
                          <span>{t}</span>
                          <span className="k">{k ? "or this" : "this"}</span>
                        </button>
                      ));
                    })()}
                  </div>
                </>
              ) : (
                <div className="qres">
                  <h3>{resultHeadline}</h3>
                  <p className="muted">{resultParagraph}</p>
                  <ul>
                    {QUIZ.map((x, j) => (
                      <li key={j}>
                        <span
                          className="dot"
                          style={{
                            background:
                              quizAnswers[j] === 1 ? undefined : "transparent",
                            border:
                              quizAnswers[j] === 1
                                ? undefined
                                : "1px solid var(--muted)",
                          }}
                          aria-hidden="true"
                        />
                        {quizAnswers[j] === 1 ? x[0] : x[1]}
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
                    <a className="btn primary" href="#roles">
                      See open roles <span className="arr" aria-hidden="true">→</span>
                    </a>
                    <button className="btn ghost" onClick={handleQuizReset}>
                      Start over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
