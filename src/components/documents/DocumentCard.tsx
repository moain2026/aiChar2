import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  Hash,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FileTypeIcon } from './FileTypeIcon';
import { useDocumentStore } from '@/stores/documentStore';
import { useToast } from '@/hooks/useToast';
import { formatFileSize, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
}

function StatusBadge({ doc }: { doc: Document }): JSX.Element {
  switch (doc.status) {
    case 'uploading':
      return (
        <Badge variant="info" dot pulse>
          Uploading
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="warning" size="md">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case 'ready':
      return (
        <Badge variant="success" size="md">
          <CheckCircle2 className="h-3 w-3" />
          Ready
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="error" size="md">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    default:
      return <Badge variant="neutral">Unknown</Badge>;
  }
}

export function DocumentCard({ document }: DocumentCardProps): JSX.Element {
  const remove = useDocumentStore((s) => s.remove);
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete(): void {
    remove(document.id);
    setConfirmOpen(false);
    toast.success({
      title: 'Document removed',
      description: `${document.name} has been deleted.`,
    });
  }

  return (
    <>
      <Card
        variant="solid"
        padding="none"
        interactive
        className={cn(
          'group relative overflow-hidden',
          document.status === 'error' && 'border-danger-500/30',
        )}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <FileTypeIcon fileType={document.fileType} size="md" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate" title={document.name}>
                {document.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(document.fileSize)}
              </p>
            </div>
            <button
              type="button"
              aria-label="Delete document"
              onClick={() => setConfirmOpen(true)}
              className="md:opacity-0 md:group-hover:opacity-100 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger-500/10 hover:text-danger-600 active:bg-danger-500/20 transition-all duration-200 focus-visible:opacity-100 -mr-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <StatusBadge doc={document} />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {document.status === 'ready' && (
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {document.chunkCount} chunks
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(document.uploadedAt)}
              </span>
            </div>
          </div>

          {document.status === 'uploading' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <ProgressBar value={document.uploadProgress ?? 0} showLabel />
            </motion.div>
          )}

          {document.status === 'error' && document.errorMessage && (
            <p className="mt-3 text-xs text-danger-600 dark:text-danger-300">
              {document.errorMessage}
            </p>
          )}
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete document?"
        description={`This will permanently remove "${document.name}". This action cannot be undone.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      />
    </>
  );
}
