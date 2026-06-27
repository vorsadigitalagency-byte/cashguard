"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getLang, t } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

export default function OwnerDashboard() {
  const router = useRouter();
  const { profile, loading, signOut } = useAuth();
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      if (!profile) return;
      if (profile.role !== "owner") { router.push("/dashboard"); return; }
      const [{ data: c }, { data: s }, { data: tx }] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "cashier"),
        supabase.from("shifts").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setCashiers(c || []);
      setShifts(s || []);
      setTransactions(tx || []);
      setDataLoading(false);
    }
    if (profile) getData();
  }, [profile, router]);

  const lang = getLang();
  const tr = t[lang];

  const totalIn = transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">{tr.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24" dir={lang === "ur" ? "rtl" : "ltr"}>
      <div className="bg-[#0A0A0F] border-b border-gray-800 px-4 py-3 flex justify-between items-center sticky top-0 z-30">
        <img src="/logo.png" alt="CashGuard" className="h-7 w-auto" />
        <h1 className="text-lg font-black uppercase text-[#FF6B35]">{tr.ownerDashboard}</h1>
        <LangToggle />
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Cashiers</p>
            <p className="text-3xl font-black text-[#00D4AA]">{cashiers.length}</p>
          </div>
          <div className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Shifts</p>
            <p className="text-3xl font-black text-[#C0C0C0]">{shifts.length}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase">{tr.income}</p>
            <p className="text-xl font-black text-green-400">PKR {totalIn.toLocaleString()}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase">{tr.expense}</p>
            <p className="text-xl font-black text-red-400">PKR {totalOut.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#1A1A2E] rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-xs uppercase p-4 border-b border-gray-800">Recent Shifts</p>
          {shifts.length === 0 ? (
            <p className="text-gray-600 text-sm p-4">Koi shift nahi mili</p>
          ) : (
            shifts.slice(0, 5).map((s) => (
              <div key={s.id} className="p-4 border-b border-gray-800/50 flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-bold">PKR {s.opening_balance?.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <span className={"text-xs px-2 py-1 rounded-full font-bold " + (s.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400")}>
                  {s.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="bg-[#1A1A2E] rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-xs uppercase p-4 border-b border-gray-800">Recent Transactions</p>
          {transactions.length === 0 ? (
            <p className="text-gray-600 text-sm p-4">Koi transaction nahi</p>
          ) : (
            transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="p-4 border-b border-gray-800/50 flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-bold">{tx.category}</p>
                  <p className="text-gray-500 text-xs">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <p className={"font-black " + (tx.type === "income" ? "text-green-400" : "text-red-400")}>
                  {tx.type === "income" ? "+" : "-"} PKR {tx.amount?.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <button onClick={() => router.push("/dashboard")} className="w-full bg-[#1A1A2E] text-gray-400 font-bold uppercase py-3 rounded-2xl border border-gray-800">
          {tr.back}
        </button>
        <button onClick={signOut} className="w-full text-gray-600 text-sm uppercase py-2">{tr.logout}</button>
      </div>
    </div>
  );
}
