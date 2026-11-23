"use client";

import React, { useEffect, useRef } from "react";
import { STEPS6 } from "@/data/data";
import { TimelineStep } from "@/components/hiring/TimelineStep";

export const HiringTimeline: React.FC = () => {
  const stepsRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const stepsEl = stepsRef.current;
    if (!stepsEl) return;

    let ticking = false;

    const updateScrollProgress = () => {
      const vh = window.innerHeight;
      const sr = stepsEl.getBoundingClientRect();
      const fill = Math.min(1, Math.max(0, (vh * 0.6 - sr.top) / sr.height));
      stepsEl.style.setProperty("--fill", fill.toFixed(3));

      const items = stepsEl.querySelectorAll<HTMLLIElement>("li");
      items.forEach((li) => {
        const top = li.getBoundingClientRect().top;
        li.classList.toggle("on", top < vh * 0.6);
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrollProgress);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Initial pass
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="band" id="hiring" aria-labelledby="hiring-h">
      <div className="wrap proc">
        <div className="proc-h">
          <p className="kicker">How hiring works</p>
          <h2 id="hiring-h" className="sec-h" style={{ maxWidth: "12ch" }}>
            Six steps. Real dates.
          </h2>
          <p className="muted" style={{ marginTop: "16px", maxWidth: "36ch" }}>
            We hold ourselves to the same rule we ask of you: say a time, then
            beat it.
          </p>
        </div>
        <ol className="steps" id="steps" ref={stepsRef}>
          {STEPS6.map(([title, timeframe, description]) => (
            <TimelineStep
              key={title}
              title={title}
              timeframe={timeframe}
              description={description}
            />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HiringTimeline;
