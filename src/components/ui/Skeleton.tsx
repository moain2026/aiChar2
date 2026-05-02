import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type SkeletonVariant = 'text' | 'circle' | 'card' | 'rectangle';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
}

const VARIANT_STYLES: Record<SkeletonVariant, string> = {
  text: 'rounded h-4',
  circle: 'rounded-full',
  card: 'rounded-xl h-32',
  rectangle: 'rounded-md',
};

/**
 * Animated placeholder used to indicate that real content is loading.
 */
export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps): JSX.Element {
  return (
    <div
      className={cn('skeleton', VARIANT_STYLES[variant], className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }): JSX.Element {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(i === lines - 1 && 'w-2/3')}
        />
      ))}
    </div>
  );
}
