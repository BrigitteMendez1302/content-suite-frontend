export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function createBrand(name: string) {
  const r = await fetch(`${API_BASE}/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createManual(brandId: string, body: any) {
  const r = await fetch(`${API_BASE}/brands/${brandId}/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}