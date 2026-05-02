import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Conversation, Message, Source } from '@/types';
import { mockStreamChat } from '@/services/mockApi';
import { useDocumentStore } from './documentStore';
import { STORAGE_KEYS } from '@/utils/constants';
import { truncate } from '@/utils/formatters';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isGenerating: boolean;
  /** AbortController for the currently-streaming response, if any. */
  _abortRef: AbortController | null;

  createConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;

  getActiveConversation: () => Conversation | null;
}

const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

function buildConversation(): Conversation {
  const now = new Date().toISOString();
  return {
    id: `conv-${uuid()}`,
    title: 'New conversation',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isGenerating: false,
      _abortRef: null,

      createConversation() {
        const conv = buildConversation();
        set({
          conversations: [conv, ...get().conversations],
          activeConversationId: conv.id,
        });
        return conv.id;
      },

      setActiveConversation(id) {
        set({ activeConversationId: id });
      },

      deleteConversation(id) {
        const remaining = get().conversations.filter((c) => c.id !== id);
        const isActive = get().activeConversationId === id;
        set({
          conversations: remaining,
          activeConversationId: isActive ? (remaining[0]?.id ?? null) : get().activeConversationId,
        });
      },

      stopGeneration() {
        const ref = get()._abortRef;
        if (ref) {
          ref.abort();
          set({ _abortRef: null, isGenerating: false });
        }
      },

      async sendMessage(content) {
        const trimmed = content.trim();
        if (!trimmed || get().isGenerating) return;

        // Ensure we have an active conversation.
        let activeId = get().activeConversationId;
        if (!activeId) {
          activeId = get().createConversation();
        }

        const now = new Date().toISOString();
        const userMessage: Message = {
          id: `msg-${uuid()}`,
          role: 'user',
          content: trimmed,
          createdAt: now,
        };
        const assistantId = `msg-${uuid()}`;
        const assistantMessage: Message = {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
          isStreaming: true,
        };

        // Insert messages and (if first user message) update the title.
        set({
          conversations: get().conversations.map((c) => {
            if (c.id !== activeId) return c;
            const isFirst = c.messages.length === 0;
            return {
              ...c,
              title: isFirst ? truncate(trimmed, 32) : c.title,
              messages: [...c.messages, userMessage, assistantMessage],
              updatedAt: new Date().toISOString(),
            };
          }),
          isGenerating: true,
        });

        const controller = new AbortController();
        set({ _abortRef: controller });

        const patchAssistant = (patch: Partial<Message>) => {
          set({
            conversations: get().conversations.map((c) => {
              if (c.id !== activeId) return c;
              return {
                ...c,
                messages: c.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
                updatedAt: new Date().toISOString(),
              };
            }),
          });
        };

        try {
          const documents = useDocumentStore.getState().documents;
          let streamedContent = '';
          let streamedSources: Source[] | undefined;

          await mockStreamChat({
            question: trimmed,
            documents,
            signal: controller.signal,
            onEvent: (event) => {
              if (event.delta) {
                streamedContent += event.delta;
                patchAssistant({ content: streamedContent });
              }
              if (event.sources) {
                streamedSources = event.sources;
                patchAssistant({ sources: event.sources });
              }
              if (event.done) {
                patchAssistant({
                  content: streamedContent,
                  sources: streamedSources,
                  isStreaming: false,
                });
              }
            },
          });
        } catch (err) {
          if ((err as { name?: string })?.name === 'AbortError') {
            patchAssistant({
              isStreaming: false,
              content: get()
                .conversations.find((c) => c.id === activeId)
                ?.messages.find((m) => m.id === assistantId)?.content || '',
            });
          } else {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            patchAssistant({ isStreaming: false, error: message });
          }
        } finally {
          set({ isGenerating: false, _abortRef: null });
        }
      },

      getActiveConversation() {
        const { activeConversationId, conversations } = get();
        if (!activeConversationId) return null;
        return conversations.find((c) => c.id === activeConversationId) ?? null;
      },
    }),
    {
      name: STORAGE_KEYS.conversations,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations.map((c) => ({
          ...c,
          // Don't persist mid-stream messages
          messages: c.messages.map((m) => ({ ...m, isStreaming: false })),
        })),
        activeConversationId: state.activeConversationId,
      }),
    },
  ),
);
