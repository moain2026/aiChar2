# Decision log

Why each non-obvious technical choice was made.

---

## State management — Zustand over Redux Toolkit / Context

- **Bundle size** — Zustand is ~1.2 kB gzipped. RTK + react-redux is ~12 kB+.
- **Boilerplate** — no actions/reducers/slices indirection; the store IS the API.
- **Selectors** — first-class, prevents re-renders without `useSelector` + `shallowEqual` ceremony.
- **Persistence** — `persist` middleware ships with the library; `partialize` lets us cherry-pick which fields survive a refresh (e.g. don't persist `isStreaming: true`).
- **Why not Context?** — chat streaming updates the assistant message many times per second. Context would re-render every consumer; Zustand selectors only re-render the bubble itself.

---

## Theme system — CSS variables over Tailwind dark variants alone

- The Tailwind dark variant (`dark:bg-gray-900`) requires writing both classes everywhere. Maintaining contrast pairs is error-prone.
- We instead define semantic tokens (`--color-background`, `--color-foreground`, `--color-card`, `--color-border`, etc.) on `:root` and override them under `.dark`. Tailwind's `colors.background = 'rgb(var(--color-background) / <alpha-value>)'` makes utility classes like `bg-background`, `text-foreground` resolve to those variables.
- Result: a single source of truth per token, and any component using semantic classes automatically supports both themes.

---

## Forms — React Hook Form + Zod (not Formik / Yup)

- **Performance** — RHF is uncontrolled by default; minimal re-renders. Formik is controlled, struggles on large/long forms.
- **Zod over Yup** — Zod's TypeScript inference (`z.infer<typeof schema>`) gives us types for free, with no separate type definitions to drift out of sync.
- **Reusable on the backend** — when the real API arrives, the same Zod schemas can validate request bodies server-side.

---

## Animation — Framer Motion (not just CSS)

- For static effects (hover, transitions) Tailwind utilities are enough.
- For **layout** animations (sidebar collapse, conversation list reorder, modal mount/unmount with proper exit), Framer Motion's `<AnimatePresence>` and `layoutId` are essentially required and would be painful to hand-roll.
- We don't use it gratuitously — `prefers-reduced-motion: reduce` short-circuits everything.

---

## Markdown — react-markdown (not markdown-it / Showdown)

- **Safe by default** — no raw HTML rendering unless explicitly enabled.
- **Pluggable** — `remark-gfm` adds tables/checklists/strikethrough.
- **React-native** — outputs React elements, so we can override `<code>`, `<a>`, etc. cleanly without `dangerouslySetInnerHTML`.

---

## File upload — react-dropzone (not custom)

- Handles every edge case we'd otherwise reinvent: drag enter/leave counter (browser quirk), file type filtering by both MIME and extension, native input keyboard activation, accessibility focus states.
- The library is small, maintained, and used by hundreds of production apps.

---

## Routing — React Router 7 (not TanStack Router)

- TanStack Router has nicer types but requires a build step / file-based routing setup that's heavier than this project needs.
- React Router 7's `BrowserRouter` + `<Routes>` + `React.lazy` covers everything we need today: nested layouts via `<AppShell>` wrapping pages, lazy-loaded pages, dynamic params (`/chat/:conversationId`).

---

## Folder structure — feature-folders over type-folders

- `src/components/chat/*` keeps `MessageBubble`, `MessageList`, `ChatInput`, etc. side-by-side.
- Alternative — `src/containers/`, `src/presentational/` — separates files that are read together and forces unnecessary jumps.
- Single `src/types/index.ts` is a deliberate choice: cross-domain types (e.g. `Source` is used by chat AND documents) avoid circular type imports.

---

## Streaming contract — `onEvent` callbacks (not `AsyncIterator`)

- Both SSE (`EventSource`) and `fetch` + `ReadableStream` map cleanly to a callback-based API.
- An `AsyncIterator` would force every consumer to write a `for await` loop and handle abort signals manually.
- The current shape — `onEvent: (event: { delta?, sources?, done? }) => void` — is what an SSE handler naturally produces.

---

## Mock API — module of named functions (not service class)

- Easier to **partially** swap out (e.g. wire up real auth first, keep mock chat).
- Easier to tree-shake — unused mock helpers are removed from the production bundle.
- A class would force a single instantiation site and discourage piecemeal migration.

---

## Persisted state — partialize with care

- We persist `auth.user/token/expiresAt` but **not** `isLoading` / `error` (always start fresh).
- We persist `documents` filtered to `status === 'ready'` only — in-flight uploads can't survive a refresh anyway.
- We persist `conversations` but always coerce `isStreaming: false` so a refreshed conversation never looks frozen.
