"use client";

import React, { useEffect, useRef } from "react";

export default function CulturePhoto() {
  const figureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;

    // Respect reduced motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let ticking = false;

    const onScroll = () => {
      ticking = false;
      if (!figure) return;
      const vh = window.innerHeight;
      const r = figure.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / vh));
      figure.style.setProperty("--z", (1.1 - 0.1 * p).toFixed(4));
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial evaluation
    onScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="wrap" aria-label="The team">
      <figure className="photo" id="photo" ref={figureRef} style={{ margin: 0 }}>
        <img
          src="/assets/team-1800.jpg"
          srcSet="/assets/team-900.jpg 900w, /assets/team-1800.jpg 1800w"
          sizes="(max-width:1200px) 92vw, 1200px"
          alt="About forty members of the TBM team sitting together on the steps of a white colonnaded building, smiling, many in sunglasses."
          width={1800}
          height={1350}
          loading="lazy"
          decoding="async"
        />
      </figure>
      <div className="caption">
        <span className="tribe">TBM TRIBE</span>
      </div>
    </section>
  );
}
