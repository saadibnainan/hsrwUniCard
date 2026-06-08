"use client";

import React, { useState, useRef } from "react";
import { StudentProfile } from "@/utils/mockData";

interface UniCardProps {
  profile: StudentProfile;
}

export default function UniCard({ profile }: UniCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tilt & holographic shine computation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Tilt calculations
    const tiltX = -(y - yc) / 10;
    const tiltY = (x - xc) / 10;
    
    // Shine position percentages
    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;

    // Apply styles to card inner
    const cardInner = card.querySelector(".card-wrapper") as HTMLElement;
    if (cardInner && !isFlipped) {
      cardInner.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      cardInner.style.setProperty("--mouse-x", `${mouseXPercent}%`);
      cardInner.style.setProperty("--mouse-y", `${mouseYPercent}%`);
      cardInner.style.setProperty("--glare-pos", `${mouseXPercent}% ${mouseYPercent}%`);
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    const cardInner = card.querySelector(".card-wrapper") as HTMLElement;
    if (cardInner && !isFlipped) {
      cardInner.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  };

  const handleCardClick = () => {
    // Reset tilt style before flipping to avoid visual glitches
    const card = cardRef.current;
    if (card) {
      const cardInner = card.querySelector(".card-wrapper") as HTMLElement;
      if (cardInner) {
        cardInner.style.transform = isFlipped ? "rotateX(0deg) rotateY(0deg)" : "rotateY(180deg)";
      }
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Help text */}
      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest animate-pulse">
        {isFlipped ? "Tap card to view front" : "Hover to shine • Tap to flip"}
      </span>

      {/* Card Perspective Box */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        className={`card-perspective ${isFlipped ? "flipped" : ""}`}
      >
        <div className="card-wrapper w-full h-full relative">
          
          {/* =========================================================
             FRONT SIDE
             ========================================================= */}
          <div className="card-face card-front relative text-white flex flex-col justify-between">
            {/* Holographic Overlays */}
            <div className="holo-shine"></div>
            <div className="rainbow-glare"></div>

            {/* Blocked overlay stamp */}
            {profile.isBlocked && (
              <div className="blocked-card-overlay">
                <span className="blocked-card-label">Blocked / Suspended</span>
              </div>
            )}

            {/* Header info */}
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-cyan-400 block">Hochschule Rhein-Waal</span>
                <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-mono">Rhine-Waal University of Applied Sciences</span>
              </div>
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                <div className="card-chip"></div>
              </div>
            </div>

            {/* Student core profile row */}
            <div className="flex gap-3 items-center z-10 my-1">
              {/* Profile Photo Placeholder */}
              <div className="w-16 h-20 rounded bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative">
                {/* SVG avatar */}
                <svg className="w-12 h-12 text-slate-600 absolute bottom-0 translate-y-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {/* Holographic watermark on photo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 opacity-60"></div>
              </div>

              {/* Student Metadata */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5 justify-center">
                <h2 className="text-sm font-bold text-slate-100 truncate">{profile.name}</h2>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Matrikelnr.</span>
                    <strong className="text-slate-300 font-semibold">{profile.studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Issue ID</span>
                    <strong className="text-slate-300 font-semibold">#{profile.issueNumber}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Study Program</span>
                    <strong className="text-slate-300 font-semibold block truncate leading-none mt-0.5">{profile.degreeProgram}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - validation and features */}
            <div className="flex justify-between items-end z-10 mt-auto border-t border-white/5 pt-2">
              <div className="font-mono text-[8px] text-slate-400">
                <span>VALID UNTIL</span>
                <strong className="block text-slate-200 text-[9px] font-bold">{profile.validUntil}</strong>
              </div>

              {/* Smart Card Service chip indicators */}
              <div className="flex gap-2">
                {/* NFC Indicator */}
                <div className={`p-1 rounded bg-slate-900/80 border ${profile.isBlocked ? "border-slate-800 text-slate-600" : "border-cyan-500/20 text-cyan-400"} flex items-center justify-center`} title="NFC Ready">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {/* Mensa balance active */}
                <div className={`p-1 rounded bg-slate-900/80 border ${profile.isBlocked ? "border-slate-800 text-slate-600" : "border-cyan-500/20 text-cyan-400"} flex items-center justify-center`} title="Mensa Balance Chip Active">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {/* Library account valid */}
                <div className={`p-1 rounded bg-slate-900/80 border ${profile.isBlocked ? "border-slate-800 text-slate-600" : "border-cyan-500/20 text-cyan-400"} flex items-center justify-center`} title="Library Pass Enabled">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                {/* Public Transport valid */}
                <div className={`p-1 rounded bg-slate-900/80 border ${profile.isBlocked ? "border-slate-800 text-slate-600" : "border-cyan-500/20 text-cyan-400"} flex items-center justify-center`} title="Deutschlandticket Valid">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
             BACK SIDE
             ========================================================= */}
          <div className="card-face card-back text-white flex flex-col justify-between">
            {/* Holographic overlay */}
            <div className="holo-shine"></div>

            {/* Back card info header */}
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 border-b border-white/5 pb-2">
              <span>RFID DUAL-INTERFACE STUDENT IDENTITY CARD</span>
              <span>HSRW KAMP-LINTFORT</span>
            </div>

            {/* Support hotline info */}
            <div className="text-[8px] text-slate-400 leading-normal my-2">
              <p>This card is personal and non-transferable. If found, please return to the HSRW Student Service Center immediately.</p>
              <p className="mt-1 font-semibold">Service Hotlines:</p>
              <p>Kleve: +49 (0) 2821 806 73-360 • Lintfort: +49 (0) 2842 908 25-0</p>
            </div>

            {/* Library barcode section */}
            <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center mt-auto shadow-inner">
              <div className="h-7 w-full flex items-stretch">
                <div className="bg-black w-1.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-1 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black.w-2 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black.w-1.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-1 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white.w-0.5 shrink-0"></div>
                <div className="bg-black w-2 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-2 mr-0.5 shrink-0"></div>
              </div>
              <span className="text-[7px] text-slate-800 font-mono tracking-[0.2em] mt-1 font-bold">
                {profile.cardSerial.replace("HSRW-", "")}
              </span>
            </div>

            {/* Rotated details */}
            <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 mt-2">
              <span>CHIP UID: {profile.chipUid}</span>
              <span>SERIAL: {profile.cardSerial}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
