"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-wider">
            Cash<span className="text-[#00D4AA]">Guard</span>
          </h1>
          <p className="text-gray-400 mt-2">Har Paisa, Har Hisaab</p>
        </div>
        <div className="bg-[#1A1A2E] rounded-2xl p-8">
          <h2 className="text-white text-xl font-bold mb-6">Sign In</h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F0F1A] text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-[#00D4AA]"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F0F1A] text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-[#00D4AA]"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00D4AA] text-[#0F0F1A] font-black uppercase tracking-wider py-3 rounded-lg hover:bg-[#00B894] transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>
          </form>
          <p className="text-center text-gray-400 mt-4 text-sm">
            No account yet? <a href="/register" className="text-[#00D4AA]">Create Account</a>
          </p>
        </div>
        <p className="text-center text-gray-600 mt-6 text-xs uppercase tracking-widest">
          BY VORSA DIGITAL
        </p>
      </div>
    </div>
  );
}
