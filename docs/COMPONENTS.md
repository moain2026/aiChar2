# Components API

Quick reference for every component exported from `@/components`.

> Convention: every component supports `className` for last-mile customization, every interactive component is keyboard-accessible, and every prop interface is exported.

---

## UI primitives — `@/components/ui`

### `<Button>`
Primary CTA element with motion press feedback.

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'outline'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg' \| 'icon'` | `'md'` |
| `isLoading` | `boolean` | `false` |
| `leftIcon` / `rightIcon` | `ReactNode` | — |
| `fullWidth` | `boolean` | `false` |

### `<Input>`
Form input with label, helper, error states, and icon slots.

| Prop | Type |
|------|------|
| `label` | `string` |
| `helper` / `error` | `string` |
| `variant` | `'default' \| 'error' \| 'success'` |
| `leftIcon` / `rightIcon` | `ReactNode` |

### `<Card>`
Surface wrapper. Variants: `solid`, `glass`, `outline`, `gradient`. Padding presets: `none`, `sm`, `md`, `lg`. `interactive` adds hover lift.

Companion exports: `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`.

### `<Modal>`
Accessible portal-rendered dialog with backdrop blur, ESC-to-close, focus management.

| Prop | Type |
|------|------|
| `open` | `boolean` |
| `onClose` | `() => void` |
| `title` / `description` | `string` |
| `size` | `'sm' \| 'md' \| 'lg'` |
| `footer` | `ReactNode` |
| `preventBackdropClose` | `boolean` |

### `<ToastViewport>` + `useToast()`
Mount `<ToastViewport />` once near the root. Then anywhere:

```tsx
const toast = useToast();
toast.success({ title: 'Saved', description: 'Your changes are live.' });
```

Variants: `success`, `error`, `info`, `warning`. Auto-dismiss after 5s.

### `<Badge>`
Inline status pill. Variants: `success`, `warning`, `error`, `info`, `neutral`, `primary`. Optional `dot` and `pulse` props.

### `<Spinner>`
Sizes: `xs`, `sm`, `md`, `lg`. Inherits `currentColor`.

### `<Avatar>`
Image with initials fallback. Sizes: `sm`, `md`, `lg`, `xl`. Optional `showStatus` dot.

### `<Skeleton>` / `<SkeletonText>`
Shimmer placeholder. Variants: `text`, `circle`, `card`, `rectangle`.

### `<ProgressBar>`
Animated 0-100 progress. Optional `showLabel`.

### `<EmptyState>`
Empty list illustration. Props: `icon`, `title`, `description`, `action`.

---

## Layout — `@/components/layout`

### `<AppShell>`
Top-level frame for authenticated pages: `<Sidebar>` + `<Header>` + content.

### `<Sidebar>`
Collapsible on desktop, slide-in drawer on mobile. Reads from `uiStore.sidebarOpen`.

### `<Header>`
Page title + theme toggle + mobile menu trigger.

### `<PageWrapper>`
Consistent page padding + entrance animation. Props: `maxWidth` (`sm`..`2xl`/`full`), `padded`.

---

## Auth — `@/components/auth`

- `<AuthLayout>` — two-column brand + form layout for `/login` and `/signup`.
- `<LoginForm>` — RHF + Zod, demo credentials hint, password show/hide.
- `<SignupForm>` — RHF + Zod, password strength meter, confirm password.
- `<ProtectedRoute>` — redirects unauthenticated users to `/login`.
- `<GuestOnlyRoute>` — redirects authenticated users to `/dashboard`.

---

## Documents — `@/components/documents`

### `<UploadZone>`
Drag-and-drop dropzone. Props: `compact` (collapsed single-row variant). Validates type + size, surfaces toasts.

### `<DocumentCard>`
Per-document tile with file-type icon, status badge, progress bar (when uploading), delete button + confirmation modal.

### `<DocumentList>`
Search, sort, grid layout, animated mount/exit, empty state.

### `<FileTypeIcon>`
Colored icon badge for `pdf | docx | xlsx | txt`.

---

## Chat — `@/components/chat`

### `<ChatContainer>`
Top-level chat layout. Manages route ↔ active-conversation sync, keyboard shortcuts (`Cmd/Ctrl+N`).

### `<ConversationSidebar>`
List of conversations + new-chat button + per-item delete (with confirmation).

### `<MessageList>`
Renders messages grouped by date label (Today / Yesterday / date), shows `<TypingIndicator>` while waiting, "scroll to bottom" floating button.

### `<MessageBubble>` (memoized)
- User: right-aligned, gradient primary background.
- Assistant: left-aligned, markdown rendered (GFM), streaming cursor while generating, copy button, source citations.

### `<SourceCard>`
Collapsible "Sources" panel below assistant messages. Shows file icon, name, snippet, relevance bar, page hint.

### `<ChatInput>` (forwardRef)
Auto-growing textarea, Enter-to-send (Shift+Enter for newline), char counter, send/stop button toggle when generating. `ref.current.setValue(text)` lets suggestions populate the field.

### `<TypingIndicator>`
Three bouncing dots — shown only when an assistant message has zero content yet.

### `<SuggestedQuestions>`
Empty-state grid of starter prompts.

---

## Dashboard — `@/components/dashboard`

### `<StatsCard>`
Stat tile with animated count-up. Props: `icon`, `label`, `value`, `helper`, `tone`, `delay`.

---

## Other

- **`<ErrorBoundary>`** — top-level React error boundary with friendly fallback page.
- **`<PageLoader>`** — full-screen loader used as the lazy-route Suspense fallback.

---

## Hooks — `@/hooks`

| Hook | Returns |
|------|---------|
| `useAuth()` | `{ user, isAuthenticated, isLoading, error, login, signup, logout, clearError }` |
| `useTheme()` | `{ theme, setTheme, toggleTheme, isDark }` |
| `useToast()` | `{ success, error, info, warning, show, dismiss }` |
| `useMediaQuery(q)` | `boolean`. Helpers: `useIsMobile`, `useIsTablet`, `useIsDesktop` |
| `useDebounce(value, ms)` | Debounced value |
| `useClickOutside(ref, fn, active?)` | `void` |
