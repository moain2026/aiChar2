import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/types';

const ICONS: Record<ToastVariant, JSX.Element> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
};

const TONES: Record<ToastVariant, string> = {
  success:
    'border-success-500/30 bg-success-500/10 text-success-700 dark:text-success-100',
  error:
    'border-danger-500/30 bg-danger-500/10 text-danger-700 dark:text-danger-100',
  info: 'border-info-500/30 bg-info-500/10 text-info-700 dark:text-info-100',
  warning:
    'border-warning-500/30 bg-warning-500/10 text-warning-700 dark:text-warning-100',
};

const ICON_TONES: Record<ToastVariant, string> = {
  success: 'text-success-600 dark:text-success-300',
  error: 'text-danger-600 dark:text-danger-300',
  info: 'text-info-600 dark:text-info-300',
  warning: 'text-warning-600 dark:text-warning-300',
};

function ToastItem({ toast }: { toast: ToastType }): JSX.Element {
  const dismiss = useUIStore((s) => s.dismissToast);
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), duration);
    return () => window.clearTimeout(id);
  }, [toast.id, duration, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start gap-3 w-full sm:w-80 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md glass',
        TONES[toast.type],
      )}
    >
      <span className={cn('mt-0.5 shrink-0', ICON_TONES[toast.type])}>{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground/80 hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10 transition-colors -mr-1.5 -mt-1"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/**
 * Global toast viewport. Mount once near the root of the app.
 */
export function ToastViewport(): JSX.Element | null {
  const toasts = useUIStore((s) => s.toasts);
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 sm:inset-x-auto sm:right-4 z-[100] flex flex-col gap-2 max-h-screen overflow-hidden px-3 sm:px-0"
      style={{
        top: 'max(env(safe-area-inset-top, 0px), 1rem)',
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
