import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/stores/chatStore';

const MAX_LENGTH = 4000;

export interface ChatInputHandle {
  focus: () => void;
  setValue: (value: string) => void;
}

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput(
  { onSubmit, disabled = false, placeholder = 'Ask a question about your documents…' },
  ref,
) {
  const [value, setValue] = useState('');
  const isGenerating = useChatStore((s) => s.isGenerating);
  const stop = useChatStore((s) => s.stopGeneration);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    setValue: (next) => {
      setValue(next);
      requestAnimationFrame(() => textareaRef.current?.focus());
    },
  }));

  // Auto-grow the textarea (max ~5 lines).
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, 156);
    el.style.height = `${next}px`;
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function send(): void {
    const trimmed = value.trim();
    if (!trimmed || isGenerating || disabled) return;
    onSubmit(trimmed);
    setValue('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div
      className="px-3 md:px-8 pt-2 bg-gradient-to-t from-background via-background to-transparent"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)',
      }}
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          layout
          className={cn(
            'flex items-end gap-2 rounded-2xl border bg-card shadow-soft px-3 py-2.5',
            'transition-colors',
            'border-border focus-within:border-primary-500/60 focus-within:ring-2 focus-within:ring-primary-500/20',
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            // iOS-specific attributes for better mobile UX
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck={true}
            enterKeyHint="send"
            className={cn(
              'flex-1 resize-none bg-transparent border-0 outline-none',
              // Use 16px on mobile to prevent iOS zoom-on-focus, 14px on desktop.
              'text-base md:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70',
              'min-h-[24px] max-h-[156px] py-1.5',
              'no-scrollbar',
            )}
          />
          {isGenerating ? (
            <motion.button
              key="stop"
              type="button"
              onClick={stop}
              whileTap={{ scale: 0.95 }}
              className="inline-flex h-10 w-10 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-danger-500 text-white shadow-md hover:bg-danger-600 active:bg-danger-700"
              aria-label="Stop generating"
            >
              <Square className="h-3.5 w-3.5" fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              type="button"
              onClick={send}
              disabled={!value.trim() || disabled}
              whileTap={value.trim() ? { scale: 0.95 } : undefined}
              className={cn(
                'inline-flex h-10 w-10 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg transition-all',
                value.trim()
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
            </motion.button>
          )}
        </motion.div>
        <div className="mt-1.5 hidden md:flex items-center justify-between text-2xs text-muted-foreground px-1">
          <span>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>{' '}
            to send ·{' '}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Shift+Enter
            </kbd>{' '}
            for new line
          </span>
          <span className={cn('tabular-nums', value.length > MAX_LENGTH * 0.9 && 'text-warning-600')}>
            {value.length}/{MAX_LENGTH}
          </span>
        </div>
        {/* Mobile-only counter */}
        <div className="md:hidden mt-1 flex justify-end text-2xs text-muted-foreground px-1">
          <span className={cn('tabular-nums', value.length > MAX_LENGTH * 0.9 && 'text-warning-600')}>
            {value.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
});
