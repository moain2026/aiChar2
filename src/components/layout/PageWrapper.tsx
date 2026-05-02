import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  /** Restrict max content width. Defaults to `max-w-6xl`. */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Override default vertical/horizontal padding. */
  padded?: boolean;
}

const MAX_WIDTHS: Record<NonNullable<PageWrapperProps['maxWidth']>, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[88rem]',
  full: 'max-w-none',
};

/**
 * Provides the consistent page-level container, padding, and entrance animation.
 */
export function PageWrapper({
  children,
  className,
  maxWidth = 'lg',
  padded = true,
}: PageWrapperProps): JSX.Element {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex-1 w-full mx-auto',
        padded && 'px-4 md:px-6 lg:px-8 py-6 md:py-8',
        MAX_WIDTHS[maxWidth],
        className,
      )}
    >
      {children}
    </motion.main>
  );
}
