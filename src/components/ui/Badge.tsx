import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

const VARIANTS: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-success-500/10 text-success-700 dark:text-success-300 border-success-500/20',
    dot: 'bg-success-500',
  },
  warning: {
    container: 'bg-warning-500/10 text-warning-700 dark:text-warning-300 border-warning-500/20',
    dot: 'bg-warning-500',
  },
  error: {
    container: 'bg-danger-500/10 text-danger-700 dark:text-danger-300 border-danger-500/20',
    dot: 'bg-danger-500',
  },
  info: {
    container: 'bg-info-500/10 text-info-700 dark:text-info-300 border-info-500/20',
    dot: 'bg-info-500',
  },
  neutral: {
    container: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  primary: {
    container: 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-500/20',
    dot: 'bg-primary-500',
  },
};

const SIZES: Record<BadgeSize, string> = {
  sm: 'text-2xs px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-0.5 gap-1.5',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a small colored dot before the label. */
  dot?: boolean;
  /** Add a subtle pulse to the dot (use for "live" or "processing" status). */
  pulse?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  ...props
}: BadgeProps): JSX.Element {
  const { container, dot: dotColor } = VARIANTS[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border whitespace-nowrap',
        container,
        SIZES[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={cn(
                'absolute inset-0 rounded-full animate-ping opacity-75',
                dotColor,
              )}
            />
          )}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColor)} />
        </span>
      )}
      {children}
    </span>
  );
}
