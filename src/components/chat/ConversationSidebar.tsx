import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useChatStore } from '@/stores/chatStore';
import { formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface ConversationSidebarProps {
  /** On mobile, this controls whether the drawer is visible. */
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function ConversationSidebar({
  open,
  onClose,
  isMobile,
}: ConversationSidebarProps): JSX.Element {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const createConversation = useChatStore((s) => s.createConversation);
  const setActive = useChatStore((s) => s.setActiveConversation);
  const deleteConv = useChatStore((s) => s.deleteConversation);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const sorted = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  function handleNew(): void {
    createConversation();
    if (isMobile) onClose();
  }

  function handleSelect(id: string): void {
    setActive(id);
    if (isMobile) onClose();
  }

  const content = (
    <>
      <div className="flex items-center justify-between h-14 px-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold tracking-tight">Conversations</h2>
        {isMobile && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex tap-target items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 -mr-1.5"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="p-3 shrink-0">
        <Button
          fullWidth
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleNew}
        >
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {sorted.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet. Start a new chat to begin.
          </p>
        ) : (
          <ul className="space-y-0.5">
            <AnimatePresence initial={false}>
              {sorted.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <motion.li
                    key={conv.id}
                    layout
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(conv.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelect(conv.id);
                        }
                      }}
                      className={cn(
                        'group relative w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors cursor-pointer',
                        'min-h-[44px]',
                        isActive ? 'bg-primary-500/10' : 'hover:bg-muted active:bg-muted/80',
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          'h-4 w-4 mt-0.5 shrink-0',
                          isActive ? 'text-primary-500' : 'text-muted-foreground',
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isActive && 'text-primary-700 dark:text-primary-200',
                          )}
                          title={conv.title}
                        >
                          {conv.title}
                        </p>
                        <p className="text-2xs text-muted-foreground truncate">
                          {formatRelativeTime(conv.updatedAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Delete conversation"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDelete(conv.id);
                        }}
                        className="md:opacity-0 md:group-hover:opacity-100 inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-danger-500/10 hover:text-danger-600 active:bg-danger-500/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed inset-y-0 left-0 z-50 w-[min(85vw,18rem)] glass-strong border-r border-border shadow-2xl flex flex-col safe-pt safe-pb safe-pl"
              >
                {content}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <DeleteConversationModal
          pendingId={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={(id) => {
            deleteConv(id);
            setPendingDelete(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-border bg-card/40">
        {content}
      </aside>
      <DeleteConversationModal
        pendingId={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={(id) => {
          deleteConv(id);
          setPendingDelete(null);
        }}
      />
    </>
  );
}

function DeleteConversationModal({
  pendingId,
  onClose,
  onConfirm,
}: {
  pendingId: string | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}): JSX.Element {
  return (
    <Modal
      open={pendingId !== null}
      onClose={onClose}
      title="Delete conversation?"
      description="The messages in this chat will be permanently removed."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => pendingId && onConfirm(pendingId)}
          >
            Delete
          </Button>
        </>
      }
    />
  );
}
