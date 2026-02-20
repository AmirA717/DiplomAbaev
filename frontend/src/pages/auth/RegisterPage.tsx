import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AuthCard } from '../../components/layout/AuthCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { normalizeApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/useAuth';
import { RegisterFormValues, registerSchema } from '../../utils/validation';

export function RegisterPage() {
  const { register: registerUser, status } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/', { replace: true });
    }
  }, [status, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser({
        fullName: values.fullName,
        username: values.username || undefined,
        email: values.email,
        password: values.password,
      });
      toast.success('Регистрация завершена');
      navigate('/', { replace: true });
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      toast.error(normalizedError.message);
    }
  });

  return (
    <AuthCard title="Создать аккаунт" subtitle="Получите доступ к темам, играм и викторинам">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Полное имя" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <Input
          label="Имя пользователя (опционально)"
          error={errors.username?.message}
          {...register('username')}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Подтверждение пароля"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
          Войти
        </Link>
      </p>
    </AuthCard>
  );
}


