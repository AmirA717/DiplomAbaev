import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { normalizeApiError } from '../../api/errors';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { useProfile, useUpdateProfile } from '../../features/profile/hooks';
import { formatDate } from '../../utils/format';
import { ProfileFormValues, profileSchema } from '../../utils/validation';

const roleLabel: Record<'USER' | 'ADMIN', string> = {
  USER: 'Обучающийся',
  ADMIN: 'Администратор',
};

export function ProfilePage() {
  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      username: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        fullName: profileQuery.data.fullName,
        username: profileQuery.data.username ?? '',
        avatarUrl: profileQuery.data.profilePicture ?? '',
      });
    }
  }, [profileQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfileMutation.mutateAsync({
        fullName: values.fullName,
        username: values.username || undefined,
        avatarUrl: values.avatarUrl || undefined,
      });
      toast.success('Профиль обновлен');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  });

  if (profileQuery.isLoading) {
    return <Loader label="Загружаем профиль..." />;
  }

  if (profileQuery.isError) {
    return <ErrorState message={normalizeApiError(profileQuery.error).message} />;
  }

  const profile = profileQuery.data;
  if (!profile) {
    return <Loader label="Профиль не найден..." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Профиль пользователя</h1>
          <Link to="/stats">
            <Button variant="secondary">Статистика</Button>
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Очки</p>
            <p className="text-2xl font-semibold text-slate-900">{profile.totalPoints}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Роль</p>
            <p className="text-2xl font-semibold text-slate-900">{roleLabel[profile.role]}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Регистрация</p>
            <p className="text-lg font-semibold text-slate-900">{formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Редактирование профиля</h2>

        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <Input label="Электронная почта" value={profile.email} disabled readOnly />
          <Input label="Полное имя" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Имя пользователя" error={errors.username?.message} {...register('username')} />
       
          <Button type="submit" disabled={isSubmitting || updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? 'Сохраняем...' : 'Сохранить изменения'}
          </Button>
        </form>
      </section>
    </div>
  );
}


