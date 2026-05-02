import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export type InputVariant = 'default' | 'error' | 'success';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helper?: string;
  error?: string;
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

const VARIANT_STYLES: Record<InputVariant, string> = {
  default:
    'border-input focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
  error:
    'border-danger-500 focus-within:border-danger-500 focus-within:ring-2 focus-within:ring-danger-500/20',
  success:
    'border-success-500 focus-within:border-success-500 focus-within:ring-2 focus-within:ring-success-500/20',
};

/**
 * Form input with label, helper text, error state, and icon slots.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    containerClassName,
    label,
    helper,
    error,
    variant,
    leftIcon,
    rightIcon,
    id: idProp,
    disabled,
    ...props
  },
  ref,
) {
  const reactId = useId();
  const id = idProp || reactId;
  const resolvedVariant: InputVariant = variant ?? (error ? 'error' : 'default');
  const helperId = `${id}-helper`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'group flex items-center gap-2 rounded-lg border bg-card px-3 transition-all duration-200',
          'h-11 md:h-10',
          VARIANT_STYLES[resolvedVariant],
          disabled && 'opacity-60 cursor-not-allowed bg-muted',
          className,
        )}
      >
        {leftIcon && (
          <span className="shrink-0 text-muted-foreground group-focus-within:text-primary-500 transition-colors">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={resolvedVariant === 'error' || undefined}
          aria-describedby={(error || helper) ? helperId : undefined}
          className={cn(
            'w-full bg-transparent border-0 outline-none text-foreground',
            // 16px on mobile prevents iOS auto-zoom on focus, 14px on >=md.
            'text-base md:text-sm',
            'placeholder:text-muted-foreground/70',
            'disabled:cursor-not-allowed',
          )}
          {...props}
        />
        {rightIcon && <span className="shrink-0 text-muted-foreground">{rightIcon}</span>}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {(error || helper) && (
          <motion.p
            key={error || helper}
            id={helperId}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'mt-1.5 text-xs',
              error ? 'text-danger-600 dark:text-danger-400' : 'text-muted-foreground',
            )}
          >
            {error || helper}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
