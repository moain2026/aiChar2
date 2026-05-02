import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  helper?: string;
  tone?: 'primary' | 'success' | 'info' | 'warning';
  delay?: number;
}

const TONE_STYLES = {
  primary: 'from-primary-500/15 to-primary-500/5 text-primary-500 ring-primary-500/20',
  success: 'from-success-500/15 to-success-500/5 text-success-500 ring-success-500/20',
  info: 'from-info-500/15 to-info-500/5 text-info-500 ring-info-500/20',
  warning: 'from-warning-500/15 to-warning-500/5 text-warning-500 ring-warning-500/20',
} as const;

/**
 * Animated counter — counts up from 0 to the target on mount.
 */
function AnimatedCounter({ value }: { value: number }): JSX.Element {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const start = performance.now();
    const duration = 800;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display}</>;
}

export function StatsCard({
  icon,
  label,
  value,
  helper,
  tone = 'primary',
  delay = 0,
}: StatsCardProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    >
      <Card variant="solid" padding="md" className="h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
              {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
            </p>
            {helper && (
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1',
              TONE_STYLES[tone],
            )}
          >
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
