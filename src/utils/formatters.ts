import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import type { FileType } from '@/types';

/** Format bytes into a human-readable string (e.g. 2.4 MB). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Format a date to a relative string ("2 hours ago"). Accepts string or Date. */
export function formatRelativeTime(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Format a date as a friendly label for chat group headers. */
export function formatDateLabel(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

/** Format a clock time (e.g. 14:35). */
export function formatTime(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return format(date, 'HH:mm');
}

/** Truncate a string with ellipsis. */
export function truncate(text: string, max = 30): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/** Generate initials from a full name (max 2 chars). */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Map a file MIME type / extension to our internal FileType. Returns null if unsupported. */
export function detectFileType(file: File): FileType | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'docx';
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) return 'xlsx';
  if (name.endsWith('.txt') || name.endsWith('.md')) return 'txt';
  return null;
}

/** Tailwind color classes per file type for icons / badges. */
export const FILE_TYPE_STYLES: Record<
  FileType,
  { bg: string; text: string; ring: string; label: string }
> = {
  pdf: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/20',
    label: 'PDF',
  },
  docx: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    label: 'DOCX',
  },
  xlsx: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    label: 'XLSX',
  },
  txt: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    ring: 'ring-slate-500/20',
    label: 'TXT',
  },
};
