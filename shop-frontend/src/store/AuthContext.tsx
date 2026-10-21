import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(async (id: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    setProfile((data as Profile | null) ?? null);
    setProfileReady(true);
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    if (!userId) {
      setProfile(null);
      setProfileReady(true);
      return;
    }
    setProfileReady(false);
    loadProfile(userId);
  }, [userId, sessionReady, loadProfile]);

  const value: AuthState = {
    user: session?.user ?? null,
    profile,
    loading: !sessionReady || !profileReady,

    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    signUp: async (email, password, fullName, phone) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } },
      });
      if (error) throw error;
      return { needsConfirmation: !data.session };
    },

    signOut: async () => {
      await supabase.auth.signOut();
    },

    refreshProfile: async () => {
      if (userId) await loadProfile(userId);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}