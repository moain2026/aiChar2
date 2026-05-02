import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { loginSchema, type LoginFormValues } from '@/utils/validators';
import { ROUTES } from '@/utils/constants';

export function LoginForm(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', remember: true },
  });

  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  useEffect(() => () => clearError(), [clearError]);

  async function onSubmit(values: LoginFormValues): Promise<void> {
    try {
      await login(values);
      toast.success({ title: 'Welcome back!', description: 'Signed in successfully.' });
      const dest = (location.state as { from?: string } | null)?.from;
      navigate(dest && dest !== ROUTES.login ? dest : ROUTES.dashboard, { replace: true });
    } catch {
      // error message surfaced via the auth store
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
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to keep chatting with your documents.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
          autoComplete="on"
        >
          <Input
            label="Email"
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary-500 focus:ring-primary-500/40"
                {...register('remember')}
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              onClick={() =>
                toast.info({
                  title: 'Coming soon',
                  description: 'Password reset will be available shortly.',
                })
              }
            >
              Forgot password?
            </button>
          </div>

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
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-0.5">Demo account</p>
          <p>
            Email: <code className="font-mono">demo@company.com</code> · Password:{' '}
            <code className="font-mono">demo123</code>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to={ROUTES.signup}
            className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
