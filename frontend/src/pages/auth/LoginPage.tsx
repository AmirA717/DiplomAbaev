import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AuthCard } from '../../components/layout/AuthCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { normalizeApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/useAuth';
import { LoginFormValues, loginSchema } from '../../utils/validation';

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/', { replace: true });
    }
  }, [status, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      toast.success('Вход выполнен');
      navigate(from === '/login' ? '/' : from, { replace: true });
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      toast.error(normalizedError.message);
    }
  });

  return (
    <AuthCard
      title="Кибер-обучение"
      subtitle="Войдите в аккаунт, чтобы продолжить обучение"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Электронная почта"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Пароль"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
          Регистрация
        </Link>
      </p>
    </AuthCard>
  );
}


