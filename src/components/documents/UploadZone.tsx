import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { motion } from 'framer-motion';
import { CloudUpload, FileUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDocumentStore } from '@/stores/documentStore';
import { useToast } from '@/hooks/useToast';
import {
  ACCEPTED_FILE_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
} from '@/utils/constants';
import { formatFileSize } from '@/utils/formatters';

interface UploadZoneProps {
  className?: string;
  /** Compact (single-row) or expanded variant. */
  compact?: boolean;
}

export function UploadZone({ className, compact = false }: UploadZoneProps): JSX.Element {
  const upload = useDocumentStore((s) => s.upload);
  const toast = useToast();

  const onDrop = useCallback(
    async (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const first = rejections[0]!;
        const code = first.errors[0]?.code;
        const reason =
          code === 'file-too-large'
            ? `File is larger than ${MAX_UPLOAD_MB} MB`
            : code === 'file-invalid-type'
              ? 'Unsupported file type'
              : 'Some files could not be uploaded';
        toast.error({
          title: 'Upload failed',
          description: `${first.file.name}: ${reason}`,
        });
      }

      for (const file of accepted) {
        try {
          await upload(file);
          toast.success({
            title: 'Document processed',
            description: `${file.name} (${formatFileSize(file.size)}) is ready to chat with.`,
          });
        } catch (err) {
          toast.error({
            title: 'Upload failed',
            description: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    },
    [upload, toast],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_UPLOAD_BYTES,
    multiple: true,
    noClick: compact,
  });

  if (compact) {
    return (
      <div
        {...getRootProps({
          className: cn(
            'flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-4 py-3 transition-all',
            isDragActive && 'border-primary-500 bg-primary-500/5',
            isDragReject && 'border-danger-500 bg-danger-500/5',
            className,
          ),
        })}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-3 min-w-0">
          <FileUp className="h-4 w-4 text-primary-500 shrink-0" />
          <p className="text-sm text-muted-foreground truncate">
            Drop a file here or{' '}
            <button
              type="button"
              onClick={open}
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              browse
            </button>
          </p>
        </div>
        <p className="hidden sm:block text-xs text-muted-foreground">
          Max {MAX_UPLOAD_MB} MB
        </p>
      </div>
    );
  }

  return (
    <motion.div
      {...getRootProps({
        className: cn(
          'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-all duration-300',
          isDragActive
            ? 'border-primary-500 bg-primary-500/5 scale-[1.01]'
            : 'border-border hover:border-primary-500/60 hover:bg-muted/30 active:bg-muted/40',
          isDragReject && 'border-danger-500 bg-danger-500/5',
          className,
        ),
      })}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <input {...getInputProps()} />
      <motion.div
        animate={{
          scale: isDragActive ? 1.1 : 1,
          y: isDragActive ? -4 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 to-purple-500/15 ring-1 ring-primary-500/20 text-primary-500"
      >
        <CloudUpload className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
      </motion.div>
      <h3 className="text-base font-semibold">
        {isDragActive ? 'Drop to upload' : (
          <>
            <span className="hidden sm:inline">Drag &amp; drop files here</span>
            <span className="sm:hidden">Tap to upload files</span>
          </>
        )}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        <span className="hidden sm:inline">or </span>
        <span className="font-medium text-primary-600 dark:text-primary-400">
          <span className="hidden sm:inline">click to browse</span>
          <span className="sm:hidden">browse from your device</span>
        </span>
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Supports PDF, DOCX, XLSX, TXT — up to {MAX_UPLOAD_MB} MB per file
      </p>
    </motion.div>
  );
}
