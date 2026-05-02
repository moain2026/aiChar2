import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ConversationSidebar } from './ConversationSidebar';
import { MessageList } from './MessageList';
import { ChatInput, type ChatInputHandle } from './ChatInput';
import { useChatStore } from '@/stores/chatStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useToast } from '@/hooks/useToast';

export function ChatContainer(): JSX.Element {
  const params = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const toast = useToast();
  const inputRef = useRef<ChatInputHandle>(null);

  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const createConversation = useChatStore((s) => s.createConversation);
  const setActive = useChatStore((s) => s.setActiveConversation);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const ensureSeed = useDocumentStore((s) => s.ensureSeed);

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    ensureSeed();
  }, [ensureSeed]);

  // Sync route param <-> active conversation
  useEffect(() => {
    if (params.conversationId) {
      const exists = conversations.some((c) => c.id === params.conversationId);
      if (exists && params.conversationId !== activeId) {
        setActive(params.conversationId);
      } else if (!exists) {
        navigate('/chat', { replace: true });
      }
    } else if (activeId) {
      // Optional: keep URL clean — no need to push when no param.
    }
  }, [params.conversationId, conversations, activeId, setActive, navigate]);

  // Keyboard shortcut — Cmd/Ctrl+N for new chat
  useEffect(() => {
    function handler(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        const id = createConversation();
        navigate(`/chat`);
        if (isMobile) setDrawerOpen(false);
        // Refocus input
        requestAnimationFrame(() => inputRef.current?.focus());
        return void id;
      }
      if (event.key === 'Escape' && isMobile && drawerOpen) {
        setDrawerOpen(false);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [createConversation, navigate, isMobile, drawerOpen]);

  const handleSubmit = useCallback(
    async (text: string) => {
      // Ensure conversation exists before sending
      if (!activeId) createConversation();
      try {
        await sendMessage(text);
      } catch (err) {
        toast.error({
          title: 'Failed to send',
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    },
    [activeId, createConversation, sendMessage, toast],
  );

  const handleSuggestion = useCallback(
    (text: string) => {
      inputRef.current?.setValue(text);
    },
    [],
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <ConversationSidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isMobile={isMobile}
      />
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {isMobile && (
          <div className="md:hidden flex items-center h-12 px-3 border-b border-border bg-background/80 backdrop-blur shrink-0">
            <button
              type="button"
              aria-label="Open conversations"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="ml-2 text-sm font-medium truncate">
              {conversations.find((c) => c.id === activeId)?.title ?? 'New chat'}
            </p>
          </div>
        )}
        <MessageList onSuggestionSelect={handleSuggestion} />
        <ChatInput ref={inputRef} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
