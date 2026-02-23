import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../api";

type Brand = {
  id: string;
  name: string;
  created_at?: string;
};

type ManualResp = {
  id: string;
  brand_id: string;
  manual_json: any;
  version?: number;
  created_at?: string;
};

type GenType = "product_description" | "video_script" | "image_prompt";

function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
      {children}
    </span>
  );
}

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
  }
) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200/60",
        variant === "secondary" && "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        className
      )}
    />
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={clsx(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40",
        className
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={clsx(
        "min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40",
        className
      )}
    />
  );
}

function JsonViewer({ value }: { value: any }) {
  const text = useMemo(() => JSON.stringify(value, null, 2), [value]);
  return (
    <pre className="max-h-[520px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100 shadow-inner">
      {text}
    </pre>
  );
}

function SectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-mono text-sm text-slate-800 break-all">{value || "—"}</div>
    </div>
  );
}

export default function CreativeEngine() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");

  const [brandId, setBrandId] = useState<string>("");
  const [manual, setManual] = useState<ManualResp | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");

  const [type, setType] = useState<GenType>("product_description");
  const [brief, setBrief] = useState(
    "Descripción para ecommerce. Resaltar calidad y beneficios sin claims médicos. Mantener tono según manual."
  );

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState("");

  const [notice, setNotice] = useState("");

  // --- Fetch brands on mount ---
  useEffect(() => {
    (async () => {
      setBrandsLoading(true);
      setBrandsError("");
      try {
        const r = await fetch(`${API_BASE}/brands`);
        if (!r.ok) throw new Error(await r.text());
        const data = (await r.json()) as Brand[];
        setBrands(data || []);
        if (data?.length) {
          setBrandId((prev) => prev || data[0].id);
        }
      } catch (e: any) {
        setBrandsError(String(e?.message ?? e));
      } finally {
        setBrandsLoading(false);
      }
    })();
  }, []);

  // --- Fetch latest manual when brand changes ---
  useEffect(() => {
    if (!brandId) return;
    (async () => {
      setManualLoading(true);
      setManualError("");
      setManual(null);
      try {
        const r = await fetch(`${API_BASE}/brands/${brandId}/manual`);
        if (r.status === 404) {
          // Brand exists but no manual yet
          setManual(null);
          setManualError("Esta marca aún no tiene manual. Ve al Módulo I y genera el Brand DNA.");
          return;
        }
        if (!r.ok) throw new Error(await r.text());
        const data = (await r.json()) as ManualResp;
        setManual(data);
      } catch (e: any) {
        setManualError(String(e?.message ?? e));
      } finally {
        setManualLoading(false);
      }
    })();
  }, [brandId]);

  function setTemplateBrief(t: GenType) {
    if (t === "product_description") {
      setBrief("Descripción para ecommerce. Resaltar propuesta de valor, tono de marca y CTA suave. Evitar claims prohibidos.");
    } else if (t === "video_script") {
      setBrief("Guion 15s: Hook (0-3s), cuerpo (3-12s), cierre CTA (12-15s). Tono según manual. Evitar términos/claims prohibidos.");
    } else {
      setBrief("Prompt de imagen publicitaria. Incluir estilo, composición, luz, ambiente. Agregar negative prompt. Evitar símbolos o claims prohibidos por manual.");
    }
  }

  async function generate() {
    setErr("");
    setNotice("");
    setRes(null);
    setLoading(true);

    try {
      const r = await fetch(`${API_BASE}/content/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_id: brandId, type, brief }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setRes(data);
      setNotice("Generación completada. Pieza guardada en estado PENDING.");
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  const selectedBrand = useMemo(() => brands.find((b) => b.id === brandId), [brands, brandId]);

  // resumen amigable del manual
  const manualSummary = useMemo(() => {
    const m = manual?.manual_json;
    if (!m) return null;

    const toneDesc = m?.tone?.description ?? "";
    const preferred = Array.isArray(m?.messaging?.preferred_terms) ? m.messaging.preferred_terms.slice(0, 6) : [];
    const forbidden = Array.isArray(m?.messaging?.forbidden_terms) ? m.messaging.forbidden_terms.slice(0, 6) : [];
    const forbiddenClaims = Array.isArray(m?.messaging?.forbidden_claims) ? m.messaging.forbidden_claims.slice(0, 6) : [];

    return { toneDesc, preferred, forbidden, forbiddenClaims };
  }, [manual]);

  const canGenerate = Boolean(brandId) && Boolean(manual) && !manualLoading && !brandsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Content Suite — <span className="text-slate-600">Módulo II</span>
            </h1>
            <div className="flex items-center gap-2">
              <Badge>RAG (pgvector)</Badge>
              <Badge>Groq</Badge>
              <Badge>Langfuse</Badge>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Genera contenido usando <b>RAG obligatorio</b> desde el Brand Manual (manual → chunks → rerank → prompt final → LLM).
          </p>
        </div>

        {/* Alerts */}
        <div className="mt-6 space-y-3">
          {brandsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <b>Error cargando marcas:</b> {brandsError}
            </div>
          )}
          {manualError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <b>Manual:</b> {manualError}
            </div>
          )}
          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <b>Error:</b> {err}
            </div>
          )}
          {notice && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {notice}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Controls */}
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm ring-1 ring-indigo-100 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Generador</h2>
              <Badge>{canGenerate ? "Listo" : "Configura marca/manual"}</Badge>
            </div>

            <div className="mt-4 space-y-4">
              {/* Brand dropdown */}
              <div>
                <label className="text-sm font-medium text-slate-700">Marca</label>
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  disabled={brandsLoading}
                >
                  {brandsLoading && <option>cargando...</option>}
                  {!brandsLoading && brands.length === 0 && <option value="">No hay marcas (crea una en Módulo I)</option>}
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <SectionRow label="brand_id" value={brandId} />
                  <SectionRow label="brand_name" value={selectedBrand?.name ?? ""} />
                </div>
              </div>

              {/* Type */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <select
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    value={type}
                    onChange={(e) => {
                      const v = e.target.value as GenType;
                      setType(v);
                      setTemplateBrief(v);
                    }}
                  >
                    <option value="product_description">Descripción</option>
                    <option value="video_script">Guion 15s</option>
                    <option value="image_prompt">Prompt imagen</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end gap-2">
                  <Button className="w-full" onClick={generate} disabled={!canGenerate || loading}>
                    {loading ? "Generando..." : "Generar con RAG"}
                  </Button>
                  <Button
                    className="shrink-0"
                    variant="secondary"
                    onClick={() => {
                      setRes(null);
                      setErr("");
                      setNotice("");
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {/* Brief */}
              <div>
                <label className="text-sm font-medium text-slate-700">Brief</label>
                <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} />
                <div className="mt-1 text-xs text-slate-500">
                  Tip: menciona canal (“ecommerce”, “TikTok 15s”) y restricciones (“sin claims médicos”, etc.).
                </div>
              </div>

              {/* Manual quick status */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Manual activo</div>
                  <div className="text-xs text-slate-500">
                    {manualLoading ? "cargando..." : manual ? `v${manual.version ?? 1}` : "—"}
                  </div>
                </div>

                {manualLoading && <div className="mt-2 text-sm text-slate-600">Cargando manual...</div>}

                {!manualLoading && manual && manualSummary && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Tono</div>
                      <div className="text-sm text-slate-800">{manualSummary.toneDesc || "—"}</div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-xs font-semibold text-slate-700">Preferred</div>
                        <ul className="mt-2 space-y-1 text-xs text-slate-700">
                          {manualSummary.preferred.length ? manualSummary.preferred.map((t: string) => <li key={t}>• {t}</li>) : <li>—</li>}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-xs font-semibold text-slate-700">Forbidden terms</div>
                        <ul className="mt-2 space-y-1 text-xs text-slate-700">
                          {manualSummary.forbidden.length ? manualSummary.forbidden.map((t: string) => <li key={t}>• {t}</li>) : <li>—</li>}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-xs font-semibold text-slate-700">Forbidden claims</div>
                        <ul className="mt-2 space-y-1 text-xs text-slate-700">
                          {manualSummary.forbiddenClaims.length ? manualSummary.forbiddenClaims.map((t: string) => <li key={t}>• {t}</li>) : <li>—</li>}
                        </ul>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      manual_id: <span className="font-mono">{manual.id}</span>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => {
                        // toggle "full manual view" using res slot
                        setRes({ ...(res || {}), __manual_json: manual.manual_json });
                        setNotice("Manual JSON cargado en la sección Resultado.");
                      }}
                    >
                      Ver manual completo (JSON)
                    </Button>
                  </div>
                )}

                {!manualLoading && !manual && (
                  <div className="mt-2 text-sm text-slate-600">
                    No hay manual para esta marca. Genera el Brand DNA en Módulo I.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Output */}
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm ring-1 ring-indigo-100 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Resultado</h2>
              <div className="flex items-center gap-2">
                {res?.latency_ms != null && <Badge>latencia: {Math.round(res.latency_ms / 1000)}s</Badge>}
                {res?.reranked_chunks?.length != null && <Badge>chunks: {res.reranked_chunks.length}</Badge>}
                {res?.status && <Badge>{res.status}</Badge>}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SectionRow label="content_id" value={res?.content_id ?? ""} />
                <SectionRow label="brand_manual_id" value={res?.brand_manual_id ?? ""} />
              </div>

              {res?.output_text ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Output</div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{res.output_text}</pre>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Genera una pieza para ver el output y la evidencia RAG aquí.
                </div>
              )}

              {/* Evidence */}
              {Array.isArray(res?.reranked_chunks) && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Evidencia RAG (chunks re-rankeados)</div>
                  <div className="mt-3 space-y-2">
                    {res.reranked_chunks.map((c: any) => (
                      <div key={c.id} className="rounded-2xl border border-slate-200 p-3">
                        <div className="text-xs font-mono text-slate-500">
                          {c.section} · sim {Number(c.similarity ?? 0).toFixed(3)}
                        </div>
                        <div className="mt-1 text-sm text-slate-800">{String(c.chunk_text ?? "").slice(0, 260)}...</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual JSON (optional view) */}
              {res?.__manual_json && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Manual JSON</div>
                  <div className="mt-2">
                    <JsonViewer value={res.__manual_json} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-500">
          Si no ves marcas en el dropdown, crea una en el Módulo I. Si la marca no tiene manual, genera el Brand DNA primero.
        </div>
      </div>
    </div>
  );
}