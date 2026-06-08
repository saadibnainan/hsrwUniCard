"use client";

import React, { useState } from "react";
import { StudentProfile, LibraryBook } from "@/utils/mockData";

interface LibraryWidgetProps {
  profile: StudentProfile;
  books: LibraryBook[];
  onUpdateBooks: (books: LibraryBook[]) => void;
  onAddLog: (type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR", message: string) => void;
}

export default function LibraryWidget({
  profile,
  books,
  onUpdateBooks,
  onAddLog
}: LibraryWidgetProps) {
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [successBookId, setSuccessBookId] = useState<string | null>(null);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRenew = (bookId: string) => {
    if (profile.isBlocked) {
      alert("Account is blocked. Extensions are suspended.");
      return;
    }

    const updated = books.map((book) => {
      if (book.id === bookId) {
        if (book.renewCount >= 3) {
          alert("Maximum renewal limit of 3 reached for this title!");
          return book;
        }

        const currentDueDate = new Date(book.dueDate);
        currentDueDate.setDate(currentDueDate.getDate() + 14); // extend 14 days
        
        const newDueDateStr = currentDueDate.toISOString().split("T")[0];
        onAddLog("INFO", `Extended library loan for "${book.title}" to ${newDueDateStr}. Renewal count: ${book.renewCount + 1}/3.`);
        playChime();
        
        // Trigger quick visual checkmark
        setSuccessBookId(bookId);
        setTimeout(() => setSuccessBookId(null), 1500);

        return {
          ...book,
          dueDate: newDueDateStr,
          renewCount: book.renewCount + 1
        };
      }
      return book;
    });

    onUpdateBooks(updated);
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-5">
      {/* Library Account Header */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          HSRW Library Account
        </h3>
        <button
          onClick={() => {
            if (profile.isBlocked) {
              alert("Card blocked!");
              return;
            }
            setBarcodeOpen(true);
            onAddLog("INFO", "Library barcode reader displayed for self-checkout scans.");
          }}
          className="text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500 hover:bg-slate-800 text-cyan-400 px-3 py-1.5 rounded-lg font-mono cursor-pointer transition"
        >
          View Barcode
        </button>
      </div>

      {/* active loans count */}
      <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-900 p-3.5 rounded-2xl">
        <div className="text-cyan-400 font-bold font-mono text-2xl bg-cyan-950/40 border border-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
          {books.length}
        </div>
        <div>
          <span className="text-xs font-bold text-slate-300 block">Active Book Rentals</span>
          <span className="text-[10px] text-slate-500">Rentals can be extended up to 3 times before returning.</span>
        </div>
      </div>

      {/* Books list */}
      <div className="space-y-3">
        {books.map((book) => (
          <div key={book.id} className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl flex justify-between items-center gap-4">
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-slate-500 block">ISBN: {book.id}</span>
              <p className="text-xs font-bold text-slate-200 mt-1 truncate">{book.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{book.author}</p>
              
              <div className="flex gap-2 items-center mt-2.5">
                <span className="text-[10px] text-slate-500 font-mono">
                  Due: <strong className="text-slate-300">{new Date(book.dueDate).toLocaleDateString("de-DE")}</strong>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                  Renewals: {book.renewCount}/3
                </span>
              </div>
            </div>

            {/* Renew Button */}
            <div className="shrink-0">
              {successBookId === book.id ? (
                <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center animate-bounce">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={() => handleRenew(book.id)}
                  disabled={book.renewCount >= 3 || profile.isBlocked}
                  className="py-2 px-3 bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 rounded-xl text-xs font-semibold cursor-pointer transition disabled:opacity-30 disabled:hover:border-slate-800 disabled:hover:text-slate-300"
                >
                  {book.renewCount >= 3 ? "Limit Reached" : "Renew"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Barcode Modal Overlay */}
      {barcodeOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 font-mono text-sm">Library Scannable Barcode</h4>
              <button
                onClick={() => setBarcodeOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center my-4 leading-relaxed">
              Place the barcode flat underneath the library kiosk's laser scanner to checkout items or login.
            </p>

            {/* Custom CSS Barcode rendering */}
            <div className="w-full bg-white rounded-2xl py-8 px-6 flex flex-col items-center justify-center shadow-lg border border-slate-800">
              <div className="h-20 w-full flex items-stretch">
                {/* We create a barcode look with varying widths of flex divs */}
                <div className="bg-black w-2.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-1.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-3 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1.5 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-2 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-1.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-2 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-2.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-1 shrink-0"></div>
                <div className="bg-black w-3 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-1.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-2.5 shrink-0"></div>
                <div className="bg-black w-0.5 mr-0.5 shrink-0"></div>
                <div className="bg-white w-0.5 shrink-0"></div>
                <div className="bg-black w-2.5 mr-0.5 shrink-0"></div>
              </div>
              <span className="text-slate-900 font-mono tracking-[0.4em] font-semibold text-xs mt-3 select-all">
                {profile.cardSerial.replace("HSRW-", "")}
              </span>
            </div>

            <div className="mt-4 font-mono text-[10px] text-slate-500">
              Serial Ref: {profile.cardSerial}
            </div>

            <button
              onClick={() => setBarcodeOpen(false)}
              className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Close Barcode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
