import { FileText, FileSpreadsheet, FileType2, File as FileIcon } from 'lucide-react';
import type { FileType } from '@/types';
import { FILE_TYPE_STYLES } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const ICONS: Record<FileType, typeof FileText> = {
  pdf: FileText,
  docx: FileType2,
  xlsx: FileSpreadsheet,
  txt: FileIcon,
};

interface FileTypeIconProps {
  fileType: FileType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
} as const;

const ICON_SIZES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

/**
 * Colored icon badge for representing a document's file type.
 */
export function FileTypeIcon({
  fileType,
  size = 'md',
  className,
}: FileTypeIconProps): JSX.Element {
  const Icon = ICONS[fileType];
  const styles = FILE_TYPE_STYLES[fileType];
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg ring-1',
        styles.bg,
        styles.text,
        styles.ring,
        SIZES[size],
        className,
      )}
      aria-label={styles.label}
    >
      <Icon className={ICON_SIZES[size]} strokeWidth={1.75} />
    </div>
  );
}
