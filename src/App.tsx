import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { API_BASE } from "./api";

import Login from "./pages/Login";
import BrandDNA from "./pages/BrandDNA";
import CreativeEngine from "./pages/CreativeEngine";
import Governance from "./pages/Governance";

type Page = "brand" | "engine" | "gov";
const [accessToken, setAccessToken] = useState<string | null>(null);

function NavButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-xl px-4 text-sm font-semibold border transition
        ${active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("gov");
  const [booting, setBooting] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      setAccessToken(token ?? null);
      if (!token) {
        setBooting(false);
        return;
      }
      const r = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const me = await r.json();
        setRole(me.role);
        setPage(me.role === "creator" ? "brand" : "gov");
      }
      setBooting(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setRole(null);
    setPage("gov");
  }

  if (booting) return null;

  // Not logged in: show login page
  if (!role) {
    return (
      <Login
        onLoggedIn={(r) => {
          setRole(r);
          setPage(r === "creator" ? "brand" : "gov");
        }}
      />
    );
  }

  const isCreator = role === "creator";
  const isApprover = role === "approver_a" || role === "approver_b";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">Content Suite</div>
            <div className="text-xs text-slate-500">Rol: {role}</div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {isCreator && (
              <>
                <NavButton active={page === "brand"} onClick={() => setPage("brand")}>Módulo I</NavButton>
                <NavButton active={page === "engine"} onClick={() => setPage("engine")}>Módulo II</NavButton>
              </>
            )}
            {(isCreator || isApprover) && (
              <NavButton active={page === "gov"} onClick={() => setPage("gov")}>Módulo III</NavButton>
            )}
            <button onClick={logout} className="h-10 rounded-xl px-4 text-sm font-semibold border bg-white border-slate-200 hover:bg-slate-50">
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="mt-6">
          {page === "brand" && isCreator && <BrandDNA />}
          {page === "engine" && isCreator && <CreativeEngine />}
          {page === "gov" && <Governance accessToken={accessToken} role={role} />}
        </div>
      </div>
    </div>
  );
}