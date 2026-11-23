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
  const [emailInput, setEmailInput] = useState<string>("people@theboredmonkey.com");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState<boolean>(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // 1. Load Google Identity Services SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGoogle = () => {
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
            text: "continue_with",
            shape: "pill",
            width: "320",
            logo_alignment: "left",
          });
        }

        setGoogleReady(true);
      } catch (err) {
        console.error("Error initializing Google Identity Services:", err);
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
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

  // 3. Fallback / Direct Work Email Verification
  const handleDirectEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devEmail: emailInput }),
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
      console.error("Sign-in error:", err);
      setErrorMsg("Failed to authenticate.");
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="box" id="loginf" style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
          <Image
            className="logo logo-light"
            src="/assets/logo-light.png"
            alt="TheBoredMonkey"
            width={137}
            height={24}
            priority
          />
          <Image
            className="logo logo-dark"
            src="/assets/logo-dark.png"
            alt="TheBoredMonkey"
            width={137}
            height={24}
            priority
          />
        </div>

        <h1 style={{ marginBottom: "4px" }}>Team login</h1>
        <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 16px" }}>
          Authorized @theboredmonkey.com admin portal
        </p>

        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: "12px 14px",
              background: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.35)",
              borderRadius: "8px",
              color: "var(--bad, #dc2626)",
              fontSize: "13.5px",
              lineHeight: "1.4",
              textAlign: "left",
            }}
          >
            <strong>Access Denied:</strong> {errorMsg}
          </div>
        )}

        {/* Google Sign-In Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "44px",
            margin: "12px 0 8px",
          }}
        >
          <div ref={googleBtnRef}></div>
        </div>

        {loading && (
          <p style={{ fontSize: "13.5px", color: "var(--muted)", margin: "8px 0" }}>
            Verifying authorized credentials...
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "16px 0",
            color: "var(--muted)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }}></span>
          <span>or verify work email</span>
          <span style={{ flex: 1, height: "1px", background: "var(--line)" }}></span>
        </div>

        <form onSubmit={handleDirectEmailSubmit} style={{ display: "grid", gap: "14px", textAlign: "left" }}>
          <div className="field">
            <label htmlFor="lg-e">Work email</label>
            <input
              id="lg-e"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@theboredmonkey.com"
              autoComplete="email"
              required
            />
          </div>

          <button className="btn primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Verifying..." : "Verify & Sign in"} <span className="arr" aria-hidden="true">→</span>
          </button>
        </form>

        <p className="note" style={{ textAlign: "center", marginTop: "14px", fontSize: "12.5px" }}>
          Only team members with an authorized <strong>@theboredmonkey.com</strong> Google account can access this portal. All authorized logins receive full <strong>Admin</strong> permissions.
        </p>

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <a
            className="link small"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onBackToSite();
            }}
          >
            Back to the careers site
          </a>
        </div>
      </div>
    </main>
  );
};

export default DashboardLogin;