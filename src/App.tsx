import React, { useState } from "react";
import BrandDNA from "./pages/BrandDNA";
import CreativeEngine from "./pages/CreativeEngine";

export default function App() {
  const [page, setPage] = useState<"brand" | "engine">("brand");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between py-4">
          <div className="text-lg font-bold text-slate-900">Content Suite</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage("brand")}
              className={`h-10 rounded-xl px-4 text-sm font-semibold border ${
                page === "brand" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-900 border-slate-200"
              }`}
            >
              Módulo I
            </button>
            <button
              onClick={() => setPage("engine")}
              className={`h-10 rounded-xl px-4 text-sm font-semibold border ${
                page === "engine" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-900 border-slate-200"
              }`}
            >
              Módulo II
            </button>
          </div>
        </div>

        {page === "brand" ? <BrandDNA /> : <CreativeEngine />}
      </div>
    </div>
  );
}