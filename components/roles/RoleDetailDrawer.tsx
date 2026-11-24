"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Role } from "@/types";

interface RoleDetailDrawerProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (role: Role) => void;
}

export const expTxt = (e: [number, number]): string => {
  return e[1] <= 1 ? "0–1 yr" : `${e[0]}–${e[1]} yrs`;
};

export const RoleDetailDrawer: React.FC<RoleDetailDrawerProps> = ({
  role,
  isOpen,
  onClose,
  onApply,
}) => {
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus management and body scroll locking
  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 60);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        lastActiveElementRef.current?.focus?.();
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  if (!role || !mounted) return null;

  return createPortal(
    <>
      {/* Background Overlay / Scrim */}
      <div
        className={`scrim ${isOpen ? "on" : ""}`}
        id="scrim"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Role Detail Drawer */}
      <aside
        className={`drawer ${isOpen ? "on" : ""}`}
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dr-title"
        aria-hidden={!isOpen}
      >
        <div className="dh">
          <span className="small muted">{role.dept}</span>
          <button
            ref={closeBtnRef}
            className="x"
            onClick={onClose}
            aria-label="Close role details"
            data-close="drawer"
          >
            ×
          </button>
        </div>

        <div className="db">
          <h2 id="dr-title">{role.title}</h2>
          <div className="meta-row">
            <span>{role.location || "Lower Parel, Mumbai"}</span>
            <span>{role.type}</span>
            <span>{expTxt(role.exp)}</span>
            <span>{role.pay}</span>
          </div>

          <p className="problem">{role.problem}</p>

          <h4>What you'll do</h4>
          <ul className="lines">
            {role.resp.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <h4>Must-haves</h4>
          <ul className="lines">
            {role.must.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          {role.nice && role.nice.length > 0 && (
            <>
              <h4>Good to have</h4>
              <ul className="lines">
                {role.nice.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <h4>How you'll know it's working</h4>
          <p>{role.metrics}</p>
        </div>

        <div className="df">
          <span className="small muted">We reply within 48 hours.</span>
          <button
            className="btn accent"
            data-apply={role.id}
            onClick={() => onApply?.(role)}
          >
            Apply for this role <span className="arr" aria-hidden="true">→</span>
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default RoleDetailDrawer;
