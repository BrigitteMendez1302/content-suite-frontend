import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AuthPanel({
  onSession,
}: {
  onSession: (accessToken: string | null, email: string | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // initial session
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s) {
        setSessionEmail(s.user.email ?? null);
        onSession(s.access_token, s.user.email ?? null);
      }
    });

    // listen changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        setSessionEmail(s.user.email ?? null);
        onSession(s.access_token, s.user.email ?? null);
      } else {
        setSessionEmail(null);
        onSession(null, null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSessionEmail(data.user?.email ?? null);
      onSession(data.session?.access_token ?? null, data.user?.email ?? null);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setErr("");
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSessionEmail(null);
      onSession(null, null);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm ring-1 ring-indigo-100 p-5">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-slate-900">Login (Supabase)</div>
        {sessionEmail ? (
          <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 px-2.5 py-1 font-semibold">
            {sessionEmail}
          </span>
        ) : (
          <span className="text-xs rounded-full bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 px-2.5 py-1 font-semibold">
            No logueado
          </span>
        )}
      </div>

      {err && <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div>}

      {!sessionEmail ? (
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm font-medium text-slate-700">Email</div>
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700">Password</div>
            <input type="password" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button disabled={loading} onClick={signIn}
            className="h-11 w-full rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button disabled={loading} onClick={signOut}
            className="h-11 w-full rounded-xl bg-white border border-slate-200 font-semibold hover:bg-slate-50 disabled:opacity-60">
            {loading ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}