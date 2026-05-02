import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronUp } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { UploadZone } from '@/components/documents/UploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { useDocumentStore } from '@/stores/documentStore';
import { cn } from '@/utils/cn';

export function DocumentsPage(): JSX.Element {
  const documents = useDocumentStore((s) => s.documents);
  const ensureSeed = useDocumentStore((s) => s.ensureSeed);
  const [uploadOpen, setUploadOpen] = useState<boolean>(documents.length === 0);

  useEffect(() => {
    ensureSeed();
  }, [ensureSeed]);

  return (
    <PageWrapper maxWidth="xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload, organize, and manage everything your AI can reference.
          </p>
        </div>
        <Button
          variant={uploadOpen ? 'secondary' : 'primary'}
          leftIcon={
            uploadOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />
          }
          onClick={() => setUploadOpen((s) => !s)}
        >
          {uploadOpen ? 'Hide upload' : 'Upload document'}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {uploadOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn('overflow-hidden')}
          >
            <UploadZone />
          </motion.div>
        )}
      </AnimatePresence>

      <DocumentList onUploadCta={() => setUploadOpen(true)} />
    </PageWrapper>
  );
}
