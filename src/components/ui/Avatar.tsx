import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/formatters';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg',
};

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: AvatarSize;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
}

const STATUS_COLORS = {
  online: 'bg-success-500',
  offline: 'bg-muted-foreground',
  busy: 'bg-danger-500',
} as const;

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { className, src, name, size = 'md', showStatus = false, status = 'online', ...props },
  ref,
) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <div
      ref={ref}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        'bg-gradient-to-br from-primary-500 to-purple-600 text-white',
        'select-none ring-2 ring-background',
        SIZES[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      {showStatus && (
        <span
          aria-label={status}
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-background',
            STATUS_COLORS[status],
          )}
        />
      )}
    </div>
  );
});
