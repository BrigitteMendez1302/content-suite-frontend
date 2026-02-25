import React, { useMemo, useState } from "react";
import { createBrand, createManual, updateVisualRules } from "../api";

function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
      {children}
    </span>
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-slate-400/40 disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-slate-900 text-white hover:bg-slate-800"
          : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
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
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
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
        "min-h-[92px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
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

export default function BrandDNA() {
  const [brandName, setBrandName] = useState("Energía Natural");
  const [brandId, setBrandId] = useState<string>("");

  const [product, setProduct] = useState("Bebida energética natural con guaraná (sin azúcar)");
  const [tone, setTone] = useState("Enérgico, motivador, responsable (sin promesas médicas)");
  const [audience, setAudience] = useState("Jóvenes universitarios y deportistas recreativos");
  const [extra, setExtra] = useState("Evitar claims médicos; no prometer cura de fatiga ni rendimiento garantizado.");

  const [loadingBrand, setLoadingBrand] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const [colorsText, setColorsText] = useState("#FFFFFF\n#111827");
  const [logoRulesText, setLogoRulesText] = useState("Logo en esquina superior izquierda\nNo deformar\nMantener margen/clear space");
  const [typographyText, setTypographyText] = useState("Sans-serif\nTítulos en 600\nCuerpo regular");
  const [imageStyleText, setImageStyleText] = useState("Fotografía realista\nFondo limpio\nIluminación suave\nEstilo editorial");
  const [visualNotes, setVisualNotes] = useState("Reglas visuales definidas por usuario.");

  const toList = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);

  async function onCreateBrand() {
    setError("");
    setNotice("");
    setResult(null);
    setLoadingBrand(true);
    try {
      const data = await createBrand(brandName);
      setBrandId(data.id);
      setNotice("Brand creado. Ya puedes generar el manual.");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoadingBrand(false);
    }
  }

  async function onGenerateManual() {
    if (!brandId) return setError("Primero crea el Brand.");
    setError("");
    setNotice("");
    setLoadingManual(true);
    setResult(null);
    try {
      await saveVisualRules();
      const data = await createManual(brandId, {
        brand_name: brandName,
        product,
        tone,
        audience,
        extra_constraints: extra,
      });
      setResult(data);
      setNotice("Manual generado e indexado correctamente.");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoadingManual(false);
    }
  }

  async function saveVisualRules() {
    if (!brandId) {
      setError("Primero crea el Brand.");
      return;
    }

    setError("");
    setNotice("");

    try {
      const payload = {
        colors: toList(colorsText),
        logo_rules: toList(logoRulesText),
        typography: toList(typographyText),
        image_style: toList(imageStyleText),
        notes: visualNotes || null,
      };

      await updateVisualRules(brandId, payload);

      setNotice("Reglas visuales guardadas correctamente.");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Content Suite — <span className="text-slate-600">Módulo I</span>
            </h1>
            <div className="flex items-center gap-2">
              <Badge>FastAPI</Badge>
              <Badge>Supabase + pgvector</Badge>
              <Badge>Groq</Badge>
              <Badge>Langfuse</Badge>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Genera el <b>Manual de Marca estructurado</b> y lo indexa en la base vectorial para habilitar RAG en los siguientes módulos.
          </p>
        </div>

        {/* Alerts */}
        <div className="mt-6 space-y-3">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <b>Error:</b> {error}
            </div>
          )}
          {notice && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {notice}
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Parámetros</h2>
              <Badge>{brandId ? "Brand listo" : "Crea el brand"}</Badge>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Brand name</label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Ej: Energía Natural" />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={onCreateBrand} disabled={loadingBrand} className="w-full sm:w-auto" variant="secondary">
                  {loadingBrand ? "Creando..." : "Crear Brand"}
                </Button>
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <div className="text-xs text-slate-500">brandId</div>
                  <div className="font-mono">{brandId || "—"}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Producto</label>
                <Input value={product} onChange={(e) => setProduct(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Tono</label>
                <Input value={tone} onChange={(e) => setTone(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Público</label>
                <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-sm font-semibold text-slate-900">Visual Rules (User Input)</div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Colors (1 por línea)</label>
                  <Textarea value={colorsText} onChange={(e) => setColorsText(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Logo rules (1 por línea)</label>
                  <Textarea value={logoRulesText} onChange={(e) => setLogoRulesText(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Typography (1 por línea)</label>
                  <Textarea value={typographyText} onChange={(e) => setTypographyText(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Image style (1 por línea)</label>
                  <Textarea value={imageStyleText} onChange={(e) => setImageStyleText(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Notes (opcional)</label>
                  <Input value={visualNotes} onChange={(e) => setVisualNotes(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Restricciones extra (opcional)</label>
                <Textarea value={extra} onChange={(e) => setExtra(e.target.value)} />
                <div className="mt-1 text-xs text-slate-500">
                  Tip: aquí puedes poner “evitar claims médicos”, “no usar la palabra dieta”, etc.
                </div>
              </div>

              <Button onClick={onGenerateManual} disabled={!brandId || loadingManual} className="w-full">
                {loadingManual ? "Generando e indexando..." : "Generar Manual + Indexar (RAG)"}
              </Button>
            </div>
          </div>

          {/* Right: Output */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Resultado</h2>
              <div className="flex items-center gap-2">
                {result?.chunks_indexed != null && <Badge>chunks: {result.chunks_indexed}</Badge>}
                {result?.latency_ms != null && <Badge>latencia: {Math.round(result.latency_ms / 1000)}s</Badge>}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">manual_id</div>
                  <div className="font-mono text-sm text-slate-800 break-all">{result?.manual_id || "—"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">brand_id</div>
                  <div className="font-mono text-sm text-slate-800 break-all">{result?.brand_id || brandId || "—"}</div>
                </div>
              </div>

              {result?.manual_json ? (
                <JsonViewer value={result.manual_json} />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Genera un manual para ver el JSON estructurado aquí.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-8 text-xs text-slate-500">
          Próximo: Módulo II añadirá RAG retrieval (top-k chunks) + generación de descripción/guion/prompt de imagen con trazas.
        </div>
      </div>
    </div>
  );
}