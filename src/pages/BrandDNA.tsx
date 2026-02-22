import React, { useState } from "react";
import { createBrand, createManual } from "../api";
import { ManualView } from "../components/ManualView";

export default function BrandDNA() {
  const [brandName, setBrandName] = useState("Demo Brand");
  const [brandId, setBrandId] = useState<string>("");
  const [product, setProduct] = useState("Snack saludable de quinua");
  const [tone, setTone] = useState("Divertido pero profesional");
  const [audience, setAudience] = useState("Gen Z");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  async function onCreateBrand() {
    setError("");
    const data = await createBrand(brandName);
    setBrandId(data.id);
  }

  async function onGenerateManual() {
    if (!brandId) return setError("Primero crea el Brand.");
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await createManual(brandId, { brand_name: brandName, product, tone, audience });
      setResult(data);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Module I — Brand DNA Architect</h1>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <label>
          Brand name
          <input value={brandName} onChange={(e) => setBrandName(e.target.value)} style={{ width: "100%" }} />
        </label>

        <button onClick={onCreateBrand} style={{ height: 42, alignSelf: "end" }}>
          Crear Brand
        </button>

        <label>
          Producto
          <input value={product} onChange={(e) => setProduct(e.target.value)} style={{ width: "100%" }} />
        </label>

        <label>
          Tono
          <input value={tone} onChange={(e) => setTone(e.target.value)} style={{ width: "100%" }} />
        </label>

        <label>
          Público
          <input value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: "100%" }} />
        </label>

        <button disabled={loading} onClick={onGenerateManual} style={{ height: 42, alignSelf: "end" }}>
          {loading ? "Generando..." : "Generar Manual + Indexar Chunks"}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div>brandId: <code>{brandId || "(no creado)"}</code></div>
        {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
      </div>

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Resultado</h2>
          <div>manual_id: <code>{result.manual_id}</code></div>
          <div>chunks_indexed: <code>{result.chunks_indexed}</code></div>
          <ManualView manual={result.manual_json} />
        </div>
      )}
    </div>
  );
}