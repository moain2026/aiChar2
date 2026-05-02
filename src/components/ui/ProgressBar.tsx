import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  /** 0..100 */
  value: number;
  className?: string;
  showLabel?: boolean;
}

/**
 * Animated progress bar with a primary gradient fill.
 */
export function ProgressBar({ value, className, showLabel = false }: ProgressBarProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-end">
          <span className="text-xs tabular-nums text-muted-foreground">{Math.round(clamped)}%</span>
        </div>
      )}
    </div>
  );
}
