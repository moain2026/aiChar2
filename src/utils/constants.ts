/**
 * Application-wide constants.
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'AI Document Chat';

export const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 10);
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'text/plain': ['.txt', '.md'],
};

export const STORAGE_KEYS = {
  theme: 'theme',
  authSession: 'aidc.auth.session',
  documents: 'aidc.documents',
  conversations: 'aidc.conversations',
} as const;

export const ROUTES = {
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  chat: '/chat',
  documents: '/documents',
} as const;

export const SUGGESTED_QUESTIONS: Array<{ icon: string; text: string }> = [
  { icon: 'sparkles', text: 'What are the key points in my documents?' },
  { icon: 'list', text: 'Summarize the main topics across all files' },
  { icon: 'shield', text: 'What policies are mentioned?' },
  { icon: 'search', text: 'Find specific information about leave and salary' },
];
