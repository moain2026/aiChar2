import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedQuestions } from './SuggestedQuestions';
import { useChatStore } from '@/stores/chatStore';
import { formatDateLabel } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { Message } from '@/types';

interface MessageListProps {
  onSuggestionSelect: (text: string) => void;
}

interface MessageGroup {
  label: string;
  messages: Message[];
}

function groupByDate(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const msg of messages) {
    const label = formatDateLabel(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }
  }
  return groups;
}

export function MessageList({ onSuggestionSelect }: MessageListProps): JSX.Element {
  const conversation = useChatStore((s) => s.getActiveConversation());
  const isGenerating = useChatStore((s) => s.isGenerating);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messages = conversation?.messages ?? [];
  const lastMessage = messages[messages.length - 1];
  // Show "thinking" state only for an empty assistant message that's streaming
  const showThinking =
    isGenerating &&
    lastMessage?.role === 'assistant' &&
    lastMessage.content.length === 0;

  // Auto-scroll on new content unless user has scrolled up.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 200) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, lastMessage?.content]);

  function handleScroll(): void {
    const container = containerRef.current;
    if (!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distance > 320);
  }

  function scrollToBottom(): void {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow">
            <Sparkles className="h-6 w-6 text-white" strokeWidth={2.2} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">How can I help today?</h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
            Ask anything about your uploaded documents — I&apos;ll give you a precise
            answer with the original source.
          </p>
        </motion.div>
        <SuggestedQuestions onSelect={onSuggestionSelect} />
      </div>
    );
  }

  const groups = groupByDate(messages);

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto overscroll-contain px-3 md:px-8 py-4 md:py-6"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {groups.map((group, gi) => (
            <Fragment key={`${group.label}-${gi}`}>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-5">
                {group.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            </Fragment>
          ))}

          {showThinking && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-glow">
                <Sparkles className="h-4 w-4" strokeWidth={2.4} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3.5 shadow-card">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            type="button"
            aria-label="Scroll to latest"
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={cn(
              'absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full',
              'bg-card border border-border shadow-lg text-foreground hover:bg-muted',
            )}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
