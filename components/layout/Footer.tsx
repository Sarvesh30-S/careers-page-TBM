"use client";

import React from "react";

interface FooterProps {
  onTeamLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTeamLogin }) => {
  const handleTeamLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.location.hash = "#dashboard";
    }
    if (onTeamLogin) {
      onTeamLogin();
    }
  };

  return (
    <footer>
      <div className="wrap">
        <div className="grid">
          <h2>Don&apos;t see your role? Tell us a problem you&apos;d love to own.</h2>
          <div className="footer-cols">
            <div className="footer-col footer-col-connect">
              <p className="kicker" style={{ marginBottom: "12px" }}>
                Connect with us
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href="mailto:careers@theboredmonkey.com"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>careers@theboredmonkey.com</span>
                </a>
                <a
                  href="tel:8779577694"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+91 87795 77694</span>
                </a>
              </div>
            </div>
            <div className="footer-col footer-col-find">
              <p className="kicker" style={{ marginBottom: "12px" }}>
                Find us
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0, marginTop: "3px" }}
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <address style={{ fontStyle: "normal", lineHeight: 1.6 }}>
                  TheBoredMonkey HQ
                  <br />
                  2nd Floor, Todi Building
                  <br />
                  Mathuradas Mills Compound
                  <br />
                  Near Kerala Quarters, Lower Parel
                  <br />
                  Mumbai, Maharashtra 400013
                </address>
              </div>
            </div>
            <div className="footer-col footer-col-follow">
              <p className="kicker" style={{ marginBottom: "12px" }}>
                Follow
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href="https://www.instagram.com/theboredmonkeyofficial?evlk=ejA4anpiM2E3eWFs"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                  </svg>
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/theboredmonkey/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://theboredmonkey.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>theboredmonkey.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="fineprint">
          <span>© TheBoredMonkey. We keep applications for 12 months, then delete them.</span>
          <a href="#dashboard" className="link" onClick={handleTeamLoginClick}>
            Team login
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
