"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
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
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleStartShift = async () => {
    const openingBalance = prompt("Opening Balance (PKR):");
    if (!openingBalance) return;
    const { data } = await supabase
      .from("shifts")
      .insert({
        cashier_id: profile.id,
        opening_balance: parseFloat(openingBalance),
        status: "active",
      })
      .select().single();
    setShift(data);
    alert("Shift Shuru Ho Gai!");
  };

  if (loading) {
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
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${shift ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-700/50 text-gray-400 border border-gray-600"}`}>
              {shift ? "Shift Active" : "No Shift"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Opening</p>
            <p className="text-2xl font-black text-[#00D4AA] mt-1">PKR {shift?.opening_balance || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs uppercase">Shift</p>
            <p className="text-2xl font-black text-[#C0C0C0] mt-1">{shift ? "Active" : "None"}</p>
          </div>
          <div className="bg-gradient-to-br from-[#0D2B1F] to-[#1A1A2E] rounded-2xl p-4 border border-green-900/50">
            <p className="text-gray-500 text-xs uppercase">Total In</p>
            <p className="text-2xl font-black text-green-400 mt-1">PKR 0</p>
          </div>
          <div className="bg-gradient-to-br from-[#2B0D0D] to-[#1A1A2E] rounded-2xl p-4 border border-red-900/50">
            <p className="text-gray-500 text-xs uppercase">Total Out</p>
            <p className="text-2xl font-black text-red-400 mt-1">PKR 0</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {!shift ? (
            <button onClick={handleStartShift} className="bg-gradient-to-r from-[#00D4AA] to-[#00B894] text-[#0A0A0F] font-black uppercase py-4 rounded-2xl text-lg tracking-wider">
              START SHIFT
            </button>
          ) : (
            <button className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase py-4 rounded-2xl text-lg">
              END SHIFT
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push("/transaction")} className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-[#C0C0C0]/20 text-sm">
              ADD ENTRY
            </button>
            <button onClick={() => router.push("/history")} className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-[#C0C0C0]/20 text-sm">
              HISTORY
            </button>
          </div>
          {profile?.role === "owner" && (
            <button onClick={() => router.push("/owner")} className="bg-[#FF6B35]/20 text-[#FF6B35] font-bold uppercase py-4 rounded-2xl border border-[#FF6B35]/30">
              OWNER DASHBOARD
            </button>
          )}
          <button onClick={handleLogout} className="text-gray-600 text-sm uppercase tracking-wider py-2">
            Logout
          </button>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-gray-800 flex justify-around py-3 px-4">
        <button className="flex flex-col items-center gap-1">
          <span className="text-[#00D4AA] text-xl">HOME</span>
          <span className="text-[#00D4AA] text-xs font-bold">Home</span>
        </button>
        <button onClick={() => router.push("/transaction")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xl">ENTRY</span>
          <span className="text-gray-500 text-xs">Entry</span>
        </button>
        <button onClick={() => router.push("/history")} className="flex flex-col items-center gap-1">
          <span className="text-gray-500 text-xl">HIST</span>
          <span className="text-gray-500 text-xs">History</span>
        </button>
      </div>
    </div>
  );
}
