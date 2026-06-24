"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(data);
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <p className="text-[#00D4AA] text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      <div className="bg-[#1A1A2E] p-4 flex justify-between items-center">
        <h1 className="text-xl font-black uppercase">
          Cash<span className="text-[#00D4AA]">Guard</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {profile?.nick_name || profile?.full_name}
          </span>
          <button onClick={handleLogout} className="text-gray-400 text-sm hover:text-white">
            Logout
          </button>
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          Welcome, {profile?.nick_name || profile?.full_name}!
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1A1A2E] rounded-2xl p-4">
            <p className="text-gray-400 text-sm">Today Cash</p>
            <p className="text-3xl font-black text-[#00D4AA]">PKR 0</p>
          </div>
          <div className="bg-[#1A1A2E] rounded-2xl p-4">
            <p className="text-gray-400 text-sm">Active Shift</p>
            <p className="text-3xl font-black text-white">None</p>
          </div>
          <div className="bg-[#1A1A2E] rounded-2xl p-4">
            <p className="text-gray-400 text-sm">Total In</p>
            <p className="text-3xl font-black text-green-400">PKR 0</p>
          </div>
          <div className="bg-[#1A1A2E] rounded-2xl p-4">
            <p className="text-gray-400 text-sm">Total Out</p>
            <p className="text-3xl font-black text-red-400">PKR 0</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button className="bg-[#00D4AA] text-[#0F0F1A] font-black uppercase py-4 rounded-2xl text-lg">
            START SHIFT
          </button>
          <button className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-gray-700">
            ADD TRANSACTION
          </button>
          <button className="bg-[#1A1A2E] text-white font-bold uppercase py-4 rounded-2xl border border-gray-700">
            VIEW HISTORY
          </button>
        </div>
      </div>
    </div>
  );
}
