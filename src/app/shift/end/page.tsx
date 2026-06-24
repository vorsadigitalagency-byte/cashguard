"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EndShiftPage() {
  const [profile, setProfile] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(profileData);
      if (profileData) {
        const { data: shiftData } = await supabase
          .from("shifts").select("*")
          .eq("cashier_id", profileData.id)
          .eq("status", "active").single();
        setShift(shiftData);
        if (shiftData) {
          const { data: txData } = await supabase
            .from("transactions").select("*")
            .eq("shift_id", shiftData.id);
          setTransactions(txData || []);
        }
      }
      setLoading(false);
    };
    getData();
  }, [router]);

  const totalIn = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOut = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expectedBalance = (shift?.opening_balance || 0) + totalIn - totalOut;
  const variance = closingBalance ? parseFloat(closingBalance) - expectedBalance : 0;

  const handleEndShift = async () => {
    if (!closingBalance) { alert("Closing balance daalo!"); return; }
    const { error } = await supabase
      .from("shifts")
      .update({
        closing_balance: parseFloat(closingBalance),
        expected_balance: expectedBalance,
        variance: variance,
        status: "closed",
        ended_at: new Date().toISOString(),
        notes: notes,
      })
      .eq("id", shift.id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Shift Khatam! Variance: PKR " + variance);
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-[#00D4AA] animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-xl font-bold">Koi Active Shift Nahi!</p>
          <button onClick={() => router.push("/dashboard")} className="mt-4 bg-[#00D4AA] text-[#0A0A0F] font-black uppercase px-6 py-3 rounded-xl">
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24">
      <div className="bg-gradient-to-r from-[#0A0A0F] via-[#1A1A2E] to-[#0A0A0F] p-4 flex items-center gap-3 border-b border-gray-800">
        <button onClick={() => router.push("/dashboard")} className="text-[#00D4AA] font-bold">BACK</button>
        <h1 className="text-xl font-black uppercase">End <span className="text-red-400">Shift</span></h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl p-5 border border-gray-800">
          <h2 className="text-gray-400 text-sm uppercase mb-3">Shift Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 text-xs">Opening</p>
              <p className="text-xl font-black text-[#C0C0C0]">PKR {shift?.opening_balance?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total In</p>
              <p className="text-xl font-black text-green-400">PKR {totalIn.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total Out</p>
              <p className="text-xl font-black text-red-400">PKR {totalOut.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Expected</p>
              <p className="text-xl font-black text-[#00D4AA]">PKR {expectedBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">Actual Closing Balance (PKR)</label>
          <input
            type="number"
            value={closingBalance}
            onChange={(e) => setClosingBalance(e.target.value)}
            className="w-full bg-[#1A1A2E] text-white border border-gray-700 rounded-2xl p-4 text-2xl font-black focus:outline-none focus:border-[#00D4AA]"
            placeholder="0"
          />
        </div>
        {closingBalance && (
          <div className={`rounded-2xl p-4 border ${variance === 0 ? "bg-green-500/20 border-green-500/30" : variance > 0 ? "bg-blue-500/20 border-blue-500/30" : "bg-red-500/20 border-red-500/30"}`}>
            <p className="text-gray-400 text-sm">Variance</p>
            <p className={`text-3xl font-black ${variance === 0 ? "text-green-400" : variance > 0 ? "text-blue-400" : "text-red-400"}`}>
              PKR {variance.toLocaleString()}
            </p>
            <p className="text-sm mt-1">{variance === 0 ? "Perfect! Koi farq nahi" : variance > 0 ? "Extra cash hai" : "Cash kam hai!"}</p>
          </div>
        )}
        <div>
          <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#1A1A2E] text-white border border-gray-700 rounded-2xl p-4 focus:outline-none focus:border-[#00D4AA]"
            placeholder="Koi note..."
            rows={3}
          />
        </div>
        <button onClick={handleEndShift} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase py-4 rounded-2xl text-lg tracking-wider">
          SHIFT KHATAM KARO
        </button>
      </div>
    </div>
  );
}
