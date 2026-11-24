"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { DashboardSession } from "@/types";

declare global {
  interface Window {
    google?: any;
  }
}

interface DashboardLoginProps {
  onLogin: (session: DashboardSession) => void;
  onBackToSite: () => void;
}

export const DashboardLogin: React.FC<DashboardLoginProps> = ({
  onLogin,
  onBackToSite,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "716631923857-3540jbi1o7baugi60mj72sf62tcc6cue.apps.googleusercontent.com";

  // 1. Initialize Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined") return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !clientId) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "rectangular",
            width: 320,
            logo_alignment: "left",
          });
        }

        setGoogleLoaded(true);
      } catch (err) {
        console.error("Error initializing Google Identity Services:", err);
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      document.head.appendChild(script);
    }
  }, [clientId]);

  // 2. Handle Google OAuth ID Token
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.error || "Access denied. Only @theboredmonkey.com accounts are authorized."
        );
        setLoading(false);
        return;
      }

      onLogin(data.user);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setErrorMsg("Network error connecting to authentication server.");
      setLoading(false);
    }
  };

  const handleManualPrompt = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("One-tap dismissed or not displayed");
        }
      });
    }
  };

  return (
    <main
      className="login-page-container"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#ffffff",
        fontFamily: "var(--sans, system-ui, -apple-system, sans-serif)",
      }}
    >
      <div
        className="login-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "44px 36px 36px",
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* TheBoredMonkey Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
          <Image
            src="/assets/logo-light.png"
            alt="TheBoredMonkey"
            width={164}
            height={29}
            priority
            style={{ height: "auto", width: "164px", display: "block" }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "19px",
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 6px 0",
            letterSpacing: "-0.015em",
            lineHeight: 1.25,
          }}
        >
          TBM Careers Portal
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "13.5px",
            color: "#64748b",
            margin: "0 0 26px 0",
            lineHeight: 1.4,
          }}
        >
          Sign in with your official TheBoredMonkey account.
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            style={{
              width: "100%",
              padding: "10px 14px",
              marginBottom: "18px",
              background: "rgba(220, 38, 38, 0.06)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "12.5px",
              lineHeight: 1.4,
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Google Sign-In Button */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "44px",
            position: "relative",
          }}
        >
          {/* Native Styled Fallback / Base Button */}
          <button
            type="button"
            onClick={handleManualPrompt}
            style={{
              width: "320px",
              height: "42px",
              border: "1px solid #dadce0",
              borderRadius: "6px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#3c4043",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "background 0.15s ease, border-color 0.15s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Google GIS Container overlaid directly on top */}
          <div
            ref={googleBtnRef}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "320px",
              height: "42px",
              overflow: "hidden",
            }}
          />
        </div>

        {loading && (
          <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 0" }}>
            Verifying account...
          </p>
        )}

        {/* Restricted Footer Note */}
        <p
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            margin: "26px 0 0 0",
            lineHeight: 1.4,
          }}
        >
          Restricted to approved @theboredmonkey.com accounts.
        </p>
      </div>

      {/* Return to site link */}
      <div style={{ marginTop: "18px" }}>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onBackToSite();
          }}
          style={{
            fontSize: "13px",
            color: "#64748b",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <span aria-hidden="true">←</span> Back to careers site
        </a>
      </div>
    </main>
  );
};

export default DashboardLogin;