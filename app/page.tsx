"use client";

import React, { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import CulturePhoto from "@/components/sections/CulturePhoto";
import WhyLadder from "@/components/sections/WhyLadder";
import { SecondOrderThinking } from "@/components/sections/SecondOrderThinking";
import { CoreValues } from "@/components/sections/CoreValues";
import { CultureFitQuiz } from "@/components/sections/CultureFitQuiz";
import { HiringTimeline } from "@/components/sections/HiringTimeline";
import { OpenRoles } from "@/components/sections/OpenRoles";
import Footer from "@/components/layout/Footer";
import DashboardContainer from "@/components/dashboard/DashboardContainer";

export default function CareersPage() {
  const [isReady, setIsReady] = useState(false);

  const handleTypingComplete = useCallback(() => {
    setIsReady(true);
  }, []);

  return (
    <>
      <a className="sr" href="#main">
        Skip to content
      </a>

      {/* Main Public Site Wrapper */}
      <div id="site" className={isReady ? "page-ready" : "page-typing"}>
        <Header />
        <main id="main">
          <Hero isReady={isReady} onTypingComplete={handleTypingComplete} />
          <CulturePhoto />
          <WhyLadder />
          <SecondOrderThinking />
          <CoreValues />
          <CultureFitQuiz />
          <HiringTimeline />
          <OpenRoles />
        </main>
        <Footer />
      </div>

      {/* Internal HR Dashboard Portal */}
      <DashboardContainer />
    </>
  );
}
