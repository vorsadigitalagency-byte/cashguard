"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TransactionPage() {
  const [profile, setProfile] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
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
      }
    };
    getData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift) {
      alert("Pehle Shift Shuru Karo!");
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      shift_id: shift.id,
      cashier_id: profile.id,
      type: type,
      amount: parseFloat(amount),
      category: category,
      description: description,
    });
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Entry Ho Gayi!");
      setAmount("");
      setCategory("");
      setDescription("");
    }
    setLoading(false);
  };

  const incomeCategories = ["Sale", "Order", "Advance", "Other Income"];
  const expenseCategories = ["Purchase", "Salary", "Utility", "Expense", "Other"];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24">
      <div className="bg-gradient-to-r from-[#0A0A0F] via-[#1A1A2E] to-[#0A0A0F] p-4 flex items-center gap-3 border-b border-gray-800">
        <button onClick={() => router.push("/dashboard")} className="text-[#00D4AA] font-bold">
          BACK
        </button>
        <h1 className="text-xl font-black uppercase tracking-wider">
          Add <span className="text-[#00D4AA]">Entry</span>
        </h1>
      </div>
      <div className="p-4">
        {!shift && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4">
            <p className="text-red-400 font-bold">Shift Active Nahi Hai!</p>
            <p className="text-red-300 text-sm">Pehle dashboard se shift shuru karo.</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setType("income")}
            className={`py-4 rounded-2xl font-black uppercase text-lg transition ${type === "income" ? "bg-gradient-to-r from-green-600 to-green-700 text-white" : "bg-[#1A1A2E] text-gray-400 border border-gray-700"}`}
          >
            AMDANI +
          </button>
          <button
            onClick={() => setType("expense")}
            className={`py-4 rounded-2xl font-black uppercase text-lg transition ${type === "expense" ? "bg-gradient-to-r from-red-600 to-red-700 text-white" : "bg-[#1A1A2E] text-gray-400 border border-gray-700"}`}
          >
            KHARCHA -
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">Amount (PKR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1A1A2E] text-white border border-gray-700 rounded-2xl p-4 text-2xl font-black focus:outline-none focus:border-[#00D4AA]"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-3 rounded-xl font-bold text-sm transition ${category === cat ? "bg-[#00D4AA] text-[#0A0A0F]" : "bg-[#1A1A2E] text-gray-400 border border-gray-700"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">Note (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A1A2E] text-white border border-gray-700 rounded-2xl p-4 focus:outline-none focus:border-[#00D4AA]"
              placeholder="Koi note..."
            />
          </div>
          <button
            type="submit"
            disabled={loading || !shift}
            className="w-full bg-gradient-to-r from-[#00D4AA] to-[#00B894] text-[#0A0A0F] font-black uppercase py-4 rounded-2xl text-lg tracking-wider disabled:opacity-50"
          >
            {loading ? "Saving..." : "ENTRY KARO"}
          </button>
        </form>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-gray-800 flex justify-around py-3 px-4">
        <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-[#00D4AA] text-xs font-bold">Entry</span>
        </button>
        <button onClick={() => router.push("/history")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xs">History</span>
        </button>
      </div>
    </div>
  );
}
