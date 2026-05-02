# Architecture

A practical, opinionated architecture for an AI Document Chat frontend that needs to feel **production-grade today**, with a clear path to plug in the real backend later.

---

## 1. Tech stack & reasoning

| Concern | Choice | Why |
|---------|--------|-----|
| **Framework** | React 18 + TypeScript (strict) | Industry standard, vast ecosystem, strong types catch bugs at compile time. Strict mode enforced (`noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`) — **no `any` allowed**. |
| **Bundler** | Vite 6 | Instant HMR, native ESM, fastest dev experience. Manual chunk splitting for vendor / animation / forms / markdown. |
| **Styling** | Tailwind CSS 3 + CSS variables | Utility-first lets us iterate quickly. CSS variables let dark/light themes change without re-rendering React. |
| **State** | Zustand + `persist` | Tiny (1.2 kB), no provider hell, selectors are explicit, persistence to `localStorage` is a one-liner. We rejected Redux Toolkit (too much boilerplate for this size) and Context (not great for frequent updates like streaming chat). |
| **Server state** | (Not used — mock only) | When the real API arrives, **TanStack Query** is the planned drop-in. The current `apiClient` is shaped to slot in cleanly. |
| **Forms** | React Hook Form + Zod | Uncontrolled inputs = great perf. Zod gives us a single source of truth for validation, reusable on the backend later. |
| **Animation** | Framer Motion | Declarative, layout animations, `AnimatePresence`, `whileTap`. Polished feel out-of-the-box. |
| **Icons** | Lucide React | Tree-shakable, consistent stroke width, modern. |
| **Routing** | React Router 7 | De-facto standard, supports lazy routes via `React.lazy`. |
| **File upload** | react-dropzone | Battle-tested, accessible, handles all the edge cases we'd otherwise hand-roll. |
| **Markdown** | react-markdown + remark-gfm | Safe by default (no raw HTML), GitHub-flavored Markdown for tables/checklists/code. |
| **Date** | date-fns | Tree-shakable, immutable, no timezone surprises. |

---

## 2. Component hierarchy (text diagram)

```
<App>
└── <ErrorBoundary>
    └── <BrowserRouter>
        ├── <PageTitle>           # Updates document.title on route change
        ├── <AnimatedRoutes>      # AnimatePresence-wrapped Suspense + Routes
        │   ├── <GuestOnlyRoute>  # /login, /signup
        │   │   └── <AuthLayout>
        │   │       ├── (decorative gradient panel)
        │   │       └── <LoginForm> / <SignupForm>
        │   │
        │   └── <ProtectedRoute>  # /dashboard, /documents, /chat
        │       └── <AppShell>
        │           ├── <Sidebar>             # collapsible / mobile drawer
        │           │   └── nav + user footer
        │           ├── <Header>              # title + theme toggle + mobile menu
        │           └── (page)
        │               ├── <DashboardPage>   # stats + quick actions + recent
        │               ├── <DocumentsPage>
        │               │   ├── <UploadZone>  # react-dropzone
        │               │   └── <DocumentList>
        │               │       └── <DocumentCard>[]
        │               └── <ChatPage>
        │                   └── <ChatContainer>
        │                       ├── <ConversationSidebar>
        │                       ├── <MessageList>
        │                       │   └── <MessageBubble>[]
        │                       │       └── <SourceCard>
        │                       └── <ChatInput>
        │
        └── <ToastViewport>      # Portaled, top-right stack
```

---

## 3. Data flow

### A. Authentication

```
LoginForm ──submit──► useAuthStore.login(creds)
                           │
                           ├── isLoading = true
                           ├── mockApi.mockLogin(creds)         (1s simulated)
                           │       └── returns AuthSession
                           ├── set { user, token, expiresAt, isAuthenticated: true }
                           └── persist to localStorage
ProtectedRoute reads `isAuthenticated` selector → renders or redirects.
```

### B. Document upload

```
UploadZone (react-dropzone) ──onDrop──► useDocumentStore.upload(file)
        │                                      │
        │                                      ├── validate (type, size)
        │                                      ├── insert placeholder { status: 'uploading', progress: 0 }
        │                                      ├── mockApi.mockUploadDocument
        │                                      │       ├─ progress 0..100% (2s)
        │                                      │       ├─ status = 'processing' (2-3s)
        │                                      │       └─ return final Document
        │                                      └── replace placeholder with final
DocumentCard re-renders status badge + progress bar reactively from the store.
```

### C. Chat streaming

```
ChatInput.onSubmit("question") ──► useChatStore.sendMessage(text)
        │                                   │
        │                                   ├── ensure activeConversation
        │                                   ├── append { role: 'user' } message
        │                                   ├── append { role: 'assistant', isStreaming: true } placeholder
        │                                   ├── mockApi.mockStreamChat({ question, documents, onEvent })
        │                                   │       │
        │                                   │       ├── 450ms "thinking" pause
        │                                   │       ├── for each chunk:  onEvent({ delta })
        │                                   │       │       └── store appends to assistant message
        │                                   │       │           (MessageBubble re-renders incrementally)
        │                                   │       ├── onEvent({ sources })
        │                                   │       └── onEvent({ done: true })
        │                                   └── isGenerating = false
MessageList auto-scrolls when user is near the bottom.
```

---

## 4. State management strategy

Three concerns, three slices:

| Slice | What it owns | Persisted? |
|-------|--------------|------------|
| `authStore` | `user`, `token`, `expiresAt`, `isAuthenticated`, `isLoading`, `error` | ✅ (only user/token/expiresAt) |
| `documentStore` | `documents[]`, upload helpers | ✅ (only `ready` documents — in-flight uploads are dropped on refresh) |
| `chatStore` | `conversations[]`, `activeConversationId`, `isGenerating`, abort controller ref | ✅ (with `isStreaming` cleared) |
| `uiStore` | `theme`, `sidebarOpen`, `toasts[]` | ✅ (theme + sidebar only — toasts are ephemeral) |

**Selector discipline** — components subscribe to the **smallest** slice they need (e.g. `useChatStore(s => s.isGenerating)`) so we don't re-render the chat list every time a stat counter ticks.

---

## 5. API integration strategy

The backend doesn't exist yet. We unblock the frontend with a **mock API** that **mimics the eventual real one**:

- **`src/services/apiClient.ts`** — thin `fetch` wrapper. Reads the `Bearer` token from the persisted auth slice. Throws typed `HttpError`. Already production-ready.
- **`src/services/mockApi.ts`** — drop-in mocks: `mockLogin`, `mockSignup`, `mockUploadDocument`, `mockStreamChat`, plus seed documents.

**The integration plan:**

1. Stand up the real backend with the same shapes (see `src/types/index.ts`).
2. Edit only `src/services/mockApi.ts` — replace each function body with `apiClient.post(...)` calls.
3. Set `VITE_USE_MOCK_API=false` in `.env.local`.

No store, page, or component touches `mockApi` directly except via these named exports — so the blast radius of the swap is minimal.

### Streaming contract

Mock streaming uses an `onEvent: (event: StreamEvent) => void` callback. The same shape works for SSE (`EventSource`) and `fetch` + `ReadableStream`. The store doesn't care which transport delivers the events.

---

## 6. Folder structure (rationale)

- **Co-locate per domain** (`/components/chat`, `/components/documents`) — easier to find related code than splitting by type (containers/presentational).
- **Index barrel files** (`/components/ui/index.ts`) — clean imports (`import { Button, Card } from '@/components/ui'`) without polluting bundle (Vite tree-shakes them).
- **Single `types/` folder** — every interface in one place is a hard rule and avoids circular type imports.
- **`/utils` is for pure functions only** — no React, no hooks. Hooks live in `/hooks`.

---

## 7. Performance posture

- **Code splitting** — pages are `React.lazy`, vendor / animation / forms / markdown chunked manually in `vite.config.ts`.
- **Selectors** — Zustand selectors prevent unnecessary re-renders.
- **Debounced search** — `useDebounce` (300ms) on document search.
- **Memoized message bubbles** — `MessageBubble` is wrapped in `memo`.
- **Auto-scroll throttling** — only scrolls when the user is within 200px of the bottom.

---

## 8. Accessibility checklist

- Visible focus rings on all interactive elements.
- ARIA labels on icon-only buttons.
- `role="dialog" aria-modal="true"` + Escape key on Modal.
- Live region (`role="alert"`) for form errors and toasts.
- `prefers-reduced-motion` honored globally in `global.css`.
- Color contrast: WCAG-AA in both themes.
