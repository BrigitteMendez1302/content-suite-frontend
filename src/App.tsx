import React, { useState, useEffect } from "react";
import BrandDNA from "./pages/BrandDNA";
import CreativeEngine from "./pages/CreativeEngine";
import Governance from "./pages/Governance";

type Page = "brand" | "engine" | "gov";

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-xl px-4 text-sm font-semibold border transition
        ${
          active
            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200/60"
            : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
        }`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(() => (localStorage.getItem("page") as Page) || "brand");
  useEffect(() => localStorage.setItem("page", page), [page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Top Nav */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-slate-900">Content Suite</div>
            <div className="text-xs text-slate-500">
              MVP · Brand DNA → Creative Engine → Governance
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <NavButton active={page === "brand"} onClick={() => setPage("brand")}>
              Módulo I
            </NavButton>
            <NavButton active={page === "engine"} onClick={() => setPage("engine")}>
              Módulo II
            </NavButton>
            <NavButton active={page === "gov"} onClick={() => setPage("gov")}>
              Módulo III
            </NavButton>
          </div>
        </div>

        {/* Page */}
        <div className="mt-6">
          {page === "brand" && <BrandDNA />}
          {page === "engine" && <CreativeEngine />}
          {page === "gov" && <Governance />}
        </div>
      </div>
    </div>
  );
}