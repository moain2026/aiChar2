import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FileTypeIcon } from '@/components/documents/FileTypeIcon';
import type { Source } from '@/types';

interface SourceCardProps {
  sources: Source[];
}

/**
 * Collapsible "Sources" panel rendered below an AI message.
 */
export function SourceCard({ sources }: SourceCardProps): JSX.Element | null {
  const [expanded, setExpanded] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 overflow-hidden rounded-xl border border-border bg-card/60"
    >
      <button
        type="button"
        onClick={() => setExpanded((s) => !s)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors"
      >
        <span className="inline-flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary-500" />
          <span className="font-medium">
            {sources.length} {sources.length === 1 ? 'source' : 'sources'}
          </span>
          <span className="text-xs text-muted-foreground">used to answer</span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-border"
          >
            {sources.map((source, idx) => (
              <li
                key={`${source.documentId}-${idx}`}
                className={cn(
                  'flex gap-3 px-3.5 py-3',
                  idx > 0 && 'border-t border-border',
                )}
              >
                <FileTypeIcon fileType={source.fileType} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className="text-sm font-medium truncate"
                      title={source.documentName}
                    >
                      {source.documentName}
                    </p>
                    {source.page && (
                      <span className="shrink-0 text-2xs text-muted-foreground">
                        Page {source.page}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {source.snippet}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                        style={{ width: `${Math.round(source.relevance * 100)}%` }}
                      />
                    </div>
                    <span className="text-2xs text-muted-foreground tabular-nums">
                      {Math.round(source.relevance * 100)}% match
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
