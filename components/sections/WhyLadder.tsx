"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LADDERS } from "@/data/data";

export default function WhyLadder() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<number>(activeTab);
  activeTabRef.current = activeTab;

  const currentLadder = LADDERS[activeTab];
  const steps = currentLadder.steps;
  const lastStepIndex = steps.length - 1;
  const isRoot = currentStep === lastStepIndex;

  // Derive step count label
  const stepCountLabel =
    currentStep === 0
      ? "The request"
      : isRoot
      ? "The real problem"
      : `Why #${currentStep}`;

  // Derive transition why label
  const whyLabel =
    currentStep === 0
      ? "Sounds reasonable. But why?"
      : isRoot
      ? "So the real fix:"
      : "Why?";

  // Breadcrumb history (up to 3 previous steps)
  const historySteps = steps.slice(Math.max(0, currentStep - 3), currentStep);

  // Scroll calculation
  const updateStepFromScroll = useCallback(() => {
    if (!trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    const n = LADDERS[activeTabRef.current].steps.length;
    const scrollableHeight = Math.max(1, r.height - window.innerHeight);
    const p = Math.min(1, Math.max(0, -r.top / scrollableHeight));
    const step = Math.min(n - 1, Math.floor(p * n));
    setCurrentStep((prev) => (prev !== step ? step : prev));
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          updateStepFromScroll();
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial evaluation
    updateStepFromScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateStepFromScroll]);

  // Jump to specific step
  const handleStepJump = (index: number) => {
    setCurrentStep(index);
    if (!trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    const n = steps.length;
    const scrollableHeight = Math.max(1, r.height - window.innerHeight);
    const targetY = window.scrollY + r.top + ((index + 0.5) / n) * scrollableHeight;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: targetY, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  // Change scenario tab
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setCurrentStep(0);
    if (trackRef.current) {
      const r = trackRef.current.getBoundingClientRect();
      const scrollableHeight = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / scrollableHeight));
      const step = Math.min(LADDERS[index].steps.length - 1, Math.floor(p * LADDERS[index].steps.length));
      // if scrolled inside ladder track, keep current scroll step; otherwise reset to 0
      if (r.top < 0 && r.bottom > window.innerHeight) {
        setCurrentStep(step);
      } else {
        setCurrentStep(0);
      }
    }
  };

  return (
    <section
      className="band ladder"
      id="life"
      aria-labelledby="life-h"
      style={{ marginTop: "clamp(56px, 9vw, 120px)" }}
    >
      <div className="wrap">
        <p className="kicker">TBM&apos;s Tribe · first principles</p>
        <h2 id="life-h" className="sec-h" style={{ maxWidth: "17ch" }}>
          We ask why until it gets uncomfortable. Then once more.
        </h2>
        <p className="muted" style={{ marginTop: "16px", maxWidth: "56ch" }}>
          Most requests arrive dressed as solutions. Keep scrolling and watch one get asked
          &ldquo;why?&rdquo; until the real problem shows up.
        </p>

        {/* Scenario Filter Tabs */}
        <div className="filters" role="tablist" aria-label="Pick a request" id="ltabs">
          {LADDERS.map((item, idx) => {
            const isSelected = idx === activeTab;
            return (
              <button
                key={item.tab}
                className={`chip ${isSelected ? "active" : ""}`}
                role="tab"
                aria-selected={isSelected}
                aria-pressed={isSelected}
                data-lad={idx}
                onClick={() => handleTabChange(idx)}
                type="button"
              >
                {item.tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sticky Scroll Stage */}
      <div
        className="ladder-track"
        id="ladder"
        ref={trackRef}
        style={{ "--n": steps.length } as React.CSSProperties}
      >
        <div className="ladder-stage">
          <div className="wrap">
            <div className="lmeta">
              <span id="lcount">{stepCountLabel}</span>
              <span className="ldots" id="ldots">
                {steps.map((_, i) => {
                  const isCurrent = i === currentStep;
                  const isLast = i === lastStepIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Step ${i + 1}`}
                      className={isLast ? "root" : ""}
                      aria-current={isCurrent ? "true" : undefined}
                      data-lstep={i}
                      onClick={() => handleStepJump(i)}
                    />
                  );
                })}
              </span>
            </div>

            {/* Previous History Breadcrumbs */}
            <ol className="lhist" id="lhist" aria-hidden="true">
              {historySteps.map((histText, hIdx) => (
                <li key={hIdx}>{histText}</li>
              ))}
            </ol>

            {/* Transition Why Prompt */}
            <p className="lwhy" id="lwhy" aria-hidden="true">
              {whyLabel}
            </p>

            {/* Dynamic State Headline */}
            <h3
              key={`${activeTab}-${currentStep}`}
              className={`lstate ${isRoot ? "root" : ""}`}
              id="lstate"
              aria-live="polite"
            >
              {steps[currentStep]}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
