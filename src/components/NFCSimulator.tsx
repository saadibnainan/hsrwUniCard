"use client";

import React, { useState } from "react";
import { StudentProfile, Transaction } from "@/utils/mockData";

interface NFCSimulatorProps {
  profile: StudentProfile;
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  onAddTransaction: (tx: Transaction) => void;
  onAddLog: (type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR", message: string) => void;
}

type NFCDestination = "mensa" | "library" | "transit";

export default function NFCSimulator({
  profile,
  balance,
  onUpdateBalance,
  onAddTransaction,
  onAddLog
}: NFCSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetTerminal, setTargetTerminal] = useState<NFCDestination>("mensa");
  const [nfcState, setNfcState] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Sound Synthesizer
  const playSound = (type: "success" | "error" | "ping") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      if (type === "success") {
        // High pitched pleasant beep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "ping") {
        // Short low tick
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(330, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "error") {
        // Low buzzy error sound
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn("Web Audio failed:", e);
    }
  };

  const startNfcTransmission = () => {
    if (profile.isBlocked) {
      playSound("error");
      onAddLog("ERROR", "NFC transmission aborted. RFID chip state is DISABLED (Card Blocked).");
      alert("This card is currently blocked! You must unblock it under Card Settings first.");
      return;
    }

    setIsOpen(true);
    setNfcState("connecting");
    onAddLog("INFO", `NFC card emulation broadcasting via RFID/Mifare Desfire (UID: ${profile.chipUid}).`);

    // Step 1: Simulate connection ping
    setTimeout(() => {
      playSound("ping");
    }, 600);

    // Step 2: Simulate terminal response after 1.8 seconds
    setTimeout(() => {
      processNfcTransaction();
    }, 1800);
  };

  const processNfcTransaction = () => {
    if (targetTerminal === "mensa") {
      const lunchCost = 3.10;
      if (balance < lunchCost) {
        playSound("error");
        setNfcState("error");
        setErrorMessage("Insufficient Canteen Funds");
        onAddLog("ERROR", `Mensa terminal purchase failed: Insufficient balance. Available: €${balance.toFixed(2)}, Required: €${lunchCost.toFixed(2)}`);
      } else {
        const newBal = balance - lunchCost;
        onUpdateBalance(newBal);

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          description: "Mensa Checkout (NFC)",
          amount: -lunchCost,
          date: new Date().toISOString(),
          category: "Mensa"
        };
        onAddTransaction(newTx);
        playSound("success");
        setNfcState("success");
        onAddLog("TRANSACTION", `NFC purchase success at Mensa. Deducted €${lunchCost.toFixed(2)}. Remaining balance: €${newBal.toFixed(2)}`);
      }
    } else if (targetTerminal === "library") {
      playSound("success");
      setNfcState("success");
      onAddLog("SECURITY", `Library electronic gate validated Chip ID ${profile.chipUid}. Gate unlocked.`);
    } else {
      playSound("success");
      setNfcState("success");
      onAddLog("SECURITY", `NIAG bus validator matched digital ticket signature. Verification success. Welcome aboard!`);
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-lg border-b border-slate-800/80 pb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
        </svg>
        NFC Contactless Services
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        Your UniCard is embedded with an active RFID microchip. Select a terminal target below, then click to emulate holding your phone near a contactless reader.
      </p>

      {/* Target Selector */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {(["mensa", "library", "transit"] as NFCDestination[]).map((dest) => (
          <button
            key={dest}
            onClick={() => setTargetTerminal(dest)}
            className={`py-2.5 px-2 font-mono text-[11px] font-bold rounded-xl border uppercase cursor-pointer transition ${
              targetTerminal === dest
                ? "bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-950/30"
                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            {dest === "mensa" && "Mensa Register"}
            {dest === "library" && "Library Gate"}
            {dest === "transit" && "NIAG Bus Card"}
          </button>
        ))}
      </div>

      {/* Trigger Button */}
      <button
        onClick={startNfcTransmission}
        disabled={profile.isBlocked}
        className="glass-button w-full mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        Simulate NFC Contactless Scan
      </button>

      {/* NFC Overlay HUD */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            
            {/* NFC Wave Animation */}
            <div className="nfc-pulse-container mb-6">
              {nfcState === "connecting" && (
                <>
                  <div className="nfc-pulse-wave"></div>
                  <div className="nfc-pulse-wave"></div>
                  <div className="nfc-pulse-wave"></div>
                </>
              )}

              {/* Status Icons */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                nfcState === "connecting" ? "bg-slate-900 border-cyan-500/40 text-cyan-400" :
                nfcState === "success" ? "bg-emerald-950 border-emerald-500 text-emerald-400" :
                "bg-rose-950 border-rose-500 text-rose-400"
              }`}>
                {nfcState === "connecting" && (
                  <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                {nfcState === "success" && (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {nfcState === "error" && (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>

            {/* Status texts */}
            <h4 className="font-bold text-xl text-center text-slate-100 uppercase tracking-wide">
              {nfcState === "connecting" && "Broadcasting NFC..."}
              {nfcState === "success" && "Success!"}
              {nfcState === "error" && "Transaction Failed"}
            </h4>

            <p className="text-sm text-slate-400 text-center mt-3 max-w-[280px] leading-relaxed">
              {nfcState === "connecting" && `Hold phone close to ${targetTerminal === "mensa" ? "Mensa cash register" : targetTerminal === "library" ? "Library barcode gate" : "NIAG bus validator"}.`}
              {nfcState === "success" && targetTerminal === "mensa" && "Payment of €3.10 has been processed successfully."}
              {nfcState === "success" && targetTerminal === "library" && "Access authorization granted. Gates opened."}
              {nfcState === "success" && targetTerminal === "transit" && "Ticket signature approved. Valid ride registered."}
              {nfcState === "error" && errorMessage}
            </p>

            <div className="w-full border-t border-slate-800/60 pt-4 mt-6 text-center">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                UID: {profile.chipUid}
              </span>
            </div>

            {/* Close action */}
            {nfcState !== "connecting" && (
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                Close Window
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
