import { useEffect, type RefObject } from 'react';

/** Fire `handler` when a click/touch happens outside the given element. */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  active = true,
): void {
  useEffect(() => {
    if (!active) return;
    function listener(event: MouseEvent | TouchEvent): void {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handler(event);
    }
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, active]);
}
