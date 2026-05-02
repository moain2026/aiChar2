# Setup & deployment

## Local development

```bash
npm install
cp .env.example .env.local      # optional — defaults work
npm run dev                     # http://localhost:3000
```

> Node 18+ is required (Vite 6 requires it).

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Where the real backend will live |
| `VITE_USE_MOCK_API` | `true` | Toggle between mock and real backend |
| `VITE_APP_NAME` | `AI Document Chat` | Used in `<title>` and headers |
| `VITE_MAX_UPLOAD_MB` | `10` | Per-file upload cap (also enforced server-side later) |

All `VITE_*` variables are inlined at build time — they are **public**. Don't put secrets here.

## Production build

```bash
npm run build           # outputs dist/
npm run preview         # serve dist/ locally on :3000
```

The build is fully static — deploy `dist/` to:

- Cloudflare Pages
- Vercel
- Netlify
- Any S3 + CloudFront / NGINX

### SPA fallback

This is a single-page app — make sure all unknown routes serve `index.html`:

- **Cloudflare Pages**: works out of the box.
- **Vercel/Netlify**: works out of the box.
- **NGINX**:
  ```nginx
  location / { try_files $uri /index.html; }
  ```

## Hooking up the real backend

1. Implement the backend with the contract from `src/types/index.ts`:
   - `POST /auth/login` → `AuthSession`
   - `POST /auth/signup` → `AuthSession`
   - `POST /auth/logout` → `204`
   - `GET /documents` → `Document[]`
   - `POST /documents` (multipart) → `Document`
   - `DELETE /documents/:id` → `204`
   - `GET /conversations` → `Conversation[]`
   - `POST /conversations/:id/messages` (SSE) → stream of `StreamEvent`
2. Replace each function in `src/services/mockApi.ts` with real `apiClient.*` calls.
3. Set `VITE_USE_MOCK_API=false` and the right `VITE_API_BASE_URL`.
4. Re-build and deploy.

The auth token is automatically added to outgoing requests by `apiClient` — no plumbing needed in the stores.
