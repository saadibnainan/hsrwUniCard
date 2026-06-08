"use client";

import React, { useState, useEffect } from "react";
import { StudentProfile, Transaction, CANTEEN_MENUS } from "@/utils/mockData";

interface MensaWidgetProps {
  profile: StudentProfile;
  balance: number;
  transactions: Transaction[];
  onUpdateBalance: (newBalance: number) => void;
  onAddTransaction: (tx: Transaction) => void;
  onAddLog: (type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR", message: string) => void;
}

export default function MensaWidget({
  profile,
  balance,
  transactions,
  onUpdateBalance,
  onAddTransaction,
  onAddLog
}: MensaWidgetProps) {
  const [canteenCampus, setCanteenCampus] = useState<"Kleve" | "Kamp-Lintfort">(profile.campus);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(20);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card" | "giropay">("paypal");
  const [isProcessing, setIsProcessing] = useState(false);

  // Synchronize cafeteria campus when profile changes
  useEffect(() => {
    setCanteenCampus(profile.campus);
  }, [profile.campus]);

  const mensaTx = transactions
    .filter((tx) => tx.category === "Mensa")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTopUp = () => {
    if (profile.isBlocked) {
      alert("Cannot top up. Card is blocked!");
      return;
    }
    setIsProcessing(true);
    onAddLog("INFO", `Initiating ${paymentMethod.toUpperCase()} top-up handshake for €${topUpAmount}.00.`);

    setTimeout(() => {
      const newBal = balance + topUpAmount;
      onUpdateBalance(newBal);

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        description: `Mensa Card Top-up (${paymentMethod === "paypal" ? "PayPal" : paymentMethod === "card" ? "Credit Card" : "Giropay"})`,
        amount: topUpAmount,
        date: new Date().toISOString(),
        category: "Mensa"
      };

      onAddTransaction(newTx);
      setIsProcessing(false);
      setTopUpOpen(false);
      playChime();
      onAddLog("TRANSACTION", `Successfully added €${topUpAmount}.00 via ${paymentMethod.toUpperCase()}. New Balance: €${newBal.toFixed(2)}`);
    }, 1500);
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-6">
      {/* Canteen Balance Header */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Mensa / Library Smart Balance
        </h3>
        <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 py-1 px-3 rounded-full">
          Balance: <strong className="text-slate-100 text-sm">€{balance.toFixed(2)}</strong>
        </span>
      </div>

      {/* Balance Top up Trigger */}
      <div className="flex justify-between items-center gap-4 bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl">
        <div className="text-xs text-slate-400 leading-relaxed">
          Need canteen credits? Load money onto your student card instantly using online payment.
        </div>
        <button
          onClick={() => setTopUpOpen(true)}
          disabled={profile.isBlocked}
          className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-100 font-semibold rounded-xl text-xs shrink-0 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Top Up Card
        </button>
      </div>

      {/* Canteen Menu Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-200">Cafeteria Menu Plan</h4>
          {/* Canteen Location Toggle */}
          <div className="flex bg-slate-950 border border-slate-800/80 p-0.5 rounded-lg text-[10px] font-bold font-mono">
            <button
              onClick={() => setCanteenCampus("Kleve")}
              className={`px-2.5 py-1.5 rounded cursor-pointer ${canteenCampus === "Kleve" ? "bg-cyan-950 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              Kleve
            </button>
            <button
              onClick={() => setCanteenCampus("Kamp-Lintfort")}
              className={`px-2.5 py-1.5 rounded cursor-pointer ${canteenCampus === "Kamp-Lintfort" ? "bg-cyan-950 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              Lintfort
            </button>
          </div>
        </div>

        {/* Canteen Food List */}
        <div className="space-y-3">
          {CANTEEN_MENUS[canteenCampus].map((meal) => {
            let catColor = "bg-emerald-950/40 text-emerald-400 border-emerald-500/20";
            if (meal.category === "Vegan") catColor = "bg-green-950/40 text-green-400 border-green-500/20";
            if (meal.category === "Meat") catColor = "bg-amber-950/40 text-amber-400 border-amber-500/20";
            if (meal.category === "Dessert") catColor = "bg-purple-950/40 text-purple-400 border-purple-500/20";

            return (
              <div key={meal.id} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex gap-2 items-center">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold uppercase tracking-wider ${catColor}`}>
                      {meal.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1.5 leading-relaxed truncate-2-lines">
                    {meal.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-100 font-mono">€{meal.priceStudent.toFixed(2)}</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-0.5">Staff: €{meal.priceStaff.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Canteen Transactions */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Transactions</h4>
        <div className="space-y-2.5 font-mono text-xs">
          {mensaTx.length === 0 ? (
            <div className="text-slate-600 italic">No recent canteen receipts.</div>
          ) : (
            mensaTx.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center text-slate-300">
                <div className="min-w-0">
                  <p className="truncate text-slate-200">{tx.description}</p>
                  <span className="text-[10px] text-slate-500">
                    {new Date(tx.date).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {tx.amount > 0 ? "+" : ""}€{tx.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Up Modal Dialog */}
      {topUpOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="font-bold text-lg text-slate-100">Top Up Smart Balance</h4>
              <button
                onClick={() => setTopUpOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {isProcessing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-mono text-slate-400">Processing transaction...</span>
              </div>
            ) : (
              <>
                {/* Select Amount */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Amount</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-3 font-mono font-bold rounded-xl border cursor-pointer transition ${
                          topUpAmount === amt
                            ? "bg-cyan-950/40 border-cyan-500 text-cyan-400"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        €{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount input */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Or enter Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">€</span>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      className="glass-input pl-8 font-mono text-lg font-bold"
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div className="mt-5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Payment Method</label>
                  <div className="space-y-2">
                    {(["paypal", "card", "giropay"] as const).map((method) => (
                      <div
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 bg-slate-950 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                          paymentMethod === method ? "border-cyan-500 bg-cyan-950/15" : "border-slate-800"
                        }`}
                      >
                        <span className="text-sm font-semibold capitalize text-slate-200">
                          {method === "paypal" && "PayPal"}
                          {method === "card" && "Credit Card"}
                          {method === "giropay" && "giropay / SEPA"}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === method ? "border-cyan-500" : "border-slate-700"
                        }`}>
                          {paymentMethod === method && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm */}
                <button
                  onClick={handleTopUp}
                  disabled={topUpAmount <= 0}
                  className="w-full mt-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay €{topUpAmount.toFixed(2)}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
