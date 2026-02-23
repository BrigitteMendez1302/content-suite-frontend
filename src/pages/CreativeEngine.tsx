import React, { useState } from "react";
import { API_BASE } from "../api";

export default function CreativeEngine() {
  const [brandId, setBrandId] = useState("");
  const [type, setType] = useState<"product_description"|"video_script"|"image_prompt">("product_description");
  const [brief, setBrief] = useState("Descripción para ecommerce del producto.");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState("");

  async function generate() {
    setErr(""); setRes(null); setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/content/generate`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ brand_id: brandId, type, brief })
      });
      if (!r.ok) throw new Error(await r.text());
      setRes(await r.json());
    } catch (e:any) {
      setErr(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-5xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Módulo II — Creative Engine</h1>

        {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-800">{err}</div>}

        <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 p-5 shadow-sm space-y-3">
          <div>
            <div className="text-sm font-medium">brand_id</div>
            <input className="h-11 w-full rounded-xl border px-3" value={brandId} onChange={e=>setBrandId(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-sm font-medium">Tipo</div>
              <select className="h-11 w-full rounded-xl border px-3" value={type} onChange={(e)=>setType(e.target.value as any)}>
                <option value="product_description">Descripción</option>
                <option value="video_script">Guion 15s</option>
                <option value="image_prompt">Prompt imagen</option>
              </select>
            </div>
            <button
              className="h-11 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 md:col-span-2"
              onClick={generate}
              disabled={loading}
            >
              {loading ? "Generando..." : "Generar con RAG"}
            </button>
          </div>

          <div>
            <div className="text-sm font-medium">Brief</div>
            <textarea className="min-h-[90px] w-full rounded-xl border p-3" value={brief} onChange={e=>setBrief(e.target.value)} />
          </div>
        </div>

        {res && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 p-5 shadow-sm">
              <div className="font-semibold">Output</div>
              <pre className="mt-2 rounded-2xl bg-slate-950 p-4 text-xs text-slate-100 overflow-auto">{res.output_text}</pre>
            </div>
            <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 p-5 shadow-sm">
              <div className="font-semibold">Evidencia RAG (chunks)</div>
              <div className="mt-2 space-y-2">
                {res.rag_chunks?.map((c:any)=>(
                  <div key={c.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-xs font-mono text-slate-500">{c.section} · sim {Number(c.similarity).toFixed(3)}</div>
                    <div className="text-sm text-slate-800 mt-1">{c.chunk_text.slice(0,220)}...</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}