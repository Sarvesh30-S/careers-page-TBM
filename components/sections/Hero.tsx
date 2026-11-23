import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero wrap" id="top">
      <h1 className="kin">
        <span className="ln">Curiosity gets you in.</span>{" "}
        <span className="ln">
          <mark className="draw">Courage</mark> gets you heard.
        </span>
      </h1>

      <div className="row">
        <p className="lede">
          TBM is a team in Lower Parel, Mumbai where a sharp question beats a loud opinion, and
          whoever is closest to the problem gets to fix it. Bring the questions. Say the hard thing.
          Then get it done.
        </p>

        <div className="ctas">
          <Link className="btn primary" href="#roles">
            View openings <span className="arr" aria-hidden="true">→</span>
          </Link>
          <Link className="btn ghost" href="#life">
            See how we think
          </Link>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <i></i>Scroll. We&apos;ll wait.
      </div>
    </section>
  );
}
