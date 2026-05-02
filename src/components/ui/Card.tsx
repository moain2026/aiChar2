import { forwardRef, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

export type CardVariant = 'solid' | 'glass' | 'outline' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const VARIANTS: Record<CardVariant, string> = {
  solid: 'bg-card border border-border shadow-card',
  glass: 'glass shadow-soft',
  outline: 'bg-transparent border border-border',
  gradient:
    'bg-gradient-to-br from-card to-muted border border-border shadow-card',
};

const PADDINGS: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Add a hover lift effect. */
  interactive?: boolean;
}

/**
 * Generic surface used for content panels, list items, and modals.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'solid', padding = 'md', interactive = false, children, ...props },
  ref,
) {
  if (interactive) {
    const motionProps = props as HTMLMotionProps<'div'>;
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.08)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn('rounded-xl', VARIANTS[variant], PADDINGS[padding], className)}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn('rounded-xl', VARIANTS[variant], PADDINGS[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('flex flex-col gap-1.5 mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return <h3 className={cn('text-lg font-semibold text-foreground', className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('text-sm text-foreground', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('flex items-center gap-2 mt-4', className)} {...props} />;
}
