"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(profileData);
      if (profileData) {
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("cashier_id", profileData.id)
          .order("created_at", { ascending: false });
        setTransactions(txData || []);
      }
      setLoading(false);
    };
    getData();
  }, [router]);

  const filtered = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  const totalIn = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOut = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-[#00D4AA] animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24">
      <div className="bg-gradient-to-r from-[#0A0A0F] via-[#1A1A2E] to-[#0A0A0F] p-4 flex items-center gap-3 border-b border-gray-800">
        <button onClick={() => router.push("/dashboard")} className="text-[#00D4AA] font-bold">
          BACK
        </button>
        <h1 className="text-xl font-black uppercase tracking-wider">
          <span className="text-[#00D4AA]">History</span>
        </h1>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#0D2B1F] to-[#1A1A2E] rounded-2xl p-4 border border-green-900/50">
            <p className="text-gray-500 text-xs uppercase">Total In</p>
            <p className="text-2xl font-black text-green-400">
              PKR {totalIn.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#2B0D0D] to-[#1A1A2E] rounded-2xl p-4 border border-red-900/50">
            <p className="text-gray-500 text-xs uppercase">Total Out</p>
            <p className="text-2xl font-black text-red-400">
              PKR {totalOut.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {["all", "income", "expense"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-2 rounded-xl font-bold text-sm uppercase transition ${filter === f ? "bg-[#00D4AA] text-[#0A0A0F]" : "bg-[#1A1A2E] text-gray-400 border border-gray-700"}`}
            >
              {f === "all" ? "All" : f === "income" ? "Amdani" : "Kharcha"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Koi entry nahi mili</p>
            <button
              onClick={() => router.push("/transaction")}
              className="mt-4 bg-[#00D4AA] text-[#0A0A0F] font-black uppercase px-6 py-3 rounded-xl"
            >
              Add Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-white">{tx.category}</p>
                  <p className="text-gray-400 text-sm">{tx.description || "No note"}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}PKR {tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${tx.type === "income" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {tx.type === "income" ? "Amdani" : "Kharcha"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-gray-800 flex justify-around py-3 px-4">
        <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xs">Home</span>
        </button>
        <button onClick={() => router.push("/transaction")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xs">Entry</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-[#00D4AA] text-xs font-bold">History</span>
        </button>
      </div>
    </div>
  );
}
