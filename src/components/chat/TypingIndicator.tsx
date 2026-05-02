import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TypingIndicatorProps {
  className?: string;
}

/**
 * Three-dot indicator shown while the AI is "thinking" (between
 * the user's message and the first streamed token).
 */
export function TypingIndicator({ className }: TypingIndicatorProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className={cn('inline-flex items-center gap-1.5', className)}
      aria-label="AI is thinking"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-2 w-2 rounded-full bg-primary-500"
          animate={{
            scale: [0.6, 1, 0.6],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}
