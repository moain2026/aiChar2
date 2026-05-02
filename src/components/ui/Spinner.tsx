import { cn } from '@/utils/cn';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZES: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Accessible label, visually hidden. */
  label?: string;
}

/**
 * Lightweight spinner for inline and full-page loading states.
 */
export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps): JSX.Element {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block rounded-full border-current border-t-transparent animate-spin align-[-0.125em]',
        SIZES[size],
        className,
      )}
    />
  );
}
