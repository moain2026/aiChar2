import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage(): JSX.Element {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
