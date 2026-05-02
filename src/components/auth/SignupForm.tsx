import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import {
  signupSchema,
  type SignupFormValues,
  getPasswordStrength,
} from '@/utils/validators';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';

export function SignupForm(): JSX.Element {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  useEffect(() => () => clearError(), [clearError]);

  const password = watch('password') ?? '';
  const strength = getPasswordStrength(password);

  async function onSubmit(values: SignupFormValues): Promise<void> {
    try {
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success({
        title: 'Account created',
        description: 'Welcome aboard! Let\'s get started.',
      });
      navigate(ROUTES.dashboard, { replace: true });
    } catch {
      // surfaced via auth store
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card variant="glass" padding="lg" className="shadow-2xl">
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start chatting with your documents in minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Full name"
            placeholder="Your name"
            autoComplete="name"
            leftIcon={<UserIcon className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex h-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-full transition-all duration-300',
                        i < strength.score ? strength.color : 'bg-muted',
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Strength:{' '}
                  <span className="font-medium text-foreground">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-700 dark:text-danger-200"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading || isSubmitting}
            disabled={!isValid && !isSubmitting}
            rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to={ROUTES.login}
            className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
