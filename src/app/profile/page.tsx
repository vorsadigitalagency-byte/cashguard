"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(null), 3500);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Photo must be less than 2MB", "error");
      return;
    }
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = profile.user_id + "." + fileExt;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });
    if (uploadError) {
      showToast("Upload failed. Try again.", "error");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("user_id", profile.user_id);
    if (updateError) {
      showToast("Failed to save photo. Try again.", "error");
      setUploading(false);
      return;
    }
    await refreshProfile();
    showToast("Photo updated!", "success");
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  const name = profile?.nick_name || profile?.full_name || "User";
  const avatarUrl = (profile as any)?.avatar_url;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24">
      {toast && (
        <div className={"fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-lg " + (toastType === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white")}>
          {toast}
        </div>
      )}
      <div className="bg-gradient-to-r from-[#0A0A0F] via-[#1A1A2E] to-[#0A0A0F] p-4 flex items-center gap-3 border-b border-gray-800">
        <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white">
          Back
        </button>
        <h1 className="text-xl font-black uppercase tracking-wider">
          My <span className="text-[#00D4AA]">Profile</span>
        </h1>
      </div>
      <div className="p-4 max-w-md mx-auto">
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#00D4AA] bg-[#1A1A2E] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-[#00D4AA]">{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-[#00D4AA] rounded-full flex items-center justify-center text-black font-black">
              +
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mt-4 px-6 py-2 bg-[#1A1A2E] border border-[#00D4AA]/30 text-[#00D4AA] rounded-full text-sm font-bold disabled:opacity-50">
            {uploading ? "Uploading..." : "Change Photo"}
          </button>
        </div>
        <div className="bg-[#1A1A2E] rounded-2xl p-5 space-y-4 border border-gray-800">
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Full Name</p>
            <p className="text-white font-bold">{profile?.full_name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Nick Name</p>
            <p className="text-white font-bold">{profile?.nick_name || "none"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Role</p>
            <span className="bg-[#00D4AA]/20 text-[#00D4AA] text-xs px-3 py-1 rounded-full uppercase font-bold border border-[#00D4AA]/30">
              {profile?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
