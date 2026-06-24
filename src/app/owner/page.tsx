"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("user_id", user.id).single();
      if (profileData?.role !== "owner") {
        router.push("/dashboard");
        return;
      }
      setProfile(profileData);
      const { data: cashierData } = await supabase
        .from("profiles").select("*").eq("role", "cashier");
      setCashiers(cashierData || []);
      const { data: shiftData } = await supabase
        .from("shifts").select("*")
        .order("created_at", { ascending: false }).limit(10);
      setShifts(shiftData || []);
      const { data: txData } = await supabase
        .from("transactions").select("*")
        .order("created_at", { ascending: false }).limit(20);
      setTransactions(txData || []);
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

  const totalVariance = shifts
    .filter((s) => s.status === "closed" && s.variance)
    .reduce((sum, s) => sum + s.variance, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-[#00D4AA] animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24">
      <div className="bg-gradient-to-r from-[#0A0A0F] via-[#1A1A2E] to-[#0A0A0F] p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-[#00D4AA] font-bold">BACK</button>
          <h1 className="text-xl font-black uppercase">
            Owner <span className="text-[#FF6B35]">Dashboard</span>
          </h1>
        </div>
        <span className="text-[#FF6B35] text-xs font-bold border border-[#FF6B35]/30 px-2 py-1 rounded-full">
          OWNER
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Total Cashiers</p>
            <p className="text-3xl font-black text-[#C0C0C0]">{cashiers.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Total Shifts</p>
            <p className="text-3xl font-black text-[#00D4AA]">{shifts.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#0D2B1F] to-[#1A1A2E] rounded-2xl p-4 border border-green-900/50">
            <p className="text-gray-500 text-xs uppercase">Total In</p>
            <p className="text-2xl font-black text-green-400">PKR {totalIn.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-[#2B0D0D] to-[#1A1A2E] rounded-2xl p-4 border border-red-900/50">
            <p className="text-gray-500 text-xs uppercase">Total Out</p>
            <p className="text-2xl font-black text-red-400">PKR {totalOut.toLocaleString()}</p>
          </div>
        </div>

        {totalVariance !== 0 && (
          <div className={`rounded-2xl p-4 border ${totalVariance < 0 ? "bg-red-500/20 border-red-500/30" : "bg-blue-500/20 border-blue-500/30"}`}>
            <p className="text-gray-400 text-sm uppercase">Total Variance</p>
            <p className={`text-3xl font-black ${totalVariance < 0 ? "text-red-400" : "text-blue-400"}`}>
              PKR {totalVariance.toLocaleString()}
            </p>
            <p className="text-sm mt-1 text-gray-400">
              {totalVariance < 0 ? "Cash shortage detected!" : "Extra cash detected"}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Cashiers</h2>
          <div className="space-y-2">
            {cashiers.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Koi cashier nahi</p>
            ) : (
              cashiers.map((c) => (
                <div key={c.id} className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#C0C0C0] flex items-center justify-center text-black font-black">
                      {(c.nick_name || c.full_name).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{c.nick_name || c.full_name}</p>
                      <p className="text-gray-500 text-xs">{c.full_name}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Recent Shifts</h2>
          <div className="space-y-2">
            {shifts.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Koi shift nahi</p>
            ) : (
              shifts.map((s) => (
                <div key={s.id} className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-xs">
                        {new Date(s.started_at).toLocaleString()}
                      </p>
                      <p className="font-bold text-white">
                        Opening: PKR {s.opening_balance?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${s.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                        {s.status}
                      </span>
                      {s.variance && (
                        <p className={`text-sm font-bold mt-1 ${s.variance < 0 ? "text-red-400" : "text-green-400"}`}>
                          Variance: PKR {s.variance}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-gray-800 flex justify-around py-3 px-4">
        <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xs">Home</span>
        </button>
        <button onClick={() => router.push("/transaction")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xs">Entry</span>
        </button>
        <button onClick={() => router.push("/history")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xs">History</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-[#FF6B35] text-xs font-bold">Owner</span>
        </button>
      </div>
    </div>
  );
}
