"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getLang, t } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void; }) {
  return (
    <div className={"fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-lg " + (type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white")}>
      {message}
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">x</button>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [shift, setShift] = useState<any>(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [startingShift, setStartingShift] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  useEffect(() => {
    async function checkActiveShift() {
      if (!profile) return;
      const { data } = await supabase
        .from("shifts")
        .select("*")
        .eq("cashier_id", profile.id)
        .eq("status", "active")
        .maybeSingle();
      if (data) setShift(data);
      setShiftLoading(false);
    }
    if (profile) checkActiveShift();
  }, [profile]);

  if (!mounted || loading || shiftLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <h1 className="text-3xl font-black text-white uppercase">Cash<span className="text-[#00D4AA]">Guard</span></h1>
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
      
      <div className="bg-gradient-to-r from-[#0A0A0F] via-[#1A1A2E] to-[#0A0A0F] p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-black uppercase tracking-wider">Cash<span className="text-[#00D4AA]">Guard</span></h1>
        <div className="flex items-center gap-4">
          <LangToggle />
          <button onClick={() => router.push("/profile")} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00D4AA] bg-[#1A1A2E] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black text-[#00D4AA]">{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="text-[#C0C0C0] text-sm font-bold">{name}</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] rounded-3xl p-5 mb-4 border border-[#00D4AA]/20">
          <p className="text-gray-400 text-sm">{tr.greeting}</p>
          <h2 className="text-2xl font-black text-white mt-1">{name}</h2>
          <span className="mt-2 inline-block bg-[#00D4AA]/20 text-[#00D4AA] text-xs px-3 py-1 rounded-full uppercase font-bold">{profile?.role}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">{tr.opening}</p>
            <p className="text-2xl font-black text-[#00D4AA] mt-1">PKR {shift?.opening_balance || 0}</p>
          </div>
          <div className="bg-[#1A1A2E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">{tr.role}</p>
            <p className="text-2xl font-black text-gray-400 mt-1">{shift ? tr.shiftActive : tr.noShift}</p>
          </div>
        </div>

        <button className="w-full bg-[#00D4AA] text-[#0A0A0F] font-black uppercase py-4 rounded-2xl text-lg mb-4">
          {shift ? tr.endShift : tr.startShift}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push("/transaction")} className="bg-[#1A1A2E] text-white font-bold py-4 rounded-2xl border border-gray-800 text-sm">{tr.addEntry}</button>
          <button onClick={() => router.push("/history")} className="bg-[#1A1A2E] text-white font-bold py-4 rounded-2xl border border-gray-800 text-sm">{tr.history}</button>
        </div>
      </div>
    </div>
  );
}
