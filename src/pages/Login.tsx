import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { API_BASE } from "../api";

export default function Login({ onLoggedIn }: { onLoggedIn: (role: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function signIn() {
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const token = data.session?.access_token;
      if (!token) throw new Error("No access token");

      const r = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(await r.text());
      const me = await r.json();
      onLoggedIn(me.role);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm ring-1 ring-indigo-100 p-6">
        <h1 className="text-xl font-bold text-slate-900">Content Suite</h1>
        <p className="text-sm text-slate-600 mt-1">Inicia sesión para continuar.</p>

        {err && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div>}

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm font-medium text-slate-700">Email</div>
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700">Password</div>
            <input type="password" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button
            onClick={signIn}
            disabled={loading}
            className="h-11 w-full rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}