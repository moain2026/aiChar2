import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 disabled:from-primary-400 disabled:to-primary-500',
  secondary:
    'bg-muted text-foreground hover:bg-muted/70 active:bg-muted/90 border border-border',
  ghost:
    'bg-transparent text-foreground hover:bg-muted active:bg-muted/80',
  danger:
    'bg-gradient-to-br from-danger-500 to-danger-600 text-white shadow-md shadow-danger-500/25 hover:from-danger-600 hover:to-danger-700',
  outline:
    'bg-transparent border border-border text-foreground hover:bg-muted active:bg-muted/80',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2 rounded-lg',
  icon: 'h-10 w-10 rounded-lg',
};

export interface ButtonProps extends HTMLMotionProps<'button'> {
  /** Visual style. */
  variant?: ButtonVariant;
  /** Sizing preset. */
  size?: ButtonSize;
  /** Show a spinner and disable interaction. */
  isLoading?: boolean;
  /** Optional element rendered on the left of the label. */
  leftIcon?: ReactNode;
  /** Optional element rendered on the right of the label. */
  rightIcon?: ReactNode;
  /** Make the button stretch to fill its parent. */
  fullWidth?: boolean;
}

/**
 * Primary button component used throughout the app.
 * Includes loading and icon support and Framer Motion press feedback.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || isLoading;
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none',
        'transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className={cn(variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-current')} />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children !== undefined && children !== null && children !== false && (
        <span className="truncate">{children as ReactNode}</span>
      )}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </motion.button>
  );
});
