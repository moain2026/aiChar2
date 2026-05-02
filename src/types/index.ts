/**
 * Centralized type definitions for AI Document Chat.
 *
 * All shared interfaces and type aliases live here so the rest of
 * the codebase has a single source of truth.
 */

// ===========================================================================
// AUTH
// ===========================================================================
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

// ===========================================================================
// DOCUMENTS
// ===========================================================================
export type FileType = 'pdf' | 'docx' | 'xlsx' | 'txt';

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface Document {
  id: string;
  name: string;
  fileType: FileType;
  fileSize: number; // bytes
  status: DocumentStatus;
  uploadedAt: string; // ISO string
  chunkCount: number;
  uploadProgress?: number; // 0-100, only present while uploading
  errorMessage?: string;
}

// ===========================================================================
// CHAT
// ===========================================================================
export type MessageRole = 'user' | 'assistant';

export interface Source {
  documentId: string;
  documentName: string;
  fileType: FileType;
  snippet: string;
  /** 0..1 relevance score */
  relevance: number;
  page?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  createdAt: string;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ===========================================================================
// UI / TOAST
// ===========================================================================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export type Theme = 'light' | 'dark';

// ===========================================================================
// API
// ===========================================================================
export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Lightweight stream event used by the chat streaming bridge.
 * `delta` contains the next chunk of text. `done` signals the end.
 */
export interface StreamEvent {
  delta?: string;
  sources?: Source[];
  done?: boolean;
  error?: string;
}
