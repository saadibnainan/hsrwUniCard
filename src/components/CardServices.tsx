"use client";

import React, { useState } from "react";
import { StudentProfile } from "@/utils/mockData";

interface CardServicesProps {
  profile: StudentProfile;
  balance: number;
  onUpdateProfile: (profile: StudentProfile) => void;
  onUpdateBalance: (balance: number) => void;
  onAddLog: (type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR", message: string) => void;
}

export default function CardServices({
  profile,
  balance,
  onUpdateProfile,
  onUpdateBalance,
  onAddLog
}: CardServicesProps) {
  const [activeDialog, setActiveDialog] = useState<"block" | "lost" | "replacement" | "physical" | null>(null);
  const [address, setAddress] = useState("");
  const [lostReason, setLostReason] = useState("misplaced");
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleBlock = () => {
    const newState = !profile.isBlocked;
    onUpdateProfile({
      ...profile,
      isBlocked: newState
    });
    onAddLog(
      "SECURITY",
      `Card status manually ${newState ? "SUSPENDED (Blocked)" : "REINSTATED (Unblocked)"} by owner.`
    );
    setActiveDialog(null);
  };

  const handleReportLost = () => {
    setIsProcessing(true);
    onAddLog("SECURITY", `Reporting card as lost/stolen. Reason: ${lostReason.toUpperCase()}.`);

    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        isBlocked: true,
        isLost: true,
        issueNumber: profile.issueNumber + 1,
        chipUid: generateNewChipUid()
      });
      setIsProcessing(false);
      setActiveDialog(null);
      onAddLog("SECURITY", `Card reported lost. Previous credentials invalidated. New digital card generated (Issue #${profile.issueNumber + 1}). Card is set to BLOCKED until verified.`);
    }, 1200);
  };

  const handleOrderReplacement = () => {
    const replacementCost = 15.00;
    if (balance < replacementCost) {
      alert(`Insufficient card balance! Replacement card costs €${replacementCost.toFixed(2)}. Please top up your balance first.`);
      return;
    }

    setIsProcessing(true);
    onAddLog("TRANSACTION", `Charging replacement card fee of €${replacementCost.toFixed(2)}.`);

    setTimeout(() => {
      onUpdateBalance(balance - replacementCost);
      onUpdateProfile({
        ...profile,
        isBlocked: false,
        isLost: false,
        issueNumber: profile.issueNumber + 1,
        chipUid: generateNewChipUid()
      });
      setIsProcessing(false);
      setActiveDialog(null);
      onAddLog("SECURITY", `New replacement card issued (Issue #${profile.issueNumber + 1}). RFID keys rotated. Block status cleared.`);
    }, 1500);
  };

  const handleOrderPhysical = () => {
    if (!address) {
      alert("Please enter a valid shipping address.");
      return;
    }

    setIsProcessing(true);
    onAddLog("INFO", `Submitting request for physical card printing & postage.`);

    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        physicalCardStatus: "Ordered"
      });
      setIsProcessing(false);
      setActiveDialog(null);
      onAddLog("INFO", `Physical UniCard ordered. Shipment address: ${address}. Standard delivery (3-5 business days).`);
    }, 1500);
  };

  // Helper to simulate rotated Mifare Desfire chip UIDs
  const generateNewChipUid = () => {
    const hex = "0123456789ABCDEF";
    let uid = "";
    for (let i = 0; i < 7; i++) {
      uid += hex.charAt(Math.floor(Math.random() * 16));
      uid += hex.charAt(Math.floor(Math.random() * 16));
      if (i < 6) uid += ":";
    }
    return uid;
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-lg border-b border-slate-800/80 pb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
        UniCard Administration Settings
      </h3>

      <div className="grid grid-cols-2 gap-3 mt-2">
        {/* Block card */}
        <button
          onClick={() => setActiveDialog("block")}
          className={`py-3 px-4 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider border cursor-pointer transition ${
            profile.isBlocked
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30"
              : "bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-900/30"
          }`}
        >
          {profile.isBlocked ? "Unblock Card" : "Block Card"}
        </button>

        {/* Report Lost */}
        <button
          onClick={() => setActiveDialog("lost")}
          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer transition"
        >
          Report Lost
        </button>

        {/* Order replacement */}
        <button
          onClick={() => setActiveDialog("replacement")}
          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer transition"
        >
          Replacement ID
        </button>

        {/* Order physical */}
        <button
          onClick={() => setActiveDialog("physical")}
          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer transition"
        >
          Order Physical
        </button>
      </div>

      {/* Dynamic Popups for Administrative Actions */}
      {activeDialog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 font-mono text-sm uppercase">
                {activeDialog === "block" && "Confirm Lock Toggle"}
                {activeDialog === "lost" && "Report ID Lost"}
                {activeDialog === "replacement" && "Order Replacement Card"}
                {activeDialog === "physical" && "Request Printed Card"}
              </h4>
              <button
                onClick={() => setActiveDialog(null)}
                className="text-slate-400 hover:text-slate-200 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {isProcessing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono text-slate-400">Updating administration database...</span>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {/* 1. Block Dialog */}
                {activeDialog === "block" && (
                  <>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {profile.isBlocked
                        ? "Are you sure you want to reactivate your digital student identity card? This will reinstate RFID chips and barcode validation status."
                        : "WARNING: Blocking your card will immediately suspend transport authentication (Deutschlandsemesterticket) and freeze Mensa/Library accounts. You can unblock it anytime from this app."}
                    </p>
                    <button
                      onClick={toggleBlock}
                      className={`w-full py-3.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                        profile.isBlocked ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-rose-600 hover:bg-rose-500 text-white"
                      }`}
                    >
                      {profile.isBlocked ? "Reactivate Card" : "Deactivate Card Now"}
                    </button>
                  </>
                )}

                {/* 2. Lost Dialog */}
                {activeDialog === "lost" && (
                  <>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Reporting your card lost will automatically freeze your current card credentials and generate a new issue. What occurred?
                    </p>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Reason</label>
                      <select
                        value={lostReason}
                        onChange={(e) => setLostReason(e.target.value)}
                        className="glass-input text-xs"
                      >
                        <option value="misplaced">Card Misplaced / Missing</option>
                        <option value="stolen">Card Stolen</option>
                        <option value="damaged">RFID / Physical Damage</option>
                      </select>
                    </div>
                    <button
                      onClick={handleReportLost}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                    >
                      Report Lost & Reissue Digital
                    </button>
                  </>
                )}

                {/* 3. Replacement Dialog */}
                {activeDialog === "replacement" && (
                  <>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ordering a replacement digital card rotates your cryptography keys and generates a new physical card batch request. 
                      An administrative charge of <strong className="text-slate-200">€15.00</strong> will be deducted from your smart balance.
                    </p>
                    <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl font-mono text-xs">
                      <span className="text-slate-400">Available Balance:</span>
                      <span className={`font-bold ${balance >= 15 ? "text-emerald-400" : "text-rose-400"}`}>€{balance.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleOrderReplacement}
                      disabled={balance < 15}
                      className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Pay €15.00 & Reissue
                    </button>
                  </>
                )}

                {/* 4. Physical Card Dialog */}
                {activeDialog === "physical" && (
                  <>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Request a physical student card with integrated NFC chip sent via post. Ensure your address details are correct.
                    </p>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Shipping Address</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Max Mustermann&#10;Marie-Curie-Str. 1&#10;47533 Kleve, Germany"
                        rows={3}
                        className="glass-input text-xs"
                      />
                    </div>
                    <button
                      onClick={handleOrderPhysical}
                      className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 rounded-xl text-sm font-semibold transition cursor-pointer"
                    >
                      Request Physical Print
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
