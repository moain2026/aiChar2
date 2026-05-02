import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted HTML before injecting it into the DOM.
 * For markdown, we still rely on `react-markdown` which never
 * renders raw HTML by default — but `sanitizeHtml` is here for
 * any place we might need it (sources, future plugins).
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: true } });
}
