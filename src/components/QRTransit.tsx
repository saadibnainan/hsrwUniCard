"use client";

import React, { useState, useEffect } from "react";
import { StudentProfile } from "@/utils/mockData";

interface QRTransitProps {
  profile: StudentProfile;
  onAddLog: (type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR", message: string) => void;
}

export default function QRTransit({ profile, onAddLog }: QRTransitProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [msStr, setMsStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    let animFrameId: number;

    const updateClock = () => {
      const now = new Date();
      // Date formatting: DD.MM.YYYY
      const date = now.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      // Time formatting: HH:MM:SS
      const time = now.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      // Millisecond formatting: mmm
      const ms = String(now.getMilliseconds()).padStart(3, "0");

      setDateStr(date);
      setTimeStr(time);
      setMsStr(ms);

      animFrameId = requestAnimationFrame(updateClock);
    };

    if (isOpen) {
      animFrameId = requestAnimationFrame(updateClock);
      onAddLog("INFO", "Transit QR code expanded. Millennium clock synchronized. Screen lock overridden.");
    }

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isOpen, onAddLog]);

  const handleOpen = () => {
    if (profile.isBlocked) {
      onAddLog("ERROR", "Transit ticket access blocked. Digital transport credential is SUSPENDED.");
      alert("This card is currently blocked! You must unblock it under Card Settings first.");
      return;
    }
    setIsOpen(true);
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V5a1 1 0 00-1-1H3zm12 3h2v3h-2V7zM3 7h8v3H3V7z" />
          </svg>
          Deutschlandsemesterticket
        </h3>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          VRR / NIAG Active
        </span>
      </div>

      <div className="flex gap-4 items-center">
        {/* Clickable Ticket Mini Thumbnail */}
        <div
          onClick={handleOpen}
          className={`w-20 h-20 bg-slate-900 border hover:border-emerald-500 border-slate-800 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition relative group ${
            profile.isBlocked ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {/* Mock QR Thumbnail */}
          <svg className="w-12 h-12 text-slate-400 group-hover:text-emerald-400 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15h.008v.008H15V15zm0 2.25h.008v.008H15v-.008zm-2.25-.008h.008v.008H12.75v-.008zm0 2.25h.008v.008H12.75V19.5zm-2.25-2.25h.008v.008H10.5v-.008zm0 2.25h.008v.008H10.5V19.5zm6 0h.008v.008H16.5V19.5zm0-2.25h.008v.008H16.5v-.008zm-2.25 0h.008v.008H14.25v-.008zm0 2.25h.008v.008H14.25V19.5z" />
          </svg>
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition rounded-2xl flex items-center justify-center text-[10px] text-emerald-400 font-bold">
            Tap to Open
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-slate-200">Public Transport QR Code</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Scan on regional trains (RE, RB), subways (U-Bahn), trams, and NIAG buses. Valid across all of Germany.
          </p>
        </div>
      </div>

      {/* QR Code Inspection Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400">NIAG TRANSIT VDV-KA TICKET</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Ticket Info Area */}
            <div className="mt-4 flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Deutschlandsemesterticket</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">VRR SemesterTicket - HSRW</span>
            </div>

            {/* QR Card Frame with animations */}
            <div className="my-6 relative w-60 h-60 mx-auto rounded-3xl bg-white p-4 flex items-center justify-center shadow-lg border-4 border-slate-800 overflow-hidden">
              {/* Rotating Dashed Security Ring */}
              <div className="absolute inset-2 rotating-security-ring opacity-45 pointer-events-none"></div>

              {/* Sweeping Laser Scan Line */}
              <div className="sweeping-line pointer-events-none"></div>

              {/* SVG Mock QR Code */}
              <svg className="w-48 h-48 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                {/* Pos 1 */}
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" />

                {/* Pos 2 */}
                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" />

                {/* Pos 3 */}
                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" />

                {/* Random Matrix Modules */}
                <rect x="35" y="5" width="5" height="15" />
                <rect x="45" y="0" width="15" height="5" />
                <rect x="50" y="10" width="10" height="15" />
                <rect x="40" y="25" width="20" height="5" />

                <rect x="0" y="35" width="15" height="10" />
                <rect x="20" y="40" width="15" height="15" />
                <rect x="45" y="35" width="20" height="15" />
                <rect x="75" y="35" width="5" height="25" />
                <rect x="85" y="40" width="15" height="5" />

                <rect x="35" y="60" width="15" height="10" />
                <rect x="55" y="55" width="15" height="15" />
                <rect x="75" y="65" width="15" height="15" />
                <rect x="35" y="80" width="10" height="20" />
                <rect x="50" y="85" width="25" height="5" />
                <rect x="55" y="90" width="5" height="10" />
                <rect x="85" y="85" width="15" height="15" />
              </svg>
            </div>

            {/* Anti-fraud live millisecond clock */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-4 flex flex-col items-center gap-1 shadow-inner">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Current Validation Date / Time</span>
              <div className="flex gap-2 items-baseline font-mono">
                <span className="text-sm font-bold text-slate-300">{dateStr}</span>
                <span className="text-lg font-bold text-cyan-400">{timeStr}</span>
                <span className="text-xs font-semibold text-cyan-500/80 w-8">{msStr}ms</span>
              </div>
            </div>

            {/* Ticket Credentials table */}
            <div className="mt-4 space-y-2 text-xs border-t border-slate-800/60 pt-4 font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Fare Class:</span>
                <span className="text-slate-200">2nd Class (2. Klasse)</span>
              </div>
              <div className="flex justify-between">
                <span>Pass Holder:</span>
                <span className="text-slate-200">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date of Birth:</span>
                <span className="text-slate-200">{profile.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Matrikelnummer:</span>
                <span className="text-slate-200">{profile.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Valid Zone:</span>
                <span className="text-slate-200">Deutschlandweit (All Germany)</span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="text-slate-200">{profile.validUntil}</span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
