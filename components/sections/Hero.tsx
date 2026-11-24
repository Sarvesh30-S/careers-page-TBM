"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const LINE1 = "Curiosity gets you in.";
const LINE2_PREFIX = "Courage gets you ";
const MISTAKE_WORD = "weird.";
const CORRECT_WORD = "heard.";
const LINE2_MISTAKE = LINE2_PREFIX + MISTAKE_WORD; // "Courage gets you weird."
const LINE2_FINAL = LINE2_PREFIX + CORRECT_WORD;   // "Courage gets you heard."

interface HeroProps {
  isReady?: boolean;
  onTypingComplete?: () => void;
}

export default function Hero({ isReady = false, onTypingComplete }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [isLine1Done, setIsLine1Done] = useState(false);
  const [showOops, setShowOops] = useState(false);
  const [isOopsFading, setIsOopsFading] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [enterState, setEnterState] = useState<"idle" | "visible" | "pressing" | "sent">("idle");
  const [isSloganSent, setIsSloganSent] = useState(false);
  const hasFinishedRef = useRef(false);
  const enterStateRef = useRef<"idle" | "visible" | "pressing" | "sent">("idle");

  const updateEnterState = (state: "idle" | "visible" | "pressing" | "sent") => {
    enterStateRef.current = state;
    setEnterState(state);
  };

  useEffect(() => {
    setMounted(true);

    // If reduced motion is preferred or hash is #dashboard, complete immediately
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.location.hash === "#dashboard")
    ) {
      setLine1(LINE1);
      setLine2(LINE2_FINAL);
      setIsLine1Done(true);
      setShowOops(false);
      setIsTypingComplete(true);
      hasFinishedRef.current = true;
      onTypingComplete?.();
      return;
    }

    // Scroll to top on initial page load so typing is fully visible
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    let l1 = 0;
    let l2 = 0;
    let timer: NodeJS.Timeout;

    const finishTyping = () => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      setLine1(LINE1);
      setLine2(LINE2_FINAL);
      setIsLine1Done(true);
      setShowOops(false);
      updateEnterState("idle");
      setIsSloganSent(true);
      setIsTypingComplete(true);
      onTypingComplete?.();
    };

    // Allow user to click anywhere or press key to interact/skip
    const handleClick = () => {
      finishTyping();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasFinishedRef.current) return;
      if (e.key === "Enter" && enterStateRef.current === "visible") {
        clearTimeout(timer);
        stepPressEnter();
        return;
      }
      finishTyping();
    };

    window.addEventListener("click", handleClick, { once: true });
    window.addEventListener("keydown", handleKeyDown);

    // Step 1: Type "Curiosity gets you in."
    function stepLine1() {
      if (hasFinishedRef.current) return;
      if (l1 < LINE1.length) {
        l1++;
        setLine1(LINE1.slice(0, l1));
        const delay = 34 + Math.floor(Math.random() * 10);
        timer = setTimeout(stepLine1, delay);
      } else {
        setIsLine1Done(true);
        // Natural pause between line 1 and line 2
        timer = setTimeout(stepTypeMistake, 180);
      }
    }

    // Step 2: Type "Courage gets you weird."
    function stepTypeMistake() {
      if (hasFinishedRef.current) return;
      if (l2 < LINE2_MISTAKE.length) {
        l2++;
        setLine2(LINE2_MISTAKE.slice(0, l2));
        const delay = 34 + Math.floor(Math.random() * 10);
        timer = setTimeout(stepTypeMistake, delay);
      } else {
        // Step 3: Pause briefly (500ms) with the mistake on screen
        timer = setTimeout(stepShowOops, 500);
      }
    }

    // Step 4 & 5: Display subtle "Oops!" badge for ~700ms
    function stepShowOops() {
      if (hasFinishedRef.current) return;
      setShowOops(true);
      setIsOopsFading(false);
      timer = setTimeout(() => {
        setIsOopsFading(true);
        // Step 6: Begin backspacing the mistake
        timer = setTimeout(stepBackspace, 160);
      }, 700);
    }

    // Step 6: Backspace "weird." character by character
    function stepBackspace() {
      if (hasFinishedRef.current) return;
      if (l2 > LINE2_PREFIX.length) {
        l2--;
        setLine2(LINE2_MISTAKE.slice(0, l2));
        timer = setTimeout(stepBackspace, 45);
      } else {
        setShowOops(false);
        // Step 7: Brief pause before typing the correct word "heard."
        timer = setTimeout(stepTypeCorrect, 130);
      }
    }

    // Step 7: Type "heard." character by character
    let correctIdx = 0;
    function stepTypeCorrect() {
      if (hasFinishedRef.current) return;
      if (correctIdx < CORRECT_WORD.length) {
        correctIdx++;
        setLine2(LINE2_PREFIX + CORRECT_WORD.slice(0, correctIdx));
        const delay = 36 + Math.floor(Math.random() * 10);
        timer = setTimeout(stepTypeCorrect, delay);
      } else {
        // Step 8: Slogan completely written! Display the Enter key prompt
        updateEnterState("visible");
        // Pause briefly (340ms) with the Enter keycap visible
        timer = setTimeout(stepPressEnter, 340);
      }
    }

    // Step 9: Simulate pressing the Enter key (tactile keypress down)
    function stepPressEnter() {
      if (hasFinishedRef.current) return;
      updateEnterState("pressing");
      // Key stays pressed down for 220ms
      timer = setTimeout(stepSendSlogan, 220);
    }

    // Step 10: Slogan gets sent / uploaded in place!
    function stepSendSlogan() {
      if (hasFinishedRef.current) return;
      updateEnterState("sent");
      setIsSloganSent(true);

      // Slogan executes commit bump & upload shimmer sweep
      // Step 11: After upload beam passes (340ms), remove enter keycap and draw orange marker
      timer = setTimeout(() => {
        if (hasFinishedRef.current) return;
        updateEnterState("idle");
        setIsTypingComplete(true);

        // Step 12: Reveal the rest of the page (nav, lede, buttons, sections)
        timer = setTimeout(() => {
          if (hasFinishedRef.current) return;
          hasFinishedRef.current = true;
          onTypingComplete?.();
        }, 260);
      }, 340);
    }

    // Start typing after initial mount delay
    timer = setTimeout(stepLine1, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTypingComplete]);

  // Determine displayed text
  const displayLine1 = mounted ? line1 : LINE1;
  const displayLine2 = mounted ? line2 : LINE2_FINAL;
  const isComplete = mounted ? isTypingComplete : true;

  return (
    <section className="hero wrap" id="top">
      <h1
        className={`kin ${isSloganSent ? "slogan-sent" : ""}`}
        aria-label="Curiosity gets you in. Courage gets you heard."
      >
        <span className="ln">
          {displayLine1}
          {mounted && !isLine1Done && (
            <span className="type-cursor" aria-hidden="true" />
          )}
        </span>{" "}
        <span className="ln">
          {displayLine2.length <= 7 ? (
            <mark className={isComplete ? "draw active" : "draw"}>
              {displayLine2}
            </mark>
          ) : (
            <>
              <mark className={isComplete ? "draw active" : "draw"}>
                Courage
              </mark>
              {displayLine2.slice(7)}
            </>
          )}
          {mounted && isLine1Done && !isSloganSent && (
            <span
              className={`type-cursor ${enterState !== "idle" ? "solid" : ""}`}
              aria-hidden="true"
            />
          )}
          {mounted && enterState !== "idle" && (
            <span
              className={`enter-keycap ${enterState}`}
              aria-hidden="true"
            >
              <span className="enter-icon">↵</span>
              <span className="enter-label">
                {enterState === "sent" ? "Sent" : "Enter"}
              </span>
            </span>
          )}
          <span className="oops-anchor">
            {showOops && (
              <span
                className={`oops-badge ${isOopsFading ? "fade-out" : ""}`}
                aria-hidden="true"
              >
                Oops!
              </span>
            )}
          </span>
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
          <Link className="btn ghost" href="#life">
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
