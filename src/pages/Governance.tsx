import React, { useEffect, useMemo, useState } from "react";
import AuthPanel from "../components/AuthPanel";
import { API_BASE, inbox, approveContent, rejectContent, auditImage } from "../api";

type Item = {
  id: string;
  brand_id: string;
  brand_manual_id: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  input_brief: string;
  output_text: string;
  created_at: string;
};

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "red"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {children}
    </span>
  );
}

export default function Governance() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);

  const [comment, setComment] = useState("");
  const [auditFile, setAuditFile] = useState<File | null>(null);
  const [auditRes, setAuditRes] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Cuando cambia sesión: limpia estado y trae role desde backend
  async function onSession(token: string | null, userEmail: string | null) {
    setAccessToken(token);
    setEmail(userEmail);
    setRole(null);

    setItems([]);
    setSelected(null);
    setAuditRes(null);
    setComment("");
    setAuditFile(null);
    setErr("");
    setMsg("");

    if (token) {
      try {
        const r = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const data = await r.json();
          setRole(data.role);
        }
      } catch {
        // ignore (MVP)
      }
    }
  }

  async function loadInbox() {
    if (!accessToken) return;
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const data = await inbox(accessToken);
      const list = data.items || [];
      setItems(list);
      setSelected((prev) => prev ?? list[0] ?? null);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // si logueas, puedes autoload inbox si quieres:
    // if (accessToken) loadInbox();
  }, [accessToken]);

  const statusBadge = useMemo(() => {
    const s = selected?.status;
    if (!s) return <Badge>—</Badge>;
    if (s === "APPROVED") return <Badge tone="green">APPROVED</Badge>;
    if (s === "REJECTED") return <Badge tone="red">REJECTED</Badge>;
    return <Badge tone="amber">PENDING</Badge>;
  }, [selected]);

  async function approve() {
    if (!accessToken || !selected) return;
    setErr(""); setMsg(""); setLoading(true);
    try {
      await approveContent(accessToken, selected.id, comment || undefined);
      setMsg("Aprobado.");
      await loadInbox();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (!accessToken || !selected) return;
    setErr(""); setMsg(""); setLoading(true);
    try {
      await rejectContent(accessToken, selected.id, comment || undefined);
      setMsg("Rechazado.");
      await loadInbox();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function runAudit() {
    if (!accessToken || !selected || !auditFile) return;
    setErr(""); setMsg(""); setLoading(true);
    setAuditRes(null);
    try {
      const r = await auditImage(accessToken, selected.id, auditFile);
      setAuditRes(r);
      setMsg(r.verdict === "CHECK" ? "✅ CHECK: cumple manual" : "❌ FAIL: requiere correcciones");
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  const disabledByAuth = !accessToken;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Módulo III — Governance & Audit</h1>
          <div className="flex items-center gap-2">
            <Badge>RBAC</Badge>
            <Badge>Workflow</Badge>
            <Badge>Multimodal</Badge>
          </div>
        </div>

        {/* Auth */}
        <AuthPanel onSession={onSession} />

        {/* Session info */}
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm ring-1 ring-indigo-100 p-5 flex items-center justify-between">
          <div className="text-sm text-slate-700">
            <div><b>Email:</b> {email ?? "—"}</div>
            <div><b>Role:</b> {role ?? "—"} (backend)</div>
          </div>
          <button
            className="h-11 rounded-xl bg-indigo-600 text-white font-semibold px-4 disabled:opacity-60"
            disabled={disabledByAuth || loading}
            onClick={loadInbox}
          >
            {loading ? "Cargando..." : "Cargar inbox"}
          </button>
        </div>

        {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div>}
        {msg && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{msg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left list */}
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm ring-1 ring-indigo-100 p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">Inbox</div>
              <Badge>{items.length} items</Badge>
            </div>

            <div className="mt-3 space-y-2 max-h-[520px] overflow-auto">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => { setSelected(it); setAuditRes(null); setComment(""); }}
                  className={`w-full text-left rounded-2xl border p-3 ${
                    selected?.id === it.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"
                  }`}
                  disabled={disabledByAuth}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">{it.type}</div>
                    <Badge tone={it.status === "PENDING" ? "amber" : it.status === "APPROVED" ? "green" : "red"}>{it.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 font-mono break-all">{it.id}</div>
                  <div className="mt-2 text-sm text-slate-700 line-clamp-2">{it.input_brief}</div>
                </button>
              ))}
              {items.length === 0 && (
                <div className="text-sm text-slate-600">
                  {disabledByAuth ? "Inicia sesión para ver el inbox." : "Sin items (¿hay piezas PENDING?)"}
                </div>
              )}
            </div>
          </div>

          {/* Right detail */}
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm ring-1 ring-indigo-100 p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">Detalle</div>
              {statusBadge}
            </div>

            {!selected ? (
              <div className="mt-3 text-sm text-slate-600">
                {disabledByAuth ? "Inicia sesión primero." : "Selecciona un item del inbox."}
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <div className="text-xs text-slate-500 font-mono break-all">content_id: {selected.id}</div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Output</div>
                  <div className="mt-2 max-h-[240px] overflow-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-900">{selected.output_text}</p>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-700">Comentario</div>
                  <textarea
                    className="mt-1 min-h-[84px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={disabledByAuth}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    className="h-11 rounded-xl bg-emerald-600 text-white font-semibold px-4 disabled:opacity-60"
                    disabled={disabledByAuth || loading}
                    onClick={approve}
                  >
                    Aprobar
                  </button>
                  <button
                    className="h-11 rounded-xl bg-rose-600 text-white font-semibold px-4 disabled:opacity-60"
                    disabled={disabledByAuth || loading}
                    onClick={reject}
                  >
                    Rechazar
                  </button>
                </div>

                {/* Audit */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">Auditoría Multimodal (solo Approver B)</div>
                    {auditRes?.verdict && <Badge tone={auditRes.verdict === "CHECK" ? "green" : "red"}>{auditRes.verdict}</Badge>}
                  </div>

                  <input
                    className="mt-3 block w-full text-sm"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAuditFile(e.target.files?.[0] ?? null)}
                    disabled={disabledByAuth}
                  />

                  <button
                    className="mt-3 h-11 w-full rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-60"
                    disabled={disabledByAuth || loading || !auditFile}
                    onClick={runAudit}
                  >
                    {loading ? "Auditando..." : "Subir y Auditar"}
                  </button>

                  {auditRes?.report && (
                    <div className="mt-4 space-y-3">
                      {auditRes.image_url && (
                        <>
                          <div className="text-xs text-slate-500">image_url (signed):</div>
                          <a className="text-xs text-indigo-700 underline break-all" href={auditRes.image_url} target="_blank" rel="noreferrer">
                            {auditRes.image_url}
                          </a>
                        </>
                      )}

                      {Array.isArray(auditRes.report.violations) && auditRes.report.violations.length > 0 && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                          <div className="text-sm font-semibold text-rose-900">Violaciones</div>
                          <ul className="mt-2 space-y-2">
                            {auditRes.report.violations.map((v: any, idx: number) => (
                              <li key={idx} className="text-sm text-rose-900">
                                <div><b>Regla:</b> {v.rule}</div>
                                <div><b>Evidencia:</b> {v.evidence}</div>
                                <div><b>Fix:</b> {v.fix}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(auditRes.report.notes) && auditRes.report.notes.length > 0 && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                          <div className="text-sm font-semibold text-emerald-900">Notas</div>
                          <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                            {auditRes.report.notes.map((n: string, idx: number) => <li key={idx}>• {n}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  Si no eres Approver B, el backend devolverá 403 al intentar auditar imagen.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}