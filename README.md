# Content Suite — Frontend (React)

Frontend del MVP **Content Suite**: UI para crear piezas, ver estado, aprobar/rechazar y auditar imágenes (según rol). Desplegado en **Vercel**.

## ✨ Features (MVP)
- Login con **Supabase Auth**
- **RBAC UI**
  - **CREATOR**: crear y ver solo sus piezas
  - **APPROVER_A**: bandeja de aprobaciones (approve/reject)
  - **APPROVER_B**: aprobaciones + **auditoría multimodal** (subida de imagen)
- Flujo de estados: **PENDING → APPROVED / REJECTED**
- Vista de pieza con:
  - output generado (texto / prompt)
  - feedback de aprobación
  - resultado auditoría (PASS/FAIL + recomendaciones)

## 🧱 Tech Stack
- React
- Supabase JS (Auth)
- Fetch/Axios hacia backend FastAPI
- Deploy: **Vercel**

## 🚀 Deploy
- **Vercel** (producción)
- Variables de entorno configuradas en Vercel (ver sección **Environment Variables**)

## ✅ Requisitos
- Node 18+
- Backend corriendo (local o Render)
- Proyecto Supabase (Auth)

## ⚙️ Setup local

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173` (o el puerto configurado)

## 🔐 Environment Variables

Crea `.env` (Vite) o configura en Vercel:

### Supabase
- `VITE_SUPABASE_URL=`
- `VITE_SUPABASE_ANON_KEY=`

### Backend API
- `VITE_API_BASE_URL=http://localhost:8000`  
  *(en prod: URL de Render)*

> Si tu proyecto usa Next.js, cambia a `NEXT_PUBLIC_...`.

## 🧭 Pantallas (sugeridas)
- `/login`
- `/creator/new` — crear pieza (description / script / image prompt)
- `/creator/my-content` — lista de piezas del creador
- `/approvals` — bandeja de aprobaciones (A y B)
- `/audit/:contentId` — auditoría de imagen (solo B)
- `/content/:id` — detalle de pieza (estado + output + feedback)

## 🔁 Flujo de usuario (demo)
1. **CREATOR** inicia sesión → crea pieza → queda **PENDING**
2. **APPROVER_A** revisa → **APPROVE/REJECT** con comentario
3. **APPROVER_B** (opcional) sube imagen → recibe **PASS/FAIL** + corrección
4. (Opcional) CREATOR ajusta y reenvía (si tu flujo lo soporta)

## 🔌 Integración con backend
El frontend envía el JWT de Supabase al backend:

- `Authorization: Bearer <access_token>`

Endpoints típicos consumidos:
- `POST /generate`
- `GET /content`
- `POST /content/{id}/approve`
- `POST /content/{id}/reject`
- `POST /content/{id}/audit-image`

## ✅ Checklist de verificación rápida
- [ ] Login funciona y persiste sesión
- [ ] CREATOR solo ve sus piezas
- [ ] APPROVER_A/B ven bandeja de pendientes
- [ ] APPROVER_B ve módulo de auditoría de imagen
- [ ] Estados se actualizan correctamente

## 🧩 Troubleshooting
- **CORS error**: backend debe permitir el origin de Vercel/local
- **401**: token expirado → refrescar sesión Supabase
- **No veo approvals**: rol incorrecto o mapping faltante en `profiles`

## 📌 Notas
- El “Brand DNA” vive en **Supabase Postgres + pgvector**.
- OpenAI se usa solo para **embeddings**; la generación de texto es vía **Groq** y la auditoría de imagen vía **Google AI Studio**.
