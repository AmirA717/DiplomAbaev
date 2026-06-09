import { useState } from 'react';
import { toast } from 'sonner';
import { normalizeApiError } from '../../../api/errors';
import { Button } from '../../../components/ui/Button';
import { AppPermissionAuditConfig } from '../config';
import { evaluateAppPermissionAudit } from '../appPermissionAudit';
import { useInteractiveGameAttempt } from '../useInteractiveGameAttempt';

interface AppPermissionAuditGameProps {
  gameId: number;
  config: AppPermissionAuditConfig;
}

export function AppPermissionAuditGame({
  gameId,
  config,
}: AppPermissionAuditGameProps) {
  const attempt = useInteractiveGameAttempt(gameId);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [selectedMatrix, setSelectedMatrix] = useState<Record<string, string[]>>({});
  const [submittedResult, setSubmittedResult] = useState<ReturnType<
    typeof evaluateAppPermissionAudit
  > | null>(null);

  const permissionLabels = Object.fromEntries(
    config.permissions.map((permission) => [permission.id, permission.label]),
  );

  const handleStart = async () => {
    try {
      await attempt.start();
      setPhase('playing');
      toast.success('Попытка игры начата');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleTogglePermission = (appId: string, permissionId: string) => {
    setSelectedMatrix((current) => {
      const currentPermissions = current[appId] ?? [];
      const nextPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter((id) => id !== permissionId)
        : [...currentPermissions, permissionId];

      return {
        ...current,
        [appId]: nextPermissions,
      };
    });
  };

  const handleSubmit = async () => {
    const result = evaluateAppPermissionAudit({
      apps: config.apps,
      expectedMatrix: config.expectedMatrix,
      selectedMatrix,
      pointsPerApp: config.pointsPerApp,
    });

    try {
      await attempt.finish({
        engine: 'APP_PERMISSION_AUDIT',
        score: result.score,
        total: result.total,
        pointsEarned: result.pointsEarned,
        details: {
          selectedMatrix,
          audits: result.details,
        },
      });

      setSubmittedResult(result);
      setPhase('result');
      toast.success('Результат игры сохранён');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleRestart = () => {
    setSelectedMatrix({});
    setSubmittedResult(null);
    attempt.reset();
    setPhase('intro');
  };

  const handleClearMatrix = () => {
    setSelectedMatrix({});
  };

  if (phase === 'intro') {
    return (
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Аудит разрешений</h2>
        <p className="mt-2 text-slate-700">
          Для каждого из 5 приложений включите только нужные разрешения. Полное
          совпадение по одному приложению даёт 10 очков.
        </p>
        <div className="mt-5">
          <Button onClick={handleStart} disabled={attempt.isBusy}>
            {attempt.isStarting ? 'Запускаем...' : 'Начать аудит'}
          </Button>
        </div>
      </section>
    );
  }

  if (phase === 'result' && submittedResult) {
    return (
      <section className="space-y-4 rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="rounded-lg border-2 border-rose-500 bg-rose-50 p-4">
          <p className="text-sm text-rose-900">Итог</p>
          <p className="mt-1 text-3xl font-bold text-rose-900">
            {submittedResult.pointsEarned} / 50
          </p>
          <p className="mt-2 text-sm text-rose-800">
            Полных совпадений: {submittedResult.score} из {submittedResult.total}
          </p>
        </div>

        <div className="grid gap-3">
          {submittedResult.details.map((detail) => {
            const app = config.apps.find((item) => item.id === detail.appId);
            return (
              <article
                key={detail.appId}
                className={`rounded-lg border-2 p-4 ${
                  detail.isCorrect
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-amber-400 bg-amber-50'
                }`}
              >
                <p className="font-medium text-slate-900">{app?.title}</p>
                <p className="mt-2 text-sm text-slate-700">
                  Нужно: {detail.expectedPermissions.map((id) => permissionLabels[id]).join(', ') || 'без разрешений'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Вы выбрали: {detail.selectedPermissions.map((id) => permissionLabels[id]).join(', ') || 'без разрешений'}
                </p>
                {detail.extraPermissions.length > 0 ? (
                  <p className="mt-2 text-sm text-amber-900">
                    Лишние: {detail.extraPermissions.map((id) => permissionLabels[id]).join(', ')}
                  </p>
                ) : null}
                {detail.missingPermissions.length > 0 ? (
                  <p className="mt-1 text-sm text-amber-900">
                    Не хватает: {detail.missingPermissions.map((id) => permissionLabels[id]).join(', ')}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>

        <Button onClick={handleRestart}>Пройти заново</Button>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border-4 border-slate-800 bg-white p-6">
      {config.apps.map((app) => (
        <article key={app.id} className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4">
          <p className="text-lg font-semibold text-slate-900">{app.title}</p>
          <p className="mt-1 text-sm text-slate-700">{app.description}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {config.permissions.map((permission) => {
              const checked = (selectedMatrix[app.id] ?? []).includes(permission.id);
              return (
                <label
                  key={`${app.id}-${permission.id}`}
                  className={`flex items-start gap-3 rounded-lg border-2 p-3 ${
                    checked
                      ? 'border-slate-900 bg-slate-700 text-white'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTogglePermission(app.id, permission.id)}
                  />
                  <span>
                    <span className="block font-medium">{permission.label}</span>
                    <span className="block text-sm opacity-90">{permission.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </article>
      ))}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSubmit} disabled={attempt.isBusy}>
          {attempt.isFinishing ? 'Проверяем...' : 'Проверить матрицу'}
        </Button>
        <Button variant="secondary" onClick={handleClearMatrix} disabled={attempt.isBusy}>
          Очистить
        </Button>
      </div>
    </section>
  );
}
