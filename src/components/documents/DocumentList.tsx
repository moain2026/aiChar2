import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ArrowDownAZ, FileText, ChevronDown } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDocumentStore } from '@/stores/documentStore';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

type SortOption = 'newest' | 'oldest' | 'name-asc';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'name-asc': 'Name (A → Z)',
};

interface DocumentListProps {
  isLoading?: boolean;
  onUploadCta?: () => void;
}

export function DocumentList({ isLoading, onUploadCta }: DocumentListProps): JSX.Element {
  const documents = useDocumentStore((s) => s.documents);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 200);

  const visible = useMemo(() => {
    const filtered = debouncedQuery.trim()
      ? documents.filter((d) =>
          d.name.toLowerCase().includes(debouncedQuery.trim().toLowerCase()),
        )
      : documents;

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      const ta = new Date(a.uploadedAt).getTime();
      const tb = new Date(b.uploadedAt).getTime();
      return sort === 'newest' ? tb - ta : ta - tb;
    });

    return sorted;
  }, [documents, debouncedQuery, sort]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search documents…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          containerClassName="flex-1"
        />
        <div className="relative shrink-0">
          <Button
            variant="secondary"
            leftIcon={<ArrowDownAZ className="h-4 w-4" />}
            rightIcon={
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  sortMenuOpen && 'rotate-180',
                )}
              />
            }
            onClick={() => setSortMenuOpen((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={sortMenuOpen}
          >
            <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
            <span className="sm:hidden">Sort</span>
          </Button>
          <AnimatePresence>
            {sortMenuOpen && (
              <>
                {/* Click-outside backdrop (mobile-friendly) */}
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setSortMenuOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <motion.ul
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={sort === opt}
                        onClick={() => {
                          setSort(opt);
                          setSortMenuOpen(false);
                        }}
                        className={cn(
                          'block w-full px-3 py-2.5 text-left text-sm hover:bg-muted active:bg-muted/80 min-h-[44px]',
                          sort === opt && 'text-primary-600 dark:text-primary-400 font-medium bg-primary-500/5',
                        )}
                      >
                        {SORT_LABELS[opt]}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {visible.length === 0 ? (
        documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="No documents yet"
            description="Upload your first document to start asking questions and getting source-grounded answers."
            action={
              onUploadCta && (
                <Button onClick={onUploadCta}>Upload your first document</Button>
              )
            }
          />
        ) : (
          <EmptyState
            icon={<Search className="h-7 w-7" />}
            title="No matches found"
            description={`We couldn't find a document matching "${debouncedQuery}".`}
          />
        )
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <AnimatePresence initial={false}>
            {visible.map((doc, idx) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(idx * 0.04, 0.3),
                  ease: 'easeOut',
                }}
              >
                <DocumentCard document={doc} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
