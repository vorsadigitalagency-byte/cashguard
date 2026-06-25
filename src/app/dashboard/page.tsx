"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-lg ${
        type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
      }`}
    >
      {message}
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

function StartShiftModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (amount: number) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");
  const invalid = !value || isNaN(Number(value)) || Number(value) < 0;

  return (
    <div className="fed inset-0 bg-black/70 z-40 flex items-end justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A2E] rounded-3xl p-6 border border-gray-700">
        <h3 className="text-white text-lg font-black uppercase mb-1">
          Shift Shuru Karo
        </h3>
        <p className="text-gray-400 text-sm mb-5">Opening cash daalo (PKR)</p>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          min="0"
          autoFocus
          className="w-full bg-[#0A0A0F] text-white border border-gray-700 rounded-2xl p-4 text-3xl font-black focus:outline-none focus:border-[#00D4AA] mb-4"
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 rounded-2xl bg-gray-800 text-gray-400 font-bold uppercase"
          >
            Cancel
          </button>
          <button
            onClick={() => !invalid && onConfirm(Number(value))}
            disabled={invalid || loading}
            className="py-3 rounded-2xl bg-[#00D4AA] text-[#0A0A0F] font-black uppercase disabled:opacity-40"
          >
            {loading ? "Starting..." : "START"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading, signOut } = useAuth();

  const [shift, setShift] = useState<{
    id: string;
    opening_balance: number;
    status: string;
  } | null>(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [startingShift, setStartingShift] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [shiftFetched, setShiftFetched] = useState(false);

  if (profile && !shiftFetched) {
    setShiftFetched(true);
    supabase
      .from("shifts")
      .select("*")
      .eq("cashier_id", profile.id)
      .eq("status", "active")
      .single()
      .then(({ data }) => {
        setShift(data);
        setShiftLoading(false);
      });
  }

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStartShift = async (openingBalance: number) => {
    if (!profile) return;
    setStartingShift(true);
    const { data, error } = await supabase
      .from("shifts")
      .insert({
        cashier_id: profile.id,
        opening_balance: openingBalance,
        status: "active",
      })
      .select()
      .single();

    setStartingShift(false);
    setShowModal(false);

    if (error || !data) {
      showToast("Shift start nahi hui. Dobara try karo.", "error");
      return;
    }
    setShift(data);
    showToast("Shift shuru ho gai! ✓", "success");
  };

  if (loading || shiftLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black text-white uppercase">
            Cash<span className="text-[#00D4AA]">Guard</span>
          </h1>
          <p className="text-gray-500 mt-2 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  const name = profile?.nick_name || profile?.full_name || "User";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showModal && (
        <StartShiftModal
          onConfirm={handleStartShift}
          onCancel={() => setShowModal(false)}
          loading={startingShift}
        />
      )}

      <div className="bg-gradient-to-r from-[#0A0A0F] via-[#1A1A2E] to-[#0A0A0F] p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-black uppercase tracking-wider">
          Cash<span className="text-[#00D4AA]">Guard</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#C0C0C0] flex items-center justify-center text-black font-black text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[#C0C0C0] text-sm font-bold">{name}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] rounded-3xl p-5 mb-4 border border-[#00D4AA]/20">
          <p className="text-gray-400 text-sm">Assalam o Alaikum</p>
          <h2 className="text-2xl font-black text-white mt-1">{name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-[#00D4AA]/20 text-[#00D4AA] text-xs px-3 py-1 rounded-full uppercase font-bold border border-[#00D4AA]/30">
              {profile?.role}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              shift
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gray-700/50 text-gray-400 border border-gray-600"
            }`}>
              {shift ? "Shift Active" : "No Shift"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Opening</p>
            <p className="text-2xl font-black text-[#00D4AA] mt-1">
              PKR {shift?.opening_balance?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Shift</p>
            <p className="text-2xl font-black text-[#C0C0C0] mt-1">
              {shift ? "Active" : "None"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {!shift ? (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-[#00D4AA] to-[#00B894] text-[#0A0A0F] font-black uppercase py-4 rounded-2xl text-lg tracking-wider"
            >
              START SHIFT
            </button>
          ) : (
            <button
              onClick={() => router.push("/shift/end")}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase py-4 rounded-2xl text-lg"
            >
              END SHIFT
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/transaction")}
              className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-[#C0C0C0]/20 text-sm"
            >
              ADD ENTRY
            </button>
            <button
              onClick={() => router.push("/history")}
              className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-[#C0C0C0]/20 text-sm"
            >
              HISTORY
            </button>
          </div>

          {profile?.role === "owner" && (
            <button
              onClick={() => router.push("/owner")}
              className="bg-[#FF6B35]/20 text-[#FF6B35] font-bold uppercase py-4 rounded-2xl border border-[#FF6B35]/30"
            >
              OWNER DASHBOARD
            </button>
          )}

          <button
            onClick={signOut}
            className="text-gray-600 text-sm uppercase tracking-wider py-2"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-gray-800 flex justify-around py-3 px-4">
        <button className="flex flex-col items-center gap-1">
          <span className="text-[#00D4AA] text-xl">🏠</span>
          <span className="tt-[#00D4AA] text-xs font-bold">Home</span>
        </button>
        <button
          onClick={() => router.push("/transaction")}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-gray-500 text-xl">➕</span>
          <span className="text-gray-500 text-xs">Entry</span>
        </button>
        <button
          onClick={() => router.push("/history")}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-gray-500 text-xl">📋</span>
          <span className="text-gray-500 text-xs">History</span>
        </button>
      </div>
    </div>
  );
}
