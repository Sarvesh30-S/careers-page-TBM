"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const LINE1 = "Curiosity gets you hired.";
const LINE2 = "Courage gets you heard.";
const WORD = "Courage";

interface HeroProps {
  isReady?: boolean;
  onTypingComplete?: () => void;
}

export default function Hero({ isReady = false, onTypingComplete }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [isLine1Done, setIsLine1Done] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isLineDrawn, setIsLineDrawn] = useState(false);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    // If reduced motion is preferred or hash is #dashboard, complete immediately
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.location.hash === "#dashboard")
    ) {
      setLine1(LINE1);
      setLine2(LINE2);
      setIsLine1Done(true);
      setIsTypingComplete(true);
      setIsLineDrawn(true);
      hasFinishedRef.current = true;
      onTypingComplete?.();
      return;
    }

    // Scroll to top on initial page load so typing is fully visible
    if (typeof window !== "undefined" && window.location.hash !== "#dashboard") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    let l1 = 0;
    let l2 = 0;
    let timer: NodeJS.Timeout;
    let lineTimer: NodeJS.Timeout;
    let readyTimer: NodeJS.Timeout;

    const finishTyping = () => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      setLine1(LINE1);
      setLine2(LINE2);
      setIsLine1Done(true);
      setIsTypingComplete(true);

      // Sequence:
      // 1. Typing completes
      // 2. Yellow line draws under "Courage"
      // 3. After line completes drawing, reveal the rest of the page
      lineTimer = setTimeout(() => {
        setIsLineDrawn(true);
        readyTimer = setTimeout(() => {
          onTypingComplete?.();
        }, 600);
      }, 150);
    };

    // Allow user to click anywhere or press any key to skip typing
    const handleSkip = () => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      clearTimeout(timer);
      setLine1(LINE1);
      setLine2(LINE2);
      setIsLine1Done(true);
      setIsTypingComplete(true);
      setIsLineDrawn(true);
      onTypingComplete?.();
    };
    window.addEventListener("click", handleSkip, { once: true });
    window.addEventListener("keydown", handleSkip, { once: true });

    // Step 1: Type "Curiosity gets you hired."
    function stepLine1() {
      if (hasFinishedRef.current) return;
      if (l1 < LINE1.length) {
        l1++;
        setLine1(LINE1.slice(0, l1));
        const delay = 30 + Math.floor(Math.random() * 8);
        timer = setTimeout(stepLine1, delay);
      } else {
        setIsLine1Done(true);
        // Brief pause before line 2 starts
        timer = setTimeout(stepLine2, 160);
      }
    }

    // Step 2: Type "Courage gets you heard."
    function stepLine2() {
      if (hasFinishedRef.current) return;
      if (l2 < LINE2.length) {
        l2++;
        setLine2(LINE2.slice(0, l2));
        const delay = 30 + Math.floor(Math.random() * 8);
        timer = setTimeout(stepLine2, delay);
      } else {
        finishTyping();
      }
    }

    // Small delay before starting typewriter
    timer = setTimeout(stepLine1, 150);

    return () => {
      clearTimeout(timer);
      clearTimeout(lineTimer);
      clearTimeout(readyTimer);
      window.removeEventListener("click", handleSkip);
      window.removeEventListener("keydown", handleSkip);
    };
  }, [onTypingComplete]);

  // Determine displayed text (starts empty so typewriter begins cleanly from first letter)
  const displayLine1 = line1;
  const displayLine2 = line2;

  return (
    <section className="hero wrap" id="top">
      <h1
        className="kin"
        aria-label="Curiosity gets you hired. Courage gets you heard."
      >
        <span className="ln" suppressHydrationWarning>
          {displayLine1}
          {mounted && !isLine1Done && (
            <span className="type-cursor" aria-hidden="true" />
          )}
        </span>{" "}
        <span className="ln" suppressHydrationWarning>
          {displayLine2.length <= WORD.length ? (
            <mark className={isLineDrawn ? "draw active" : "draw"}>
              {displayLine2}
            </mark>
          ) : (
            <>
              <mark className={isLineDrawn ? "draw active" : "draw"}>
                {WORD}
              </mark>
              {displayLine2.slice(WORD.length)}
            </>
          )}
          {mounted && isLine1Done && !isTypingComplete && (
            <span className="type-cursor" aria-hidden="true" />
          )}
        </span>
      </h1>

      <div className="row">
        <p className="lede">
          TBM is a team in Lower Parel, Mumbai where a sharp question beats a loud opinion, and
          whoever is closest to the problem gets to fix it. Bring the questions. Say the hard thing.
          Then get it done.
        </p>

        <div className="ctas">
          <Link className="btn primary" href="#roles">
            <span className="btn-text">View openings</span>
            <span className="arr" aria-hidden="true">→</span>
          </Link>
          <Link className="btn ghost" href="#think">
            See how we think
          </Link>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <i></i>Scroll. We&apos;ll wait.
      </div>
    </section>
  );
}
