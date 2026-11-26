"use client";

import React from "react";
import { BRANDS } from "@/data/data";

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
            {BRANDS.map((b, idx) => (
              <div key={`brand-${idx}`} className="a-client">
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
            ))}
          </div>

          <div className="js-marquee" aria-hidden="true">
            {BRANDS.map((b, idx) => (
              <div key={`brand-dup-${idx}`} className="a-client">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
