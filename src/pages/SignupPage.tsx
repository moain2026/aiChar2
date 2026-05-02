import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export function SignupPage(): JSX.Element {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
