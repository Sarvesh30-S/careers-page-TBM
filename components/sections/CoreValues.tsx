"use client";

import React, { useEffect, useRef } from "react";
import { VALUES } from "@/data/data";
import { ValueGroup } from "@/components/values/ValueGroup";

export const CoreValues: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const valuesScroll = () => {
      const vrows = container.querySelectorAll<HTMLElement>(".value");
      const vgroups = container.querySelectorAll<HTMLElement>(".vgroup");
      const mid = window.innerHeight * 0.42;
      let best: HTMLElement | null = null;
      let bd = 1e9;

      vrows.forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (r.bottom > 0 && r.top < window.innerHeight && d < bd) {
          bd = d;
          best = el;
        }
      });

      vrows.forEach((el) => {
        el.classList.toggle("active", el === best);
      });

      vgroups.forEach((g) => {
        g.classList.toggle("on", Boolean(best && g.contains(best)));
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(valuesScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Initial pass
    valuesScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section className="band" id="values" aria-labelledby="values-h">
      <div className="wrap">
        <p className="kicker">How we work</p>
        <h2 id="values-h" className="sec-h" style={{ maxWidth: "18ch" }}>
          Three values. Six behaviours. Zero wall posters.
        </h2>
        <div className="values" id="valuelist" ref={containerRef}>
          {VALUES.map((group, gi) => {
            // Count behaviours before this group to determine startIndex
            const startIndex = VALUES.slice(0, gi).reduce(
              (acc, g) => acc + g.behaviours.length,
              0
            );
            return (
              <ValueGroup
                key={group.name}
                group={group}
                groupIndex={gi}
                startIndex={startIndex}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
