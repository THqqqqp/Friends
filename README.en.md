# Friends
>
> Templated Postcard Builder & Alumni Gallery (H5 + Admin + API)

[中文](README.md) | [English](README.en.md)

A full-stack Vue3 + Vite frontend and Express + MySQL backend for configuring postcard templates, generating personal composites, and managing/downloading alumni galleries. Ships with an admin panel, mobile-friendly H5 flow, and one-click Docker Compose deployment.

## 🧭 Structure

```
Friends
├─ frontend/        # H5: choose template, upload/crop, fill info, generate/download
├─ admin/           # Admin: login, template/gallery/analytics UI
├─ backend/         # API: auth, templates, gallery, stats, uploads
├─ docker/          # Nginx reverse proxy + frontend/backend Dockerfiles
├─ scripts/         # sync-env.mjs to sync VITE_* into frontend/admin
├─ docker-compose.yml
└─ readme.codex     # Dev changelog (ZH)
```

### 🛠️ Stack

- Frontends: Vite 7, Vue 3.5, TypeScript, Pinia, Vue Router, TailwindCSS, Axios, ECharts, html2canvas.
- Backend: Express 5, TypeScript, MySQL2, Multer, Sharp, JWT, Helmet, Morgan; storage via local disk or Aliyun OSS.
- Deployment: Docker Compose (MySQL + backend + Nginx static site); Nginx proxies `/api` and `/uploads`.

### ✨ Features

- **Template management (Admin):** Upload backgrounds/LOGO, edit slogan, lock crop ratios (1:1/3:4/4:3/16:9/9:16), choose logo corners, live preview; persist `photoArea` and `logo_position`.
- **Gallery management (Admin/H5):** Upload/filter by college/year/class, preview, download/copy link; big images auto get lightweight previews; remote URLs/OSS supported.
- **H5 flow:** Step-by-step “pick template → upload/adjust → fill info → preview/download”; horizontal template picker; masked user photo that never stretches or overflows; optional borders and greeting toggle; instant preview after edits.
- **Analytics:** `/stats/chart` for 30-day generate/download trends + college ranking; H5 reports on generate & download.
- **Uploads & storage:** Multer with `UPLOAD_MAX_SIZE_MB` (default 50MB); `storageService` abstracts local/OSS, handles compression & preview generation.
- **CORS & static:** `CLIENT_URLS` / `ADMIN_URLS` whitelist; static `/uploads` is cross-origin friendly; binds `0.0.0.0` for LAN testing.

## 🚀 Quick Start (Local)

```bash
pnpm install

# Backend
pnpm --filter backend dev   # http://localhost:4000/api

# H5
pnpm --filter frontend dev  # http://localhost:5173

# Admin
pnpm --filter admin dev     # http://localhost:5174
```

Run `backend/database/schema.sql` first, then create `.env` (see below).

## ⚙️ Environment

1) Copy `.env.example` to `.env`; fill JWT, admin account/password or hash, DB, domains, storage, upload limits.  
2) Run `node scripts/sync-env.mjs` to sync all `VITE_*` into `frontend/.env` and `admin/.env`.  
3) Keep `VITE_API_BASE_URL=/api` and `VITE_UPLOAD_BASE_URL=/uploads`: Vite proxies locally; Nginx handles in prod.  
4) Storage:
   - Local: `STORAGE_DRIVER=local` (default), `UPLOAD_DIR=backend/uploads`.
   - OSS: `STORAGE_DRIVER=oss` with `OSS_ACCESS_KEY_ID/SECRET/BUCKET/REGION/OSS_PUBLIC_DOMAIN`, etc.

## 🐳 Docker (Detailed)

1) Config  
   - Copy `.env.example` → `.env`; set domains, DB, JWT, upload dir, OSS (optional).  
   - Keep `VITE_API_BASE_URL=/api`, `VITE_UPLOAD_BASE_URL=/uploads` for same-origin access.  
   - Run `node scripts/sync-env.mjs` so frontend/admin share VITE config.

2) Build & Up  

```bash
docker compose build          # build backend + web (Nginx) images
docker compose up -d          # start mysql / backend / web
```

- `mysql`: auto-create DB/user (overridable via ENV), persisted in `mysql_data`.
- `backend`: reads `.env`, CORS from `CLIENT_URLS/ADMIN_URLS`, mounts `uploads`.
- `web`: Nginx serves built frontends, proxies `/api` and `/uploads` to `backend:4000`.

3) Access & Verify  
   - H5: `http://localhost`; Admin: `http://localhost/admin` (edit `docker/nginx.conf` if needed).  
   - Uploads/DB persisted in `uploads` and `mysql_data` volumes.  
   - For HTTPS, use Caddy/Traefik/Certbot on host, or tweak `docker/nginx.conf` to listen 443 with certs.

4) Ops & Tuning  
   - Upload limit: `UPLOAD_MAX_SIZE_MB` (also adjust Nginx `client_max_body_size`).  
   - Backup: periodically archive `uploads` and `mysql_data`; OSS reduces static volume pressure.  
   - Domains: set `server_name` in `docker/nginx.conf`; sync `CLIENT_URLS/ADMIN_URLS` in backend CORS.

## 📸 Screenshots

### Admin

<table>
  <tr>
    <td align="center"><img src="docs/assets/backend/backend_1.png" width="260" alt="Admin Templates"><br/>Templates</td>
    <td align="center"><img src="docs/assets/backend/backend_2.png" width="260" alt="Admin Gallery"><br/>Gallery</td>
    <td align="center"><img src="docs/assets/backend/backend_3.png" width="260" alt="Admin Stats"><br/>Stats</td>
  </tr>
</table>

### H5

<table>
  <tr>
    <td align="center"><img src="docs/assets/h5/app_1.png" width="220" alt="H5 Step 1"><br/>Step 1</td>
    <td align="center"><img src="docs/assets/h5/app_2.png" width="220" alt="H5 Step 2"><br/>Step 2</td>
    <td align="center"><img src="docs/assets/h5/app_3.png" width="220" alt="H5 Step 3"><br/>Step 3</td>
  </tr>
  <tr>
    <td align="center"><img src="docs/assets/h5/app_4.png" width="220" alt="H5 Gallery Search"><br/>Gallery Search</td>
    <td></td>
    <td></td>
  </tr>
</table>

See `readme.codex` for the detailed dev log.***
