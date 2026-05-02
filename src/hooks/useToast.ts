import { useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import type { ToastType } from '@/types';

interface ToastInput {
  title: string;
  description?: string;
  duration?: number;
}

interface UseToastReturn {
  success: (input: ToastInput) => string;
  error: (input: ToastInput) => string;
  info: (input: ToastInput) => string;
  warning: (input: ToastInput) => string;
  show: (input: ToastInput & { type?: ToastType }) => string;
  dismiss: (id: string) => void;
}

/** Hook to push notifications onto the global toast stack. */
export function useToast(): UseToastReturn {
  const push = useUIStore((s) => s.pushToast);
  const dismiss = useUIStore((s) => s.dismissToast);

  const success = useCallback((input: ToastInput) => push({ ...input, type: 'success' }), [push]);
  const error = useCallback((input: ToastInput) => push({ ...input, type: 'error' }), [push]);
  const info = useCallback((input: ToastInput) => push({ ...input, type: 'info' }), [push]);
  const warning = useCallback((input: ToastInput) => push({ ...input, type: 'warning' }), [push]);
  const show = useCallback(
    (input: ToastInput & { type?: ToastType }) =>
      push({ ...input, type: input.type ?? 'info' }),
    [push],
  );

  return { success, error, info, warning, show, dismiss };
}
