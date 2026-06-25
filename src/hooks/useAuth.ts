"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nick_name: string | null;
  role: "cashier" | "manager" | "owner";
  created_at: string;
}

export interface AuthState {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(redirectTo = "/login"): AuthState {
  const router = useRouter();
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        await supabase.auth.signOut();
        router.push(redirectTo);
        return;
      }
      setProfile(data as Profile);
    },
    [router, redirectTo]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!authUser) {
        router.push(redirectTo);
        return;
      }

      setUser({ id: authUser.id, email: authUser.email });
      await fetchProfile(authUser.id);
      if (mounted) setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setProfile(null);
        router.push(redirectTo);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const u = session.user;
        setUser({ id: u.id, email: u.email });
        await fetchProfile(u.id);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, redirectTo, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return { user, profile, loading, signOut, refreshProfile };
}
