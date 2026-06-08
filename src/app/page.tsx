"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  INITIAL_PROFILE, INITIAL_BOOKS, INITIAL_TRANSACTIONS,
  StudentProfile, LibraryBook, Transaction, AuditLog, CANTEEN_MENUS
} from "@/utils/mockData";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import LoginView from "@/components/LoginView";

/* ─────────────────────────────────────────────────────────────
   HSRW Y-Logo inline SVG
───────────────────────────────────────────────────────────── */
// Logo renders white on dark backgrounds (nav bar / login header)
function HSRWMark({ size = 28, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  // On dark bg (variant="dark"): both arms are bright white/near-white
  // On light bg (variant="light"): use the brand navy/blue colors
  const arm1 = variant === "dark" ? "#FFFFFF" : "#3374B5";
  const arm2 = variant === "dark" ? "rgba(255,255,255,0.55)" : "#28255A";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M12 6 L30 30 L30 54" stroke={arm1} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 6 L30 30" stroke={arm2} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   DEVICE DETECTION
───────────────────────────────────────────────────────────── */
function getWalletPlatform(): "apple" | "google" {
  if (typeof navigator === "undefined") return "apple";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Macintosh/i.test(ua) && !/Android/i.test(ua)) return "apple";
  return "google";
}

/** True when window width is phone-sized (≤ 767px). Used to show/hide NFC. */
function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

/* ─────────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────────── */
type LogType = AuditLog["type"];

function ChevronRight() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: PERSONAL
───────────────────────────────────────────────────────────── */
function PersonalTab({ profile, onBlock, onReportLost }: {
  profile: StudentProfile;
  onBlock: () => void;
  onReportLost: () => void;
}) {
  const [flipped,      setFlipped]      = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmLost,  setConfirmLost]  = useState(false);

  return (
    <div>
      {/* ── Digital ID Card ── */}
      <div style={{ padding: "16px 16px 8px" }}>
        <div
          className={`id-card-scene${flipped ? " flipped" : ""}`}
          onClick={() => setFlipped(f => !f)}
          role="button"
          aria-label="Tap to flip student ID card"
        >
          <div className="id-card-inner">

            {/* Front */}
            <div className="id-card-face id-card-front">
              {profile.isBlocked && (
                <div className="card-blocked-stamp">
                  <span className="card-blocked-label">BLOCKED</span>
                </div>
              )}

              {/* Top row: logo + chip */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.9, lineHeight: 1 }}>Hochschule</div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.9 }}>Rhein-Waal</div>
                  <div style={{ fontSize: 7, opacity: 0.5, marginTop: 1 }}>Rhine-Waal University of Applied Sciences</div>
                </div>
                {/* SIM chip */}
                <div style={{ width: 26, height: 20, borderRadius: 3, background: "linear-gradient(135deg, #f0c040, #b8860b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 3px rgba(0,0,0,0.3)" }} />
              </div>

              {/* Mid: avatar + info */}
              <div style={{ display: "flex", gap: 10, marginTop: "auto", position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 46, height: 58, borderRadius: 6,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "flex-end", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0
                }}>
                  <svg width="34" height="40" viewBox="0 0 24 28" fill="rgba(255,255,255,0.35)">
                    <circle cx="12" cy="8" r="5"/><path d="M4 24c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: -0.2, lineHeight: 1.2 }}>{profile.name}</div>
                  <div style={{ fontSize: 9.5, opacity: 0.65, marginTop: 3, lineHeight: 1.4 }}>{profile.degreeProgram}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", marginTop: 5 }}>
                    <div>
                      <div style={{ fontSize: 7, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Matrikelnr.</div>
                      <div style={{ fontSize: 10, fontWeight: 700 }}>{profile.studentId}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 7, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Issue</div>
                      <div style={{ fontSize: 10, fontWeight: 700 }}>#{profile.issueNumber}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: expiry + service dots */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 7, borderTop: "1px solid rgba(255,255,255,0.12)", position: "relative", zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: 7, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>Valid Until</div>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>{profile.validUntil}</div>
                </div>
                {/* Service chips */}
                <div style={{ display: "flex", gap: 3 }}>
                  {["NFC", "Mensa", "Lib", "VRR"].map(s => (
                    <div key={s} style={{
                      fontSize: 6.5, padding: "2px 4px", borderRadius: 3,
                      background: profile.isBlocked ? "rgba(255,255,255,0.08)" : "rgba(124,184,37,0.25)",
                      border: `1px solid ${profile.isBlocked ? "rgba(255,255,255,0.1)" : "rgba(124,184,37,0.4)"}`,
                      fontWeight: 700, letterSpacing: 0.3, color: profile.isBlocked ? "rgba(255,255,255,0.3)" : "white"
                    }}>{s}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="id-card-face id-card-back">
              <div style={{ fontSize: 7.5, opacity: 0.45, letterSpacing: 0.8, textTransform: "uppercase" }}>
                RFID Dual-Interface — Not Transferable — Hochschule Rhein-Waal
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, marginTop: 6 }}>
                <div style={{ fontSize: 7.5, opacity: 0.5, lineHeight: 1.5 }}>
                  This card is personal. If found please return to HSRW Student Service. Kleve: +49 2821 806 73-360 | Lintfort: +49 2842 908 25-0
                </div>
              </div>

              {/* Barcode */}
              <div style={{ background: "white", borderRadius: 6, padding: "8px 6px 6px", marginTop: "auto" }}>
                <div style={{ display: "flex", height: 28, justifyContent: "center", gap: "1px", alignItems: "stretch" }}>
                  {[3,1,2,1,3,1,1,2,1,2,1,3,1,1,2,1,2,1,3,1,2,1,1,2,1].map((w, i) => (
                    <div key={i} style={{ width: w * 2, background: i % 2 === 0 ? "#111" : "white", flexShrink: 0 }} />
                  ))}
                </div>
                <div style={{ textAlign: "center", fontSize: 7, color: "#555", marginTop: 4, fontFamily: "monospace", letterSpacing: "0.3em" }}>
                  {profile.cardSerial.replace("HSRW-", "")}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 7, opacity: 0.4 }}>
                <span>UID: {profile.chipUid}</span>
                <span>{profile.cardSerial}</span>
              </div>
            </div>

          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
          Tap card to flip • Hover to view shine
        </p>
      </div>

      {/* ── Personal Info ── */}
      <div className="section-label">Personal Information</div>
      <div className="surface" style={{ margin: "0 16px" }}>
        {[
          ["Full Name", profile.name],
          ["Matrikelnummer", profile.studentId],
          ["Date of Birth", profile.birthDate],
          ["Study Programme", profile.degreeProgram],
          ["Campus", profile.campus],
          ["Valid Until", profile.validUntil],
          ["University Email", profile.email],
        ].map(([label, value], i) => (
          <div key={i} className="list-item">
            <div className="list-text">
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 1 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Card Management ── */}
      <div className="section-label" style={{ marginTop: 20 }}>Card Management</div>
      <div className="surface" style={{ margin: "0 16px" }}>
        <button
          id="btn-block-card"
          className="list-item tappable"
          style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => setConfirmBlock(true)}
        >
          <div className={`list-icon ${profile.isBlocked ? "icon-green" : "icon-red"}`}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {profile.isBlocked
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0m-4 8v2m-6 3h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              }
            </svg>
          </div>
          <div className="list-text">
            <div className="list-title">{profile.isBlocked ? "Unblock Card" : "Block Card"}</div>
            <div className="list-sub">{profile.isBlocked ? "Reactivate all services" : "Suspend all access immediately"}</div>
          </div>
          <ChevronRight />
        </button>
        <button
          id="btn-report-lost"
          className="list-item tappable"
          style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => setConfirmLost(true)}
        >
          <div className="list-icon icon-orange">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div className="list-text">
            <div className="list-title">Report Lost / Stolen</div>
            <div className="list-sub">Freeze card & re-issue credentials</div>
          </div>
          <ChevronRight />
        </button>
      </div>

      {/* Block confirmation sheet */}
      {confirmBlock && (
        <div className="overlay" onClick={() => setConfirmBlock(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">{profile.isBlocked ? "Unblock Card" : "Block Card"}</p>
            <p className="sheet-sub">
              {profile.isBlocked
                ? "Reactivating will immediately restore access to Mensa, Library, NFC, and transit services."
                : "Blocking will immediately suspend all RFID, barcode, and transport functions. You can unblock at any time."
              }
            </p>
            <div className="gap-stack">
              <button className={`btn ${profile.isBlocked ? "btn-green" : "btn-danger"}`}
                onClick={() => { onBlock(); setConfirmBlock(false); }}>
                {profile.isBlocked ? "Yes, Reactivate Card" : "Yes, Block Card Now"}
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmBlock(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Lost confirmation sheet */}
      {confirmLost && (
        <div className="overlay" onClick={() => setConfirmLost(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Report Card Lost</p>
            <p className="sheet-sub">
              This will immediately freeze your current card, invalidate all credentials, and generate a new digital issue. A replacement fee may apply for the physical card.
            </p>
            <div className="gap-stack">
              <button className="btn btn-danger"
                onClick={() => { onReportLost(); setConfirmLost(false); }}>
                Report Lost & Re-issue
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmLost(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: LIBRARY
───────────────────────────────────────────────────────────── */
function LibraryTab({ profile, books, onUpdateBooks }: {
  profile: StudentProfile;
  books: LibraryBook[];
  onUpdateBooks: (b: LibraryBook[]) => void;
}) {
  const [barcodeOpen,  setBarcodeOpen]  = useState(false);
  const [renewedId,    setRenewedId]    = useState<string | null>(null);

  const isOverdue = (due: string) => new Date(due) < new Date();

  const renew = (id: string) => {
    const updated = books.map(b => {
      if (b.id !== id || b.renewCount >= 3 || profile.isBlocked) return b;
      const d = new Date(b.dueDate);
      d.setDate(d.getDate() + 14);
      setRenewedId(id);
      setTimeout(() => setRenewedId(null), 2000);
      return { ...b, dueDate: d.toISOString().split("T")[0], renewCount: b.renewCount + 1 };
    });
    onUpdateBooks(updated);
  };

  return (
    <div>
      {/* Summary banner */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          background: "linear-gradient(135deg, var(--hsrw-blue) 0%, var(--hsrw-navy) 100%)",
          borderRadius: 14, padding: "18px 20px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
              Active Loans
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1 }}>{books.length}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
              {books.filter(b => isOverdue(b.dueDate)).length} overdue
            </div>
          </div>
          <button
            id="btn-library-barcode"
            onClick={() => { if (!profile.isBlocked) setBarcodeOpen(true); }}
            disabled={profile.isBlocked}
            style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
              color: "white", borderRadius: 10, padding: "10px 16px",
              fontSize: 13, fontWeight: 600, cursor: profile.isBlocked ? "not-allowed" : "pointer",
              opacity: profile.isBlocked ? 0.5 : 1
            }}
          >
            Scan Barcode
          </button>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 16 }}>Borrowed Books</div>
      <div className="surface" style={{ margin: "0 16px" }}>
        {books.map(b => (
          <div key={b.id} className="list-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 10, cursor: "default" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div className="list-icon icon-blue" style={{ flexShrink: 0, marginTop: 2 }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: "var(--text-primary)" }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{b.author}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 50 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className={`badge ${isOverdue(b.dueDate) ? "badge-red" : "badge-green"}`}>
                  {isOverdue(b.dueDate) ? "⚠ Overdue" : "Due"} {new Date(b.dueDate).toLocaleDateString("de-DE")}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.renewCount}/3 renewals</span>
              </div>
              {renewedId === b.id ? (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--hsrw-green-dark)" }}>✓ Extended!</span>
              ) : (
                <button
                  id={`btn-renew-${b.id}`}
                  onClick={() => renew(b.id)}
                  disabled={b.renewCount >= 3 || profile.isBlocked}
                  style={{
                    border: "1.5px solid var(--border)", background: "transparent",
                    borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                    cursor: b.renewCount >= 3 || profile.isBlocked ? "not-allowed" : "pointer",
                    opacity: b.renewCount >= 3 || profile.isBlocked ? 0.4 : 1,
                    color: "var(--hsrw-blue)"
                  }}
                >
                  {b.renewCount >= 3 ? "Max Renewals" : "Renew"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Barcode sheet */}
      {barcodeOpen && (
        <div className="overlay" onClick={() => setBarcodeOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Library Barcode</p>
            <p className="sheet-sub">Hold flat below the kiosk laser scanner for checkout or gate access.</p>
            <div style={{ background: "white", borderRadius: 14, padding: "22px 16px", textAlign: "center", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", height: 52, justifyContent: "center", gap: "1px", alignItems: "stretch" }}>
                {[3,1,2,1,3,1,1,2,1,2,1,3,1,1,2,1,2,1,3,1,2,1,1,2,1,2,1,3].map((w, i) => (
                  <div key={i} style={{ width: w * 2.5, background: i % 2 === 0 ? "#111" : "white", flexShrink: 0 }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 8, fontFamily: "monospace", letterSpacing: "0.35em" }}>
                {profile.cardSerial.replace("HSRW-", "")}
              </div>
            </div>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setBarcodeOpen(false)}>Close</button>
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: MENSA
───────────────────────────────────────────────────────────── */
function MensaTab({ profile, balance, transactions, onUpdateBalance, onAddTransaction }: {
  profile: StudentProfile;
  balance: number;
  transactions: Transaction[];
  onUpdateBalance: (n: number) => void;
  onAddTransaction: (tx: Transaction) => void;
}) {
  const [campus,     setCampus]     = useState<"Kleve" | "Kamp-Lintfort">(profile.campus);
  const [topUpOpen,  setTopUpOpen]  = useState(false);
  const [amount,     setAmount]     = useState(20);
  const [method,     setMethod]     = useState<"paypal" | "card" | "giropay">("paypal");
  const [processing, setProcessing] = useState(false);

  const recentTx = transactions.filter(t => t.category === "Mensa").slice(0, 4);
  const menu = CANTEEN_MENUS[campus];

  const catBadge: Record<string, string> = {
    Vegan: "badge-green", Vegetarian: "badge-teal",
    Meat: "badge-orange", Fish: "badge-blue", Dessert: "badge-grey"
  };

  const doTopUp = () => {
    setProcessing(true);
    setTimeout(() => {
      onUpdateBalance(balance + amount);
      onAddTransaction({
        id: `tx-${Date.now()}`,
        description: `Mensa Top-up (${method === "paypal" ? "PayPal" : method === "card" ? "Card" : "giropay"})`,
        amount, date: new Date().toISOString(), category: "Mensa"
      });
      setProcessing(false);
      setTopUpOpen(false);
    }, 1200);
  };

  return (
    <div>
      {/* Balance card */}
      <div style={{ padding: "16px 16px 0" }}>
        <div className="balance-hero">
          <div className="hero-label">Smart Card Balance</div>
          <div className="hero-amount">€{balance.toFixed(2)}</div>
          <div className="hero-sub">Mensa • Library • Printing</div>
          <button
            id="btn-topup"
            onClick={() => setTopUpOpen(true)}
            disabled={profile.isBlocked}
            style={{
              marginTop: 16, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)",
              color: "white", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600,
              cursor: profile.isBlocked ? "not-allowed" : "pointer", opacity: profile.isBlocked ? 0.5 : 1
            }}
          >
            + Top Up Balance
          </button>
        </div>
      </div>

      {/* Transactions */}
      {recentTx.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 20 }}>Recent Transactions</div>
          <div className="surface" style={{ margin: "0 16px" }}>
            {recentTx.map(tx => (
              <div key={tx.id} className="list-item">
                <div className={`list-icon ${tx.amount > 0 ? "icon-green" : "icon-teal"}`}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    {tx.amount > 0
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4"/>
                    }
                  </svg>
                </div>
                <div className="list-text">
                  <div className="list-title">{tx.description}</div>
                  <div className="list-sub">{new Date(tx.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: tx.amount > 0 ? "var(--color-success)" : "var(--text-primary)" }}>
                  {tx.amount > 0 ? "+" : ""}€{Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Menu */}
      <div className="section-header-bar" style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>Today's Menu</div>
        <div style={{ display: "flex", background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {(["Kleve", "Kamp-Lintfort"] as const).map(c => (
            <button key={c} onClick={() => setCampus(c)} style={{
              padding: "5px 10px", fontSize: 11, fontWeight: 600, border: "none",
              background: campus === c ? "var(--hsrw-blue)" : "transparent",
              color: campus === c ? "white" : "var(--text-muted)", cursor: "pointer",
              transition: "all 0.15s", fontFamily: "inherit"
            }}>{c === "Kamp-Lintfort" ? "Lintfort" : "Kleve"}</button>
          ))}
        </div>
      </div>
      <div className="surface" style={{ margin: "0 16px" }}>
        {menu.map(m => (
          <div key={m.id} className="list-item" style={{ gap: 10 }}>
            <div style={{ flex: 1 }}>
              <span className={`badge ${catBadge[m.category] || "badge-grey"}`} style={{ marginBottom: 4 }}>{m.category}</span>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: "var(--text-primary)" }}>{m.name}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--hsrw-blue)" }}>€{m.priceStudent.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Student</div>
            </div>
          </div>
        ))}
      </div>

      {/* Top-up sheet */}
      {topUpOpen && (
        <div className="overlay" onClick={() => setTopUpOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Top Up Smart Balance</p>
            {processing ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <svg className="spin" width="32" height="32" fill="none" stroke="var(--hsrw-blue)" strokeWidth="2.5" viewBox="0 0 24 24" style={{ display: "block", margin: "0 auto 12px" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Processing payment…</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-muted)", marginBottom: 10 }}>Amount</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
                  {[10, 20, 50].map(a => (
                    <button key={a} id={`btn-amount-${a}`} onClick={() => setAmount(a)} style={{
                      padding: 12, border: `2px solid ${amount === a ? "var(--hsrw-blue)" : "var(--border)"}`,
                      borderRadius: 10, background: amount === a ? "#EEF2FB" : "transparent",
                      color: amount === a ? "var(--hsrw-blue)" : "var(--text-primary)",
                      fontWeight: 700, fontSize: 17, cursor: "pointer", fontFamily: "inherit"
                    }}>€{a}</button>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-muted)", marginBottom: 10 }}>Payment Method</div>
                {([["paypal","PayPal"],["card","Credit / Debit Card"],["giropay","giropay / SEPA"]] as const).map(([v, label]) => (
                  <div key={v} onClick={() => setMethod(v)} style={{
                    border: `1.5px solid ${method === v ? "var(--hsrw-blue)" : "var(--border)"}`,
                    borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", background: method === v ? "#EEF2FB" : "transparent"
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{label}</span>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${method === v ? "var(--hsrw-blue)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {method === v && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--hsrw-blue)" }} />}
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={doTopUp}>Pay €{amount}.00</button>
              </>
            )}
          </div>
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: WALLET
───────────────────────────────────────────────────────────── */
function WalletTab({ profile, onAddLog, isMobile }: {
  profile: StudentProfile;
  onAddLog: (t: LogType, m: string) => void;
  isMobile: boolean;
}) {
  const platform = getWalletPlatform();
  const [nfcState,     setNfcState]     = useState<"idle" | "scanning" | "ok" | "err">("idle");
  const [nfcTarget,    setNfcTarget]    = useState<"transit" | "mensa" | "library">("transit");
  const [walletAdded,  setWalletAdded]  = useState(false);
  const [qrOpen,       setQrOpen]       = useState(false);
  const [clock,        setClock]        = useState({ h:"00", m:"00", s:"00", ms:"000" });

  useEffect(() => {
    if (!qrOpen) return;
    const id = setInterval(() => {
      const n = new Date();
      setClock({
        h: String(n.getHours()).padStart(2,"0"),
        m: String(n.getMinutes()).padStart(2,"0"),
        s: String(n.getSeconds()).padStart(2,"0"),
        ms: String(n.getMilliseconds()).padStart(3,"0"),
      });
    }, 50);
    return () => clearInterval(id);
  }, [qrOpen]);

  const startNfc = () => {
    if (profile.isBlocked) { alert("Card is blocked!"); return; }
    setNfcState("scanning");
    onAddLog("INFO", `NFC broadcast → ${nfcTarget} terminal`);
    setTimeout(() => {
      setNfcState("ok");
      onAddLog("SECURITY", `NFC verified at ${nfcTarget} terminal`);
    }, 2200);
    setTimeout(() => setNfcState("idle"), 4500);
  };

  return (
    <div>
      {/* NFC Section — only on mobile (NFC requires a phone) */}
      {isMobile ? (
        <>
          <div className="section-label">Contactless / NFC</div>
          <div className="surface" style={{ margin: "0 16px", padding: 20 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
              Tap your phone on any HSRW terminal. Works for Mensa checkout, Library gate, and bus validation.
            </p>

        {/* NFC Target selector — mobile only, NFC physically requires a phone */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {(["transit","mensa","library"] as const).map(t => (
            <button key={t} id={`btn-nfc-${t}`} onClick={() => setNfcTarget(t)} style={{
              flex: 1, padding: "9px 4px", borderRadius: 8, fontFamily: "inherit",
              border: `2px solid ${nfcTarget === t ? "var(--hsrw-blue)" : "#C0C5D0"}`,
              background: nfcTarget === t ? "var(--hsrw-blue)" : "#EBEDF3",
              color: nfcTarget === t ? "#FFFFFF" : "#3A3D48",
              fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
              transition: "all 0.15s", letterSpacing: 0.2
            }}>{t}</button>
          ))}
        </div>

        {/* NFC animation */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="nfc-stage">
            {nfcState === "scanning" && (
              <>
                <div className="nfc-pulse" />
                <div className="nfc-pulse" />
                <div className="nfc-pulse" />
              </>
            )}
            <div className="nfc-core" style={{
              background: nfcState === "ok" ? "var(--hsrw-green)" : nfcState === "err" ? "var(--hsrw-red)" : "var(--hsrw-blue)"
            }}>
              {nfcState === "ok"
                ? <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                : <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              }
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>
              {nfcState === "idle"     && "Ready to Tap"}
              {nfcState === "scanning" && "Transmitting…"}
              {nfcState === "ok"       && "Access Granted!"}
              {nfcState === "err"      && "Scan Failed"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {nfcState === "idle"     && `→ ${nfcTarget} terminal`}
              {nfcState === "scanning" && "Hold steady near reader"}
              {nfcState === "ok"       && `${nfcTarget} validated ✓`}
            </p>
          </div>

          <button
            id="btn-nfc-scan"
            className="btn btn-primary"
            style={{ width: "auto", padding: "12px 28px", borderRadius: 24 }}
            onClick={startNfc}
            disabled={profile.isBlocked || nfcState === "scanning"}
          >
            {nfcState === "scanning" ? "Scanning…" : "Simulate NFC Tap"}
          </button>
          </div>
        </div>
        </> /* end isMobile NFC section */
      ) : (
        /* Desktop: NFC not applicable — show informational callout instead */
        <>
          <div className="section-label">Contactless / NFC</div>
          <div className="surface-flat" style={{ margin: "0 16px", padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EEF2FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" fill="none" stroke="var(--hsrw-blue)" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 6 }}>Available on your phone</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                NFC tap is a <strong style={{ color: "var(--text-secondary)" }}>mobile-only</strong> feature. Open this portal on your smartphone to use contactless access at Mensa, Library, and NIAG transit terminals.
              </div>
            </div>
          </div>
        </>
      )}

      {/* Transport ticket */}
      <div className="section-label" style={{ marginTop: 20 }}>Transit Ticket</div>
      <div className="surface" style={{ margin: "0 16px" }}>
        <button
          id="btn-qr-transit"
          className="list-item tappable"
          style={{ width: "100%", background: "transparent", border: "none", opacity: profile.isBlocked ? 0.5 : 1 }}
          onClick={() => { if (!profile.isBlocked) setQrOpen(true); }}
          disabled={profile.isBlocked}
        >
          <div className="list-icon icon-green">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/>
              <path d="M15 15h.008v.008H15V15zm0 2.25h.008v.008H15v-.008zm-2.25-.008h.008v.008H12.75v-.008zm0 2.25h.008v.008H12.75V19.5zm-2.25-2.25h.008v.008H10.5v-.008zm0 2.25h.008v.008H10.5V19.5zm6 0h.008v.008H16.5V19.5zm0-2.25h.008v.008H16.5v-.008zm-2.25 0h.008v.008H14.25v-.008zm0 2.25h.008v.008H14.25V19.5z"/>
            </svg>
          </div>
          <div className="list-text">
            <div className="list-title">Deutschlandsemesterticket</div>
            <div className="list-sub">VRR / NIAG · Valid across all Germany</div>
          </div>
          <span className="badge badge-green">Active</span>
        </button>
      </div>

      {/* Device-detected Wallet section */}
      <div className="section-label" style={{ marginTop: 20 }}>
        {platform === "apple" ? "Apple Pay / Apple Wallet" : "Google Wallet"}
      </div>
      <div className="surface" style={{ margin: "0 16px", padding: 20 }}>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
          {platform === "apple"
            ? "Add your HSRW UniCard to Apple Wallet for tap-to-pay and express access on iPhone, Apple Watch, and Mac."
            : "Add your HSRW UniCard to Google Wallet for contactless access on Android phones and smartwatches."}
        </p>

        {/* Device detection pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 12px", background: "var(--bg-app)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <svg width="14" height="14" fill="none" stroke="var(--hsrw-blue)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Detected: <strong style={{ color: "var(--text-primary)" }}>{platform === "apple" ? "Apple device" : "Android / Windows device"}</strong>
          </span>
        </div>

        {walletAdded ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 14, background: "#EEF7DC", borderRadius: 10, border: "1px solid #C9E68A" }}>
            <svg width="18" height="18" fill="none" stroke="var(--hsrw-green-dark)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <span style={{ color: "var(--hsrw-green-dark)", fontWeight: 600, fontSize: 14 }}>
              Added to {platform === "apple" ? "Apple Wallet" : "Google Wallet"}
            </span>
          </div>
        ) : (
          <button
            id="btn-add-wallet"
            className="btn"
            onClick={() => { setWalletAdded(true); onAddLog("SECURITY", `UniCard added to ${platform === "apple" ? "Apple" : "Google"} Wallet.`); }}
            disabled={profile.isBlocked}
            style={{
              background: platform === "apple" ? "#FFFFFF" : "#1A73E8",
              color: platform === "apple" ? "#000000" : "white", 
              border: platform === "apple" ? "1px solid #000000" : "none",
              gap: 10, opacity: profile.isBlocked ? 0.4 : 1,
              cursor: profile.isBlocked ? "not-allowed" : "pointer"
            }}
          >
            {platform === "apple" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <img src="/icon0.svg" alt="Apple Wallet" style={{ height: 20, width: "auto" }} />
                <span style={{ fontWeight: 600 }}>Add to Apple Wallet</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 2 }}>
                  {["#EA4335","#FBBC05","#34A853","#4285F4"].map((c, i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                Add to Google Wallet
              </>
            )}
          </button>
        )}
      </div>

      {/* QR Transit sheet */}
      {qrOpen && (
        <div className="overlay" onClick={() => setQrOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title" style={{ textAlign: "center" }}>Deutschlandsemesterticket</p>
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
              VRR SemesterTicket · Hochschule Rhein-Waal
            </p>

            <div className="qr-ticket-bg">
              <div className="qr-sweep" />
              <svg viewBox="0 0 100 100" fill="#1A171B" style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto" }}>
                {/* Corner markers */}
                <rect x="0" y="0" width="30" height="30"/>
                <rect x="5" y="5" width="20" height="20" fill="white"/>
                <rect x="10" y="10" width="10" height="10"/>
                <rect x="70" y="0" width="30" height="30"/>
                <rect x="75" y="5" width="20" height="20" fill="white"/>
                <rect x="80" y="10" width="10" height="10"/>
                <rect x="0" y="70" width="30" height="30"/>
                <rect x="5" y="75" width="20" height="20" fill="white"/>
                <rect x="10" y="80" width="10" height="10"/>
                {/* Data modules */}
                <rect x="35" y="5" width="5" height="15"/>
                <rect x="45" y="0" width="15" height="5"/>
                <rect x="50" y="10" width="10" height="15"/>
                <rect x="40" y="25" width="20" height="5"/>
                <rect x="0" y="35" width="15" height="10"/>
                <rect x="20" y="40" width="15" height="15"/>
                <rect x="45" y="35" width="20" height="15"/>
                <rect x="75" y="35" width="5" height="25"/>
                <rect x="85" y="40" width="15" height="5"/>
                <rect x="35" y="60" width="15" height="10"/>
                <rect x="55" y="55" width="15" height="15"/>
                <rect x="75" y="65" width="15" height="15"/>
                <rect x="35" y="80" width="10" height="20"/>
                <rect x="50" y="85" width="25" height="5"/>
                <rect x="55" y="90" width="5" height="10"/>
                <rect x="85" y="85" width="15" height="15"/>
              </svg>

              {/* HSRW green accent line at bottom of QR area */}
              <div style={{ height: 3, background: "linear-gradient(90deg, var(--hsrw-green), var(--hsrw-teal))", borderRadius: 2, marginTop: 12 }} />
            </div>

            {/* Live millisecond clock */}
            <div style={{
              background: "var(--hsrw-navy)", borderRadius: 12, padding: "10px 16px",
              marginTop: 14, display: "flex", justifyContent: "center", alignItems: "baseline",
              gap: 4, fontFamily: "ui-monospace,'SF Mono',monospace"
            }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: 2 }}>
                {clock.h}:{clock.m}:{clock.s}
              </span>
              <span style={{ fontSize: 13, color: "var(--hsrw-green)", fontWeight: 700 }}>.{clock.ms}</span>
            </div>

            <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {profile.name} · {profile.studentId}<br />
              2. Klasse · Ganz Deutschland · Gültig bis {profile.validUntil}
            </div>

            <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => setQrOpen(false)}>Close</button>
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────────────────────── */
type Tab = "card" | "library" | "mensa" | "wallet";

const TABS: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: "card", label: "Personal",
    icon: (a) => <svg fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  },
  {
    id: "library", label: "Library",
    icon: (a) => <svg fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
    </svg>
  },
  {
    id: "mensa", label: "Mensa",
    icon: (a) => <svg fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  },
  {
    id: "wallet", label: "Wallet",
    icon: (a) => <svg fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  }
];

export default function Home() {
  const [auth,         setAuth]         = useLocalStorageState<boolean>("hsrw_auth", false);
  const [profile,      setProfile]      = useLocalStorageState<StudentProfile>("hsrw_profile", INITIAL_PROFILE);
  const [balance,      setBalance]      = useLocalStorageState<number>("hsrw_balance", 12.50);
  const [books,        setBooks]        = useLocalStorageState<LibraryBook[]>("hsrw_books", INITIAL_BOOKS);
  const [transactions, setTransactions] = useLocalStorageState<Transaction[]>("hsrw_transactions", INITIAL_TRANSACTIONS);
  const [tab,          setTab]          = useState<Tab>("card");
  const [logs,         setLogs]         = useState<AuditLog[]>([]);
  // Must be called unconditionally, before any early returns (Rules of Hooks)
  const isMobile = useIsMobile();

  const log = useCallback((type: LogType, message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date().toISOString(), type, message }]);
  }, []);

  const handleLogin = (email: string, name?: string) => {
    setAuth(true);
    setProfile(p => ({ ...p, email, name: name || p.name }));
    log("SECURITY", `Session started for ${email}`);
  };

  const handleBlock = () => {
    setProfile(p => {
      const next = { ...p, isBlocked: !p.isBlocked };
      log("SECURITY", `Card ${next.isBlocked ? "BLOCKED" : "UNBLOCKED"}`);
      return next;
    });
  };

  const handleReportLost = () => {
    setProfile(p => ({ ...p, isBlocked: true, isLost: true, issueNumber: p.issueNumber + 1 }));
    log("SECURITY", "Card reported lost. Re-issued. Status: BLOCKED.");
  };

  if (!auth) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  const tabTitle: Record<Tab, string> = {
    card: "Personal", library: "Library", mensa: "Mensa", wallet: "Wallet"
  };

  return (
    <div className="app-shell">
      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR / TOP-BAR (CSS transforms this into a sidebar on ≥768px)
      ───────────────────────────────────────────────────────────── */}
      <header className="top-bar">
        {/* Logo block */}
        <div className="top-bar-logo">
          {/* variant="dark" → white logo visible on navy background */}
          <HSRWMark size={isMobile ? 30 : 38} variant="dark" />
          <div className="top-bar-wordmark">
            <span style={{ fontSize: isMobile ? 12 : 14 }}>HSRW UniCard</span>
            <span style={{ fontSize: isMobile ? 9 : 10 }}>
              {isMobile ? tabTitle[tab] : "Rhine-Waal University"}
            </span>
          </div>
        </div>

        {/* ── Desktop sidebar nav (hidden on mobile via CSS .desktop-nav) ── */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`sidenav-${t.id}`}
              className={`desktop-nav-item${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon(tab === t.id)}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Desktop: user + sign-out at bottom of sidebar ── */}
        <div className="sidebar-user">
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.email}
          </div>
          {profile.isBlocked && (
            <span className="badge badge-red" style={{ fontSize: 10, marginBottom: 10, display: "inline-flex" }}>Card Blocked</span>
          )}
          <button
            id="btn-signout-sidebar"
            onClick={() => { setAuth(false); log("SECURITY", "User signed out."); }}
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600,
              color: "rgba(255,255,255,0.8)", cursor: "pointer", width: "100%",
              fontFamily: "inherit", textAlign: "left"
            }}
          >
            ← Sign Out
          </button>
        </div>

        {/* ── Mobile: sign-out button inline in top bar ── */}
        <div className="md:hidden" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {profile.isBlocked && (
            <span className="badge badge-red" style={{ fontSize: 10 }}>Blocked</span>
          )}
          <button
            id="btn-signout"
            onClick={() => { setAuth(false); log("SECURITY", "User signed out."); }}
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
              color: "rgba(255,255,255,0.85)", cursor: "pointer"
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="app-content">
        {tab === "card"    && <PersonalTab profile={profile} onBlock={handleBlock} onReportLost={handleReportLost} />}
        {tab === "library" && <LibraryTab  profile={profile} books={books} onUpdateBooks={setBooks} />}
        {tab === "mensa"   && <MensaTab    profile={profile} balance={balance} transactions={transactions} onUpdateBalance={setBalance} onAddTransaction={tx => setTransactions(p => [tx, ...p])} />}
        {tab === "wallet"  && <WalletTab   profile={profile} onAddLog={log} isMobile={isMobile} />}
      </main>

      {/* ── Mobile Bottom Nav (hidden on desktop via CSS) ── */}
      <nav className="bottom-nav md:hidden" aria-label="Tab navigation">
        {TABS.map(t => (
          <button
            key={t.id}
            id={`nav-${t.id}`}
            className={`nav-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <div className="nav-tab-indicator" />
            {t.icon(tab === t.id)}
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
