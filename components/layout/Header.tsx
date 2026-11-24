import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="nav">
      <div className="wrap">
        <Link href="#top" aria-label="TheBoredMonkey home">
          {/* Authentic dual-theme logo elements */}
          <img
            className="logo logo-light"
            src="/assets/logo-light.png"
            alt="TheBoredMonkey"
            width={137}
            height={24}
          />
          <img
            className="logo logo-dark"
            src="/assets/logo-dark.png"
            alt="TheBoredMonkey"
            width={137}
            height={24}
          />
        </Link>

        <nav aria-label="Main">
          <ul>
            <li>
              <Link href="#top">Careers</Link>
            </li>
            <li>
              <Link href="#life">Life at TBM</Link>
            </li>
            <li>
              <Link href="#hiring">How we hire</Link>
            </li>
          </ul>
        </nav>

        <Link className="btn primary sm" href="#roles">
          <span className="btn-text">View openings</span>
          <span className="arr" aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}
