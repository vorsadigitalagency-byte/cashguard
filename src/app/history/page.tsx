"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getLang, t } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

export default function HistoryPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      if (!profile) return;
      const { data } = await supabase
        .from("transactions").select("*")
        .eq("cashier_id", profile.id)
        .order("created_at", { ascending: false });
      setTransactions(data || []);
      setDataLoading(false);
    }
    if (profile) getData();
  }, [profile]);

  const lang = getLang();
  const tr = t[lang];

  const filtered = filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter);
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
        <button onClick={() => router.push("/dashboard")} className="text-[#00D4AA] font-bold">{tr.back}</button>
        <h1 className="text-lg font-black uppercase">{tr.history}</h1>
        <LangToggle />
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase">{tr.income}</p>
            <p className="text-xl font-black text-green-400">PKR {totalIn.toLocaleString()}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase">{tr.expense}</p>
            <p className="text-xl font-black text-red-400">PKR {totalOut.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["all", "income", "expense"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={"py-2 rounded-xl text-xs font-bold uppercase transition " + (filter === f ? "bg-[#00D4AA] text-[#0A0A0F]" : "bg-[#1A1A2E] text-gray-400 border border-gray-700")}>
              {f === "all" ? "All" : f === "income" ? tr.income : tr.expense}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">📋</p>
            <p>Koi entry nahi mili</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => (
              <div key={tx.id} className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{tx.category}</p>
                  <p className="text-gray-500 text-xs">{tx.description || "—"}</p>
                  <p className="text-gray-600 text-xs">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <p className={"text-lg font-black " + (tx.type === "income" ? "text-green-400" : "text-red-400")}>
                  {tx.type === "income" ? "+" : "-"} PKR {tx.amount?.toLocaleString()}
            </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F] border-t border-gray-800 flex justify-around py-2 px-4 z-30">
        <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">🏠</span>
          <span className="text-gray-500 text-xs">{tr.home}</span>
        </button>
        <button onClick={() => router.push("/transaction")} className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">+</span>
          <span className="text-gray-500 text-xs">{tr.entry}</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">📋</span>
          <span className="text-[#00D4AA] text-xs font-bold">{tr.history}</span>
        </button>
        <button onClick={() => router.push("/profile")} className="flex flex-col items-centap-1 py-1 px-3">
          <span className="text-2xl">👤</span>
          <span className="text-gray-500 text-xs">{tr.profile}</span>
        </button>
      </div>
    </div>
  );
}
