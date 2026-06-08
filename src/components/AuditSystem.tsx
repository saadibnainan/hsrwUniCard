"use client";

import React, { useState, useEffect, useRef } from "react";
import { AuditLog } from "@/utils/mockData";

interface AuditSystemProps {
  logs: AuditLog[];
  onClear: () => void;
  onAddLog: (type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR", message: string) => void;
}

export default function AuditSystem({ logs, onClear, onAddLog }: AuditSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  const handleSimulateInspection = () => {
    onAddLog("SECURITY", "Transit ticket scanned by NIAG bus terminal inspector. Signature verified.");
  };

  const handleSimulateLibrary = () => {
    onAddLog("INFO", "Scan request from Kleve Library scanner gate. Handshake valid. Gate opened.");
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 text-slate-100 px-4 py-3 rounded-full shadow-2xl transition duration-300 font-mono text-sm cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        Audit System Console ({logs.length})
      </button>

      {/* Audit Console Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-[480px] z-50 glass-panel p-4 flex flex-col h-[380px] border border-cyan-500/30 shadow-cyan-950/20 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400">HSRW_UNICARD_AUDIT_LOG_V1.0</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClear}
                className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700/50 font-mono cursor-pointer"
              >
                Clear Logs
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Simulated scenarios quick triggers */}
          <div className="py-2 border-b border-slate-800/80 flex flex-wrap gap-2">
            <span className="text-slate-500 text-[10px] uppercase font-bold self-center font-mono">Test Scenarios:</span>
            <button
              onClick={handleSimulateInspection}
              className="text-[10px] font-mono px-2 py-1 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/40 border border-cyan-500/20 rounded cursor-pointer transition"
            >
              Simulate Transit Inspector
            </button>
            <button
              onClick={handleSimulateLibrary}
              className="text-[10px] font-mono px-2 py-1 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-500/20 rounded cursor-pointer transition"
            >
              Simulate Library Gate
            </button>
          </div>

          {/* Logs Output */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden py-3 font-mono text-xs space-y-2.5">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic text-center pt-8">No events audited in this session.</div>
            ) : (
              logs.map((log, index) => {
                let badgeColor = "text-blue-400 bg-blue-950/40 border-blue-500/20";
                if (log.type === "SECURITY") badgeColor = "text-purple-400 bg-purple-950/40 border-purple-500/20";
                if (log.type === "TRANSACTION") badgeColor = "text-emerald-400 bg-emerald-950/40 border-emerald-500/20";
                if (log.type === "ERROR") badgeColor = "text-rose-400 bg-rose-950/40 border-rose-500/20";

                return (
                  <div key={index} className="flex gap-2 items-start text-slate-300 leading-relaxed">
                    <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold shrink-0 ${badgeColor}`}>
                      {log.type}
                    </span>
                    <span className="break-all">{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Security Status: SECURE</span>
            <span>Local Storage Active</span>
          </div>
        </div>
      )}
    </>
  );
}
