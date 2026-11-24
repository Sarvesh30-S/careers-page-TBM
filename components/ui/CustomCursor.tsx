"use client";

import React, { useEffect, useRef, useState } from "react";

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop/fine-pointer devices
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!finePointer || prefersReducedMotion) {
      return;
    }

    setEnabled(true);
    document.body.classList.add("has-custom-cursor");

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let targetScale = 1;
    let currentScale = 1;
    let dotTargetScale = 1;
    let currentDotScale = 1;
    let isVisible = false;
    let isOverInput = false;
    let isMouseDown = false;
    let isInteractive = false;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        cursorX = e.clientX;
        cursorY = e.clientY;
        isVisible = true;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if hovering interactive controls
      isInteractive = !!target.closest(
        'a, button, [role="button"], .btn, .chip, .rolerow, .link, .qopt, select, summary, [data-interactive]'
      );

      // Check if over text inputs where native I-beam text cursor is preferred
      isOverInput = !!target.closest('input, textarea, [contenteditable="true"]');
    };

    const onMouseDown = () => {
      isMouseDown = true;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseLeave = () => {
      isVisible = false;
    };

    const onMouseEnter = () => {
      isVisible = true;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    const animate = () => {
      // Both ring and inside dot track the exact same coordinates so they move in perfect parallel lockstep
      cursorX += (mouseX - cursorX) * 0.22;
      cursorY += (mouseY - cursorY) * 0.22;

      targetScale = isMouseDown ? 0.85 : isInteractive ? 1.4 : 1;
      currentScale += (targetScale - currentScale) * 0.2;

      dotTargetScale = isMouseDown ? 0.75 : isInteractive ? 1.2 : 1;
      currentDotScale += (dotTargetScale - currentDotScale) * 0.25;

      const show = isVisible && !isOverInput;

      if (dotRef.current) {
        // Dot is 4px, centered at (cursorX - 2, cursorY - 2)
        dotRef.current.style.transform = `translate3d(${cursorX - 2}px, ${cursorY - 2}px, 0) scale(${currentDotScale})`;
        dotRef.current.style.opacity = show ? "1" : "0";
      }

      if (ringRef.current) {
        // Ring is 36px, centered at (cursorX - 18, cursorY - 18)
        ringRef.current.style.transform = `translate3d(${cursorX - 18}px, ${cursorY - 18}px, 0) scale(${currentScale})`;
        ringRef.current.style.opacity = show ? (isInteractive ? "0.85" : "0.55") : "0";
        if (isInteractive) {
          ringRef.current.classList.add("hovered");
        } else {
          ringRef.current.classList.remove("hovered");
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        aria-hidden="true"
      />
    </>
  );
};

export default CustomCursor;
