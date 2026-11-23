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
          <div>
            <p className="kicker" style={{ marginBottom: "8px" }}>
              Write to us
            </p>
            <a href="mailto:careers@theboredmonkey.com">careers@theboredmonkey.com</a>
          </div>
          <div>
            <p className="kicker" style={{ marginBottom: "8px" }}>
              Find us
            </p>
            <p>
              Mathuradas Mills Compound,
              <br />
              Lower Parel, Mumbai
            </p>
          </div>
          <div>
            <p className="kicker" style={{ marginBottom: "8px" }}>
              Follow
            </p>
            <p>
              <a
                href="https://www.instagram.com/theboredmonkey/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>{" "}
              ·{" "}
              <a
                href="https://www.linkedin.com/company/theboredmonkey/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>{" "}
              ·{" "}
              <a
                href="https://theboredmonkey.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                theboredmonkey.com
              </a>
            </p>
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
