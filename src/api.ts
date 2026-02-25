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

export async function inbox(token: string) {
  const r = await fetch(`${API_BASE}/inbox`, { headers: { Authorization: `Bearer ${token}` }});
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function approveContent(token: string, id: string, comment?: string) {
  const r = await fetch(`${API_BASE}/content/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ comment }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function rejectContent(token: string, id: string, comment?: string) {
  const r = await fetch(`${API_BASE}/content/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ comment }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function auditImage(token: string, id: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API_BASE}/content/${id}/audit-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function auditBrandImage(token: string, brandId: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const r = await fetch(`${API_BASE}/brands/${brandId}/audit-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateVisualRules(brandId: string, body: any) {
  const r = await fetch(`${API_BASE}/brands/${brandId}/visual-rules`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}