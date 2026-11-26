import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="nav">
      <div className="wrap">
        <a href="https://theboredmonkey.com/#" aria-label="TheBoredMonkey home">
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
        </a>

        <nav aria-label="Main">
          <ul>
            <li>
              <Link href="#top">Careers</Link>
            </li>
            <li>
              <Link href="#life">TBM&apos;s Tribe</Link>
            </li>
            <li>
              <Link href="#think">How we think</Link>
            </li>
            <li>
              <Link href="#values">Core values</Link>
            </li>
            <li>
              <Link href="#roles">Open roles</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
