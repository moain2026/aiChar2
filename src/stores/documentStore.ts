import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Document } from '@/types';
import { getSeedDocuments, mockUploadDocument } from '@/services/mockApi';
import { detectFileType } from '@/utils/formatters';
import { MAX_UPLOAD_BYTES } from '@/utils/constants';
import { STORAGE_KEYS } from '@/utils/constants';

interface DocumentState {
  documents: Document[];
  /** Map of documentId -> AbortController for in-flight uploads. */
  _seeded: boolean;

  upload: (file: File) => Promise<Document | null>;
  remove: (id: string) => void;
  clear: () => void;
  /** Seed example documents on first load, only if user has none. */
  ensureSeed: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      _seeded: false,

      ensureSeed() {
        if (get()._seeded) return;
        set({ _seeded: true });
        if (get().documents.length === 0) {
          set({ documents: getSeedDocuments() });
        }
      },

      async upload(file) {
        // Validate first — fail loudly so callers can show a toast.
        const fileType = detectFileType(file);
        if (!fileType) {
          throw new Error('Unsupported file type');
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error('File exceeds maximum size');
        }

        // Insert a placeholder document so the UI can show progress.
        const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const placeholder: Document = {
          id: tempId,
          name: file.name,
          fileType,
          fileSize: file.size,
          status: 'uploading',
          uploadedAt: new Date().toISOString(),
          chunkCount: 0,
          uploadProgress: 0,
        };
        set({ documents: [placeholder, ...get().documents] });

        const updateTemp = (patch: Partial<Document>) => {
          set({
            documents: get().documents.map((d) => (d.id === tempId ? { ...d, ...patch } : d)),
          });
        };

        try {
          const final = await mockUploadDocument(file, {
            onProgress: (progress) => updateTemp({ uploadProgress: progress }),
            onStatus: (status) => updateTemp({ status }),
          });
          // Swap placeholder for final result, keep position.
          set({
            documents: get().documents.map((d) => (d.id === tempId ? final : d)),
          });
          return final;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          updateTemp({ status: 'error', errorMessage: message });
          throw err;
        }
      },

      remove(id) {
        set({ documents: get().documents.filter((d) => d.id !== id) });
      },

      clear() {
        set({ documents: [] });
      },
    }),
    {
      name: STORAGE_KEYS.documents,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist only "ready" documents — in-flight uploads can't survive a refresh.
        documents: state.documents.filter((d) => d.status === 'ready'),
        _seeded: state._seeded,
      }),
    },
  ),
);
