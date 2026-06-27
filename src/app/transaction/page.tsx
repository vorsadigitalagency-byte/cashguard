"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getLang, t } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={"fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-lg " + (type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
      {message}
      <button onClick={onClose} className="ml-3 opacity-70">x</button>
    </div>
  );
}

export default function TransactionPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [shift, setShift] = useState<any>(null);
  const [shiftChecked, setShiftChecked] = useState(false);
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (profile && !shiftChecked) {
    setShiftChecked(true);
    supabase.from("shifts").select("*").eq("cashier_id", profile.id).eq("status", "active").maybeSingle()
      .then(({ data }) => setShift(data));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift) {
      showToast(tr.noActiveShift || "Pehle shift shuru karo!", "error");
      return;
    }
    if (!category) {
      showToast("Category select karo", "error");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("transactions").insert({
      shift_id: shift.id,
      cashier_id: profile?.id,
      type,
      amount: parseFloat(amount),
      category,
      description,
    });
    setSaving(false);
    if (error) {
      showToast("Error: " + error.message, "error");
    } else {
      showToast("Entry ho gai!", "success");
      setAmount("");
      setCategory("");
      setDescription("");
    }
  };

  const lang = getLang();
  const tr = t[lang];

  const incomeCategories = ["Sale", "Order", "Advance", "Other Income"];
  const expenseCategories = ["Purchase", "Salary", "Utility", "Expense", "Other"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">{tr.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24" dir={lang === "ur" ? "rtl" : "ltr"}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-[#0A0A0F] border-b border-gray-800 px-4 py-3 flex justify-between items-center sticky top-0 z-30">
        <button onClick={() => router.push("/dashboard")} className="text-[#00D4AA] font-bold">
          {tr.back}
        </button>
        <h1 className="text-lg font-black uppercase">
          {tr.addEntry}
        </h1>
        <LangToggle />
      </div>

      <div className="p-4">
        {!shift && shiftChecked && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4">
            <p className="text-red-400 font-bold">Shift Active Nahi Hai!</p>
            <p className="text-red-300 text-sm">Pehle dashboard se shift shuru karo.</p>
            <button onClick={() => router.push("/dashboard")} className="mt-2 text-[#00D4AA] text-sm font-bold">
              Dashboard Par Jao
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => { setType("income"); setCategory(""); }}
            className={"py-4 rounded-2xl font-black uppercase text-lg transition " + (type === "income" ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/20" : "bg-[#1A1A2E] text-gray-400 border border-gray-700")}
          >
            {tr.income} +
          </button>
          <button
            onClick={() => { setType("expense"); setCategory(""); }}
            className={"py-4 rounded-2xl font-black uppercase text-lg transition " + (type === "expense" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20" : "bg-[#1A1A2E] text-gray-400 border border-gray-700")}
          >
            {tr.expense} -
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">{tr.amount} (PKR)</label>
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
            <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">{tr.category}</label>
            <div className="grid grid-cols-2 gap-2">
              {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={"py-3 rounded-xl font-bold text-sm transition " + (category === cat ? "bg-[#00D4AA] text-[#0A0A0F]" : "bg-[#1A1A2E] text-gray-400 border border-gray-700 hover:border-[#00D4AA]/30")}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block uppercase tracking-wider">{tr.description}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1A1A2E] text-white border border-gray-700 rounded-2xl p-4 focus:outline-none focus:border-[#00D4AA]"
              placeholder="Note..."
            />
          </div>

          <button
            type="submit"
            disabled={saving || !shift || !amount}
            className="w-full bg-gradient-to-r from-[#00D4AA] to-[#00B894] text-[#0A0A0F] font-black uppercase py-4 rounded-2xl text-lg tracking-wider disabled:opacity-50 shadow-lg shadow-[#00D4AA]/20"
          >
            {saving ? tr.loading : tr.saveEntry}
          </button>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F] border-t border-gray-800 flex justify-around py-2 px-4 z-30">
        <button onClick={() => router.push("/dashboard")} className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">🏠</span>
          <span className="text-gray-500 text-xs">{tr.home}</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">+</span>
          <span className="text-[#00D4AA] text-xs font-bold">{tr.entry}</span>
        </button>
        <button onClick={() => router.push("/history")} className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">📋</span>
          <span className="text-gray-500 text-xs">{tr.history}</span>
        </button>
        <button onClick={() => router.push("/profile")} className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">👤</span>
          <span className="text-gray-500 text-xs">{tr.profile}</span>
        </button>
      </div>
    </div>
  );
}
