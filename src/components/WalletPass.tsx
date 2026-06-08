"use client";

import React, { useState } from "react";
import { StudentProfile } from "@/utils/mockData";

interface WalletPassProps {
  profile: StudentProfile;
  onAddLog: (type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR", message: string) => void;
}

export default function WalletPass({ profile, onAddLog }: WalletPassProps) {
  const [activeWallet, setActiveWallet] = useState<"apple" | "google" | null>(null);
  const [isAppleAdded, setIsAppleAdded] = useState(false);
  const [isGoogleAdded, setIsGoogleAdded] = useState(false);

  // Play a beautiful synthetic chime when card is successfully added to wallet
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      // Tone 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Tone 2 (offset)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.82);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.82);

      // Tone 3
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(783.99, now + 0.24); // G5
      gain3.gain.setValueAtTime(0.2, now + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc3.connect(gain3);
      gain3.connect(audioCtx.destination);
      osc3.start(now + 0.24);
      osc3.stop(now + 1.2);
    } catch (e) {
      console.warn("AudioContext failed to load:", e);
    }
  };

  const handleAddPass = (wallet: "apple" | "google") => {
    setActiveWallet(wallet);
    onAddLog("INFO", `Requested credentials build for ${wallet === "apple" ? "Apple Wallet (.pkpass)" : "Google Wallet (JSON Web Token)"}.`);
  };

  const confirmAdd = () => {
    if (activeWallet === "apple") {
      setIsAppleAdded(true);
      onAddLog("SECURITY", "HSRW Digital UniCard cryptographic pass signed and loaded into Apple Wallet Secure Element.");
    } else {
      setIsGoogleAdded(true);
      onAddLog("SECURITY", "HSRW Digital UniCard loaded into Google Wallet API client database.");
    }
    playChime();
    setActiveWallet(null);
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-lg border-b border-slate-800/80 pb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1v-3a1 1 0 00-1-1h-6a1 1 0 00-1 1v3a1 1 0 01-1-1V4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
        </svg>
        Mobile Wallet Integrations
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        Integrate your digital student ticket and ID card with your mobile device's wallet. Enables automatic transit gates access and student verification.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {/* Apple Wallet Button */}
        {isAppleAdded ? (
          <div className="flex items-center justify-center gap-2 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-medium py-3 px-4 rounded-xl text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Added to Apple Wallet
          </div>
        ) : (
          <button
            onClick={() => handleAddPass("apple")}
            disabled={profile.isBlocked}
            className="flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 border border-zinc-800 text-white font-semibold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Apple Logo Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.36.13-9.13-1.88-14.33-6.03-3.13-2.62-7.04-7.33-11.75-14.15-9.16-13.29-16.14-29.62-20.92-49.02-3.13-12.51-4.7-24.18-4.7-35.01 0-16.53 4.02-29.83 12.07-39.87 8.04-10.05 18.2-15.19 30.46-15.42 5.03 0 10.45 1.45 16.27 4.35 5.81 2.91 9.61 4.35 11.39 4.35 1.56 0 5.48-1.56 11.75-4.69 6.28-3.13 11.69-4.59 17.25-4.36 12.4.45 22.36 4.97 29.9 13.57 5.47 6.26 9.4 13.53 11.78 21.82-12.51 5.14-20.89 12.57-25.13 22.3-4.24 9.72-6.36 20.09-6.36 31.11 0 13.63 3.97 25.07 11.9 34.33 7.93 9.27 17.65 14.75 29.17 16.42-.67 2.45-1.56 5.03-2.68 7.74zm-22.3-114.73c0 7.93-2.79 15.3-8.38 21.11-5.58 5.8-12.4 9.16-20.44 10.05.11-7.48 2.9-14.8 8.38-20.93 5.47-6.13 12.51-9.71 20.21-10.73.23.89.23 1.73.23 2.5z"/>
            </svg>
            Add to Apple Wallet
          </button>
        )}

        {/* Google Wallet Button */}
        {isGoogleAdded ? (
          <div className="flex items-center justify-center gap-2 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-medium py-3 px-4 rounded-xl text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Added to Google Wallet
          </div>
        ) : (
          <button
            onClick={() => handleAddPass("google")}
            disabled={profile.isBlocked}
            className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-sm transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Google Wallet Icon Sim */}
            <div className="flex gap-0.5">
              <span className="w-2 h-2.5 rounded-full bg-[#EA4335]"></span>
              <span className="w-2 h-2.5 rounded-full bg-[#4285F4]"></span>
              <span className="w-2 h-2.5 rounded-full bg-[#FBBC05]"></span>
              <span className="w-2 h-2.5 rounded-full bg-[#34A853]"></span>
            </div>
            Add to Google Wallet
          </button>
        )}
      </div>

      {/* Wallet Popup Confirmation Overlay */}
      {activeWallet && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            {/* Wallet Icon */}
            <div className={`p-4 rounded-full mb-4 ${activeWallet === "apple" ? "bg-black text-white" : "bg-blue-600/10 text-blue-400"}`}>
              {activeWallet === "apple" ? (
                <svg className="w-12 h-12 fill-current" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.36.13-9.13-1.88-14.33-6.03-3.13-2.62-7.04-7.33-11.75-14.15-9.16-13.29-16.14-29.62-20.92-49.02-3.13-12.51-4.7-24.18-4.7-35.01 0-16.53 4.02-29.83 12.07-39.87 8.04-10.05 18.2-15.19 30.46-15.42 5.03 0 10.45 1.45 16.27 4.35 5.81 2.91 9.61 4.35 11.39 4.35 1.56 0 5.48-1.56 11.75-4.69 6.28-3.13 11.69-4.59 17.25-4.36 12.4.45 22.36 4.97 29.9 13.57 5.47 6.26 9.4 13.53 11.78 21.82-12.51 5.14-20.89 12.57-25.13 22.3-4.24 9.72-6.36 20.09-6.36 31.11 0 13.63 3.97 25.07 11.9 34.33 7.93 9.27 17.65 14.75 29.17 16.42-.67 2.45-1.56 5.03-2.68 7.74zm-22.3-114.73c0 7.93-2.79 15.3-8.38 21.11-5.58 5.8-12.4 9.16-20.44 10.05.11-7.48 2.9-14.8 8.38-20.93 5.47-6.13 12.51-9.71 20.21-10.73.23.89.23 1.73.23 2.5z"/>
                </svg>
              ) : (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </div>

            <h4 className="font-bold text-lg text-center text-slate-100">
              Add to {activeWallet === "apple" ? "Apple Wallet" : "Google Wallet"}?
            </h4>
            <p className="text-sm text-slate-400 text-center mt-2 leading-relaxed">
              This will add a secure, cryptographically signed replica of your Hochschule Rhein-Waal Student Card for local contactless use.
            </p>

            {/* Micro Wallet Pass Mockup */}
            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 mt-6 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] text-cyan-400 font-mono">
                <span>HOCHSCHULE RHEIN-WAAL</span>
                <span>STUDENT ID</span>
              </div>
              <div className="text-sm font-bold text-slate-200">{profile.name}</div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-mono">
                <div>ID: {profile.studentId}</div>
                <div>EXP: {profile.validUntil}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full gap-3 mt-6">
              <button
                onClick={() => setActiveWallet(null)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAdd}
                className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-100 font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-600/20 cursor-pointer"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
