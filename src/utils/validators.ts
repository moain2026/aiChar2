import { z } from 'zod';

/**
 * Zod schemas for forms throughout the app.
 * Centralizing them keeps validation logic identical between client
 * and (future) backend.
 */

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    password: passwordRules,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

/**
 * Compute a simple password strength score from 0..4.
 * Used by the signup form indicator.
 */
export function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score = Math.min(4, score + 1);

  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Too weak', color: 'bg-danger-500' },
    1: { label: 'Weak', color: 'bg-danger-500' },
    2: { label: 'Fair', color: 'bg-warning-500' },
    3: { label: 'Strong', color: 'bg-info-500' },
    4: { label: 'Excellent', color: 'bg-success-500' },
  };
  const entry = map[score]!;
  return { score: score as 0 | 1 | 2 | 3 | 4, label: entry.label, color: entry.color };
}
