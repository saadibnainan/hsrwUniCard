"use client";

import React, { useState } from "react";

interface LoginViewProps {
  onLoginSuccess: (email: string, name?: string) => void;
}

/** HSRW "Y" logo mark — recreated as inline SVG matching the official logo shape */
function HSRWMark({ size = 40, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  const arm1 = variant === "dark" ? "#FFFFFF" : "#3374B5";
  const arm2 = variant === "dark" ? "rgba(255,255,255,0.55)" : "#28255A";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left arm going down-left */}
      <path d="M12 6 L30 30 L30 54" stroke={arm1} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right arm going down-right */}
      <path d="M48 6 L30 30" stroke={arm2} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [bioOpen,  setBioOpen]  = useState(false);
  const [bioStep,  setBioStep]  = useState<0 | 1 | 2>(0);

  const validate = (): string | null => {
    if (!email.trim()) return "Please enter your university email.";
    if (!/@hsrw\.org$/i.test(email.trim())) return "Email must end with @hsrw.org";
    if (password.length < 4) return "Password must be at least 4 characters.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const localPart = email.trim().split("@")[0];
      const name = localPart.split(".").map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      onLoginSuccess(email.trim(), name);
    }, 900);
  };

  const startBio = () => {
    setBioOpen(true);
    setBioStep(0);
    setTimeout(() => setBioStep(1), 1100);
    setTimeout(() => setBioStep(2), 2300);
      setTimeout(() => {
        setBioOpen(false);
        onLoginSuccess("mohammad-mushfiqur-rahman.joy@hsrw.org", "Mushfiqur Rahman");
      }, 3100);
  };

  return (
    <div className="login-page">
      {/* ── Header Banner (HSRW navy) ── */}
      <div className="login-header">
        <div className="login-header-logo">
          <HSRWMark size={44} variant="dark" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF", letterSpacing: 0.2 }}>
              HOCHSCHULE<br />RHEIN-WAAL
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2, letterSpacing: 0.3 }}>
              Rhine-Waal University of Applied Sciences
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", letterSpacing: -0.3 }}>
            UniCard Portal
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 4, lineHeight: 1.5 }}>
            Your unified digital student identity card
          </p>
        </div>

        {/* Green accent strip at bottom of header */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #7CB825 0%, #3AAEC6 100%)" }} />
      </div>

      {/* ── Login Form Body ── */}
      <div className="login-body">

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="field-label" htmlFor="login-email">University Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="firstname.lastname@hsrw.org"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              autoComplete="email"
              autoCapitalize="none"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              background: "#FBE8EC", border: "1px solid #F5C0CC",
              borderRadius: 8, padding: "10px 12px",
              fontSize: 13, color: "var(--hsrw-red)", display: "flex", gap: 8, alignItems: "flex-start"
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button
            id="btn-login"
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <svg className="spin" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or use biometrics</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Biometric / FaceID button */}
        <button
          id="btn-faceid"
          className="btn btn-ghost"
          onClick={startBio}
          type="button"
          style={{ gap: 10 }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2"/>
            <circle cx="12" cy="12" r="3" strokeWidth="1.8"/>
            <path strokeLinecap="round" d="M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5"/>
          </svg>
          Face ID / Touch ID
        </button>

        {/* Demo hint */}
        <div style={{
          marginTop: 32, padding: "14px 16px",
          background: "#F2F5FB", border: "1px solid #D9E2F5",
          borderRadius: 10, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6
        }}>
          <strong style={{ color: "var(--hsrw-blue)" }}>Demo credentials</strong><br />
          Email: <code style={{ background: "#E6ECF7", padding: "1px 4px", borderRadius: 4 }}>mohammad-mushfiqur-rahman.joy@hsrw.org</code><br />
          Password: <code style={{ background: "#E6ECF7", padding: "1px 4px", borderRadius: 4 }}>Joy@1234</code>
          <br />Or tap <strong>Face ID / Touch ID</strong> to skip login.
        </div>
      </div>

      {/* ── Biometric Overlay ── */}
      {bioOpen && (
        <div className="overlay" style={{ alignItems: "center" }}>
          <div style={{
            background: "var(--bg-card)", borderRadius: 24, padding: "40px 28px 36px",
            width: "calc(100% - 48px)", maxWidth: 320, textAlign: "center",
            animation: "slideUp 0.25s cubic-bezier(0.32,0.72,0,1)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)"
          }}>
            {/* Animated ring + icon */}
            <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 24px" }}>
              {bioStep < 2 && (
                <>
                  <div style={{
                    position: "absolute", inset: 0, border: "2px solid var(--hsrw-blue)",
                    borderRadius: "50%", opacity: 0, animation: "nfcExpand 1.4s infinite"
                  }} />
                  <div style={{
                    position: "absolute", inset: 0, border: "2px solid var(--hsrw-blue)",
                    borderRadius: "50%", opacity: 0, animation: "nfcExpand 1.4s 0.5s infinite"
                  }} />
                </>
              )}
              <div style={{
                position: "absolute", inset: "14px",
                background: bioStep === 2 ? "var(--hsrw-green)" : "var(--hsrw-blue)",
                borderRadius: "50%", transition: "background 0.3s",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(46,87,165,0.3)"
              }}>
                {bioStep === 2
                  ? <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  : <svg width="26" height="26" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2"/>
                      <circle cx="12" cy="12" r="3" strokeWidth="1.8"/>
                    </svg>
                }
              </div>
            </div>

            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
              {bioStep === 0 && "Scanning…"}
              {bioStep === 1 && "Verifying…"}
              {bioStep === 2 && "Identity Verified"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
              {bioStep === 0 && "Look directly at your device"}
              {bioStep === 1 && "Checking biometric signature"}
              {bioStep === 2 && "Welcome back, Mushfiqur!"}
            </p>

            {/* HSRW branding strip */}
            <div style={{ marginTop: 24, padding: "10px", background: "var(--bg-app)", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <HSRWMark size={22} variant="light" />
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>HSRW Secure Biometric Login</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
