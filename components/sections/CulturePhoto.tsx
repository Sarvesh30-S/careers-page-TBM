"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { GALLERY } from "@/data/data";

export default function CulturePhoto() {
  const galRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const syncGallery = useCallback(() => {
    const gal = galRef.current;
    if (!gal) return;

    const slides = Array.from(gal.querySelectorAll<HTMLElement>(".photo"));
    if (!slides.length) return;

    const x = gal.scrollLeft;
    const max = gal.scrollWidth - gal.clientWidth;
    let nextIndex = 0;

    if (x >= max - 4) {
      nextIndex = slides.length - 1;
    } else {
      nextIndex = slides.reduce(
        (best, el, i) =>
          Math.abs(el.offsetLeft - gal.offsetLeft - x) <
          Math.abs(slides[best].offsetLeft - gal.offsetLeft - x)
            ? i
            : best,
        0
      );
    }

    setCurrentIndex(nextIndex);
  }, []);

  const goToSlide = (index: number) => {
    const gal = galRef.current;
    if (!gal) return;
    const slides = Array.from(gal.querySelectorAll<HTMLElement>(".photo"));
    const safeIndex = Math.max(0, Math.min(slides.length - 1, index));
    if (slides[safeIndex]) {
      const targetLeft = slides[safeIndex].offsetLeft - gal.offsetLeft;
      gal.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const gal = galRef.current;
    if (!gal) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          syncGallery();
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      }
    };

    gal.addEventListener("scroll", handleScroll, { passive: true });
    gal.addEventListener("keydown", handleKeyDown);

    // Initial sync
    syncGallery();

    return () => {
      gal.removeEventListener("scroll", handleScroll);
      gal.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, syncGallery]);

  // Subtle zoom effect on scroll
  useEffect(() => {
    const gal = galRef.current;
    if (!gal) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let ticking = false;
    const onWindowScroll = () => {
      ticking = false;
      const vh = window.innerHeight;
      const r = gal.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / vh));
      gal.style.setProperty("--z", (1.1 - 0.1 * p).toFixed(4));
    };

    const handleWindowScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onWindowScroll);
      }
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    onWindowScroll();

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  return (
    <section
      className="wrap"
      id="life"
      aria-roledescription="carousel"
      aria-labelledby="life-k"
    >
      <div
        className="gallery"
        id="photo"
        ref={galRef}
        tabIndex={0}
        aria-label="Team photos. Use left and right arrow keys to move."
      >
        {GALLERY.map((g, i) =>
          g.src ? (
            <figure
              key={`slide-${i}`}
              className="photo"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${GALLERY.length}`}
              style={{ margin: 0 }}
            >
              <img
                src={g.src.startsWith("/") ? g.src : `/${g.src}`}
                srcSet={
                  g.srcset
                    ? g.srcset
                        .split(",")
                        .map((s: string) => {
                          const trimmed = s.trim();
                          return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
                        })
                        .join(", ")
                    : undefined
                }
                sizes="(max-width:1200px) 92vw, 1200px"
                alt={g.alt}
                width={1800}
                height={1350}
                loading={i === 0 ? undefined : "lazy"}
                decoding="async"
              />
            </figure>
          ) : (
            <figure
              key={`slide-empty-${i}`}
              className="photo empty"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${GALLERY.length}, photo coming soon`}
              style={{ margin: 0 }}
            >
              <div>
                <b>Photo {i + 1}</b>
                <span className="small">Team photo goes here</span>
              </div>
            </figure>
          )
        )}
      </div>

      <div className="caption">
        <span id="life-k">TBM&apos;s Tribe</span>
        <div className="gctl">
          <span className="small muted gcount" id="gcount">
            {currentIndex + 1} / {GALLERY.length}
          </span>
          <button
            className="x sm"
            data-gal="-1"
            aria-label="Previous photo"
            disabled={currentIndex === 0}
            onClick={() => goToSlide(currentIndex - 1)}
          >
            ←
          </button>
          <button
            className="x sm"
            data-gal="1"
            aria-label="Next photo"
            disabled={currentIndex === GALLERY.length - 1}
            onClick={() => goToSlide(currentIndex + 1)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
