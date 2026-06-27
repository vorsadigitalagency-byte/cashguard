"use client";
import { useState, useEffect } from "react";
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

function StartShiftModal({ onConfirm, onCancel, loading, tr }: { onConfirm: (n: number) => void; onCancel: () => void; loading: boolean; tr: Record<string, string> }) {
  const [value, setValue] = useState("");
  const invalid = !value || isNaN(Number(value)) || Number(value) < 0;
  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-end justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A2E] rounded-3xl p-6 border border-gray-700">
        <h3 className="text-white text-lg font-black uppercase mb-1">{tr.shiftStart}</h3>
        <p className="text-gray-400 text-sm mb-5">{tr.openingCash}</p>
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" min="0" autoFocus className="w-full bg-[#0A0A0F] text-white border border-gray-700 rounded-2xl p-4 text-3xl font-black focus:outline-none focus:border-[#00D4AA] mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 rounded-2xl bg-gray-800 text-gray-400 font-bold uppercase">{tr.cancel}</button>
          <button onClick={() => !invalid && onConfirm(Number(value))} disabled={invalid || loading} className="py-3 rounded-2xl bg-[#00D4AA] text-[#0A0A0F] font-black uppercase disabled:opacity-40">{loading ? tr.loading : tr.start}</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading, signOut } = useAuth();
  const [shift, setShift] = useState<any>(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [startingShift, setStartingShift] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!loading && !profile) router.push("/login"); }, [profile, loading, router]);
  useEffect(() => {
    async function checkShift() {
      if (!profile) return;
      const { data } = await supabase.from("shifts").select("*").eq("cashier_id", profile.id).eq("status", "active").maybeSingle();
      setShift(data);
      setShiftLoading(false);
    }
    if (profile) checkShift();
  }, [profile]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStartShift = async (openingBalance: number) => {
    if (!profile) return;
    setStartingShift(true);
    const { data, error } = await supabase.from("shifts").insert({ cashier_id: profile.id, opening_balance: openingBalance, status: "active" }).select().single();
    setStartingShift(false);
    setShowModal(false);
    if (error || !data) { showToast("Shift start nahi hui", "error"); return; }
    setShift(data);
    showToast("Shift shuru ho gai!", "success");
  };

  if (!mounted || loading || shiftLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="CashGuard" className="h-12 w-auto mx-auto mb-4" />
          <p className="text-gray-500 animate-pulse text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const lang = getLang();
  const tr = t[lang];
  const name = profile?.nick_name || profile?.full_name || "User";
  const avatarUrl = (profile as any)?.avatar_url;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24" dir={lang === "ur" ? "rtl" : "ltr"}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showModal && <StartShiftModal onConfirm={handleStartShift} onCancel={() => setShowModal(false)} loading={startingShift} tr={tr} />}

      <div className="bg-[#0A0A0F] border-b border-gray-800 px-4 py-3 flex justify-between items-center sticky top-0 z-30">
        <img src="/logo.png" alt="CashGuard" className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <LangToggle />
          <button onClick={() => router.push("/profile")}>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00D4AA] bg-[#1A1A2E] flex items-center justify-center">
              {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : <span className="text-sm font-black text-[#00D4AA]">{name.charAt(0).toUpperCase()}</span>}
            </div>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] rounded-3xl p-5 border border-[#00D4AA]/20">
          <p className="text-gray-400 text-sm">{tr.greeting}</p>
          <h2 className="text-2xl font-black text-white mt-1">{name}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="bg-[#00D4AA]/20 text-[#00D4AA] text-xs px-3 py-1 rounded-full uppercase font-bold border border-[#00D4AA]/30">{profile?.role}</span>
            <span className={"text-xs px-3 py-1 rounded-full font-bold border " + (shift ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-800 text-gray-400 border-gray-700")}>{shift ? tr.shiftActive : tr.noShift}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase mb-1">{tr.opening}</p>
            <p className="text-2xl font-black text-[#00D4AA]">PKR {shift?.opening_balance?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase mb-1">{tr.role}</p>
            <p className="text-lg font-black text-gray-300">{shift ? tr.shiftActive : tr.noShift}</p>
          </div>
        </div>

        {!shift ? (
          <button onClick={() => setShowModal(true)} className="w-full bg-gradient-to-r from-[#00D4AA] to-[#00B894] text-[#0A0A0F] font-black uppercase py-4 rounded-2xl text-lg tracking-wider shadow-lg shadow-[#00D4AA]/20">
            {tr.startShift}
          </button>
        ) : (
          <button onClick={() => router.push("/shift/end")} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase py-4 rounded-2xl text-lg">
            {tr.endShift}
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push("/transaction")} className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-gray-800 text-sm">{tr.addEntry}</button>
          <button onClick={() => router.push("/history")} className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-gray-800 text-sm">{tr.history}</button>
        </div>

        {profile?.role === "owner" && (
          <button onClick={() => router.push("/owner")} className="w-full bg-[#FF6B35]/10 text-[#FF6B35] font-bold uppercase py-4 rounded-2xl border border-[#FF6B35]/30">
            {tr.ownerDashboard}
          </button>
        )}

        <button onClick={signOut} className="w-full text-gray-600 text-sm uppercase tracking-wider py-3">
          {tr.logout}
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F] border-t border-gray-800 flex justify-around py-2 px-4 z-30">
        <button className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">🏠</span>
          <span className="text-[#00D4AA] text-xs font-bold">{tr.home}</span>
        </button>
        <button onClick={() => router.push("/transaction")} className="flex flex-col items-center gap-1 py-1 px-3">
          <span className="text-2xl">+</span>
          <span className="text-gray-500 text-xs">{tr.entry}</span>
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
