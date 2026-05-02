# 🧠 DocuMind AI — AI Document Chat (Frontend)

A production-grade React frontend for an **AI Document Chat** application. Upload your documents, then have a real conversation with them — every answer is **streamed** and **source-cited** back to the original file.

> **Frontend only.** The backend will be built separately. Until then the app is fully functional via a built-in mock service that simulates auth, uploads, and streaming AI responses with realistic delays. Swapping to the real backend is a single-file change (`src/services/mockApi.ts`).

---

## ✨ What's inside

| Area | Highlights |
|------|------------|
| **Auth** | Login + signup with React Hook Form + Zod, password strength meter, persisted session, protected routes |
| **Documents** | Drag-and-drop upload (react-dropzone), live progress, processing pipeline, search, sort, delete with confirmation |
| **Chat** | Multi-conversation sidebar, streaming responses (char-by-char), markdown rendering with GFM, source citations panel, suggested questions, keyboard shortcuts |
| **Dashboard** | Animated counters, recent activity, quick actions, system status |
| **UX** | Dark/Light mode with smooth transition, glassmorphism, Framer Motion micro-interactions, fully responsive (mobile drawer + desktop sidebar) |
| **Quality** | TypeScript strict mode, zero `any`, error boundary, accessible (ARIA, focus management, reduced-motion), `prefers-color-scheme` aware |

---

## 🛠 Tech stack

- **Framework** — React 18 + TypeScript (strict)
- **Build** — Vite 6
- **Styling** — Tailwind CSS 3 with CSS-variable theme tokens
- **State** — Zustand (with `persist` middleware for auth, docs, conversations, theme)
- **Forms** — React Hook Form + Zod
- **Animation** — Framer Motion
- **Icons** — Lucide React
- **Routing** — React Router 7
- **File upload** — react-dropzone
- **Markdown** — react-markdown + remark-gfm
- **Sanitization** — DOMPurify
- **Date utils** — date-fns

The full reasoning behind each choice lives in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and [`workflow-logs/DECISIONS.md`](./workflow-logs/DECISIONS.md).

---

## 🚀 Run it locally

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template (optional — defaults work out of the box)
cp .env.example .env.local

# 3. Start the dev server (http://localhost:3000)
npm run dev
```

### Demo account

> **Email:** `demo@company.com` &nbsp; **Password:** `demo123`

Any other email / password (8+ chars) also works — the mock backend simulates a successful signup-on-login flow.

---

## 📜 Available scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Type-check only (no emit) |

---

## 📂 Folder structure

```
/
├── docs/
│   ├── ARCHITECTURE.md      # Tech stack, data flow, decisions
│   ├── COMPONENTS.md        # API documentation for every component
│   └── SETUP.md             # Env vars, deployment notes
├── workflow-logs/
│   ├── PROGRESS.md          # Build log
│   └── DECISIONS.md         # Why each tool was chosen
├── public/                  # Static assets
└── src/
    ├── assets/              # Static imports (icons, illustrations)
    ├── components/
    │   ├── ui/              # Base reusable: Button, Input, Card, Modal,
    │   │                    # Toast, Badge, Spinner, Avatar, Skeleton,
    │   │                    # ProgressBar, EmptyState
    │   ├── layout/          # Sidebar, Header, AppShell, PageWrapper
    │   ├── auth/            # LoginForm, SignupForm, AuthLayout, ProtectedRoute
    │   ├── documents/       # UploadZone, DocumentCard, DocumentList, FileTypeIcon
    │   ├── chat/            # ChatContainer, MessageBubble, MessageList,
    │   │                    # TypingIndicator, SourceCard, ChatInput,
    │   │                    # ConversationSidebar, SuggestedQuestions
    │   ├── dashboard/       # StatsCard
    │   ├── ErrorBoundary.tsx
    │   └── PageLoader.tsx
    ├── hooks/               # useAuth, useTheme, useToast, useMediaQuery,
    │                        # useDebounce, useClickOutside
    ├── pages/               # LoginPage, SignupPage, DashboardPage,
    │                        # DocumentsPage, ChatPage, NotFoundPage
    ├── services/            # apiClient (HTTP), mockApi (simulator)
    ├── stores/              # authStore, chatStore, documentStore, uiStore
    ├── styles/              # global.css (theme tokens, prose, utilities)
    ├── types/               # All TypeScript interfaces in one place
    ├── utils/               # cn, formatters, validators, sanitizers, constants
    ├── App.tsx              # Routes + providers
    ├── main.tsx             # Entry point
    └── vite-env.d.ts
```

---

## 🔌 Connecting the real backend

When the backend is ready:

1. Open `src/services/mockApi.ts`.
2. Replace each exported function with a real call via `apiClient` (located in `src/services/apiClient.ts` — already wired with `Authorization: Bearer <token>` from the auth store).
3. Set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=https://your-backend/api` in `.env.local`.

That's the **entire** integration surface — the rest of the app already speaks the right shapes (see `src/types/index.ts`).

---

## ♿ Accessibility & quality

- All interactive elements are keyboard-reachable with visible focus rings.
- ARIA labels on every icon-only button.
- `prefers-reduced-motion` respected throughout.
- WCAG-AA contrast in both themes.
- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`, etc.) — **zero `any` in the codebase**.
- Lazy-loaded routes for snappy first paint.
- Persisted state (auth, theme, docs, conversations) — refresh-safe.

---

## 📄 License

Private — internal company project.
