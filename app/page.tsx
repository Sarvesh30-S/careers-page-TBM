"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import BrandMarquee from "@/components/sections/BrandMarquee";
import CulturePhoto from "@/components/sections/CulturePhoto";
import ThinkGames from "@/components/sections/ThinkGames";
import { CoreValues } from "@/components/sections/CoreValues";
import { OpenRoles } from "@/components/sections/OpenRoles";
import Footer from "@/components/layout/Footer";
import DashboardContainer from "@/components/dashboard/DashboardContainer";

export default function CareersPage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Support ?theme=dark or ?theme=light URL parameter
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const theme = params.get("theme");
      if (theme === "dark" || theme === "light") {
        document.documentElement.setAttribute("data-theme", theme);
      }
    }

    // Ensure browser starts at the top and disable automatic scroll restoration
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (window.location.hash && window.location.hash !== "#dashboard") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  useEffect(() => {
    // Lock scroll to top while slogan is typing without affecting layout width
    if (!isReady && typeof window !== "undefined" && window.location.hash !== "#dashboard") {
      window.scrollTo(0, 0);

      const preventDefaultScroll = (e: Event) => {
        e.preventDefault();
      };

      const preventKeyScroll = (e: KeyboardEvent) => {
        if (
          ["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
            e.code
          )
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener("wheel", preventDefaultScroll, { passive: false });
      window.addEventListener("touchmove", preventDefaultScroll, { passive: false });
      window.addEventListener("keydown", preventKeyScroll);

      return () => {
        window.removeEventListener("wheel", preventDefaultScroll);
        window.removeEventListener("touchmove", preventDefaultScroll);
        window.removeEventListener("keydown", preventKeyScroll);
      };
    }
  }, [isReady]);

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
          <BrandMarquee />
          <CulturePhoto />
          <ThinkGames />
          <CoreValues />
          <OpenRoles />
        </main>
        <Footer />
      </div>

      {/* Internal HR Dashboard Portal */}
      <DashboardContainer />
    </>
  );
}
