"use client";

import React from "react";
import { BRANDS } from "@/data/data";

const BRIGHT_LOGOS = new Set([
  "fashion",
  "go paisa",
  "Luvlap",
  "meesho",
  "Momamia",
  "OZiva",
  "R for Rabbit",
  "rorosaur",
  "Vilvah",
  "streax",
  "yogabar",
  "Almond House",
]);

export default function BrandMarquee() {
  return (
    <section className="alioth-page-nav brands-section" aria-labelledby="brands-h">
      <div className="wrap">
        <p className="kicker" id="brands-h">
          Brands our team has made things for
        </p>
      </div>

      <div className="page-title gapissue">
        <div className="js-marquee-wrapper">
          <div className="js-marquee">
            {BRANDS.map((b, idx) => {
              const isDark = !BRIGHT_LOGOS.has(b.name);
              return (
                <div key={`brand-${idx}`} className={`a-client ${isDark ? "dark-asset" : "light-asset"}`}>
                  <a
                    href="#."
                    className="a1"
                    onClick={(e) => e.preventDefault()}
                    title={b.name}
                  >
                    <img
                      alt={b.name}
                      src={b.logo}
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                </div>
              );
            })}
          </div>

          <div className="js-marquee" aria-hidden="true">
            {BRANDS.map((b, idx) => {
              const isDark = !BRIGHT_LOGOS.has(b.name);
              return (
                <div key={`brand-dup-${idx}`} className={`a-client ${isDark ? "dark-asset" : "light-asset"}`}>
                  <a
                    href="#."
                    className="a1"
                    tabIndex={-1}
                    onClick={(e) => e.preventDefault()}
                  >
                    <img
                      alt=""
                      src={b.logo}
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
