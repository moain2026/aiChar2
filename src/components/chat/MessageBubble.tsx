import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import { SourceCard } from './SourceCard';
import { useAuthStore } from '@/stores/authStore';
import { formatTime } from '@/utils/formatters';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

function MessageBubbleImpl({ message }: MessageBubbleProps): JSX.Element {
  const userName = useAuthStore((s) => s.user?.name ?? 'You');
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard might be unavailable */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('group flex gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar name={userName} size="md" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-glow">
          <Sparkles className="h-4 w-4" strokeWidth={2.4} />
        </div>
      )}

      {/* Body */}
      <div className={cn('max-w-[85%] sm:max-w-[78%] min-w-0', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'relative inline-block rounded-2xl px-4 py-3 shadow-card',
            isUser
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
              : 'bg-card border border-border text-foreground rounded-tl-sm',
          )}
        >
          {message.error ? (
            <div className="flex items-start gap-2 text-sm text-danger-600 dark:text-danger-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{message.error}</span>
            </div>
          ) : isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <div
              className={cn(
                'prose-chat',
                message.isStreaming && message.content.length > 0 && 'streaming-cursor',
                message.content.length === 0 && 'min-h-[1.25rem]',
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources & timestamp & actions */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCard sources={message.sources} />
        )}

        <div
          className={cn(
            'mt-1.5 flex items-center gap-2 text-2xs text-muted-foreground',
            isUser && 'flex-row-reverse',
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {!isUser && !message.isStreaming && message.content.length > 0 && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy message'}
              className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-muted hover:text-foreground transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export const MessageBubble = memo(MessageBubbleImpl);
