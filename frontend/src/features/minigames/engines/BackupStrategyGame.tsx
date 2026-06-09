import { useState } from 'react';
import { toast } from 'sonner';
import { normalizeApiError } from '../../../api/errors';
import { Button } from '../../../components/ui/Button';
import { BackupStrategyConfig } from '../config';
import { evaluateBackupStrategy } from '../backupStrategy';
import { useInteractiveGameAttempt } from '../useInteractiveGameAttempt';

interface BackupStrategyGameProps {
  gameId: number;
  config: BackupStrategyConfig;
}

export function BackupStrategyGame({ gameId, config }: BackupStrategyGameProps) {
  const attempt = useInteractiveGameAttempt(gameId);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [testRestore, setTestRestore] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<ReturnType<
    typeof evaluateBackupStrategy
  > | null>(null);

  const preview = evaluateBackupStrategy({
    selectedIds,
    storageOptions: config.storageOptions,
    requiredRules: config.requiredRules,
    points: config.points,
    budget: config.budget,
    testRestore,
  });

  const handleStart = async () => {
    try {
      await attempt.start();
      setPhase('playing');
      toast.success('Попытка игры начата');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleToggle = (storageId: string) => {
    setSelectedIds((current) => {
      if (current.includes(storageId)) {
        return current.filter((id) => id !== storageId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, storageId];
    });
  };

  const handleSubmit = async () => {
    const result = evaluateBackupStrategy({
      selectedIds,
      storageOptions: config.storageOptions,
      requiredRules: config.requiredRules,
      points: config.points,
      budget: config.budget,
      testRestore,
    });

    try {
      await attempt.finish({
        engine: 'BACKUP_STRATEGY',
        score: result.score,
        total: result.total,
        pointsEarned: result.pointsEarned,
        details: {
          selectedIds,
          totalCost: result.totalCost,
          withinBudget: result.withinBudget,
          status: result.status,
          testRestore,
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
    setSelectedIds([]);
    setTestRestore(false);
    setSubmittedResult(null);
    attempt.reset();
    setPhase('intro');
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setTestRestore(false);
  };

  if (phase === 'intro') {
    return (
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Соберите backup-стратегию</h2>
        <p className="mt-2 text-slate-700">
          Выберите ровно 3 хранилища так, чтобы выполнить правило 3-2-1.
          Максимум 50 очков: за 3 копии, 2 типа носителей, 1 offsite-копию и
          бонус за тест восстановления.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Бюджет на дополнительные решения: {config.budget} условных единиц.
        </p>
        <div className="mt-5">
          <Button onClick={handleStart} disabled={attempt.isBusy}>
            {attempt.isStarting ? 'Запускаем...' : 'Начать сборку'}
          </Button>
        </div>
      </section>
    );
  }

  if (phase === 'result' && submittedResult) {
    return (
      <section className="space-y-4 rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="rounded-lg border-2 border-indigo-500 bg-indigo-50 p-4">
          <p className="text-sm text-indigo-900">Итог</p>
          <p className="mt-1 text-3xl font-bold text-indigo-900">
            {submittedResult.pointsEarned} / {submittedResult.total}
          </p>
          <p className="mt-2 text-sm text-indigo-800">
            Стоимость набора: {submittedResult.totalCost} / {config.budget}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-4">
            <p className="font-medium text-slate-900">Что удалось</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>3 копии: {submittedResult.status.copiesRuleMet ? 'да' : 'нет'}</li>
              <li>2 типа носителей: {submittedResult.status.mediaRuleMet ? 'да' : 'нет'}</li>
              <li>1 offsite-копия: {submittedResult.status.offsiteRuleMet ? 'да' : 'нет'}</li>
              <li>Тест восстановления: {submittedResult.status.restoreTestMet ? 'да' : 'нет'}</li>
              <li>В пределах бюджета: {submittedResult.withinBudget ? 'да' : 'нет'}</li>
            </ul>
          </div>
          <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-4">
            <p className="font-medium text-slate-900">Выбранные хранилища</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {submittedResult.selectedOptions.map((option) => (
                <li key={option.id}>
                  {config.storageOptions.find((item) => item.id === option.id)?.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button onClick={handleRestart}>Пройти заново</Button>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border-4 border-slate-800 bg-white p-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-3">
          {config.storageOptions.map((option) => {
            const selected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggle(option.id)}
                className={`rounded-xl border-2 p-4 text-left ${
                  selected
                    ? 'border-slate-900 bg-slate-700 text-white'
                    : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{option.title}</p>
                  <span className="text-xs">{option.cost} ед.</span>
                </div>
                <p className="mt-2 text-sm opacity-90">{option.description}</p>
                <p className="mt-2 text-xs opacity-80">
                  Носитель: {option.mediaType} · {option.offsite ? 'offsite' : 'local'}
                </p>
              </button>
            );
          })}
        </div>

        <aside className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">Статус правил</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>Выбрано: {selectedIds.length} / 3</li>
            <li>3 копии: {preview.status.copiesRuleMet ? 'выполнено' : 'не хватает'}</li>
            <li>2 типа носителей: {preview.status.mediaRuleMet ? 'выполнено' : 'не хватает'}</li>
            <li>1 offsite-копия: {preview.status.offsiteRuleMet ? 'выполнено' : 'не хватает'}</li>
            <li>Бюджет: {preview.totalCost} / {config.budget}</li>
          </ul>

          <label className="mt-4 flex items-start gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={testRestore}
              onChange={(event) => setTestRestore(event.target.checked)}
            />
            <span>Планирую регулярно проверять восстановление файлов</span>
          </label>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleSubmit}
          disabled={selectedIds.length !== 3 || attempt.isBusy}
        >
          {attempt.isFinishing ? 'Сохраняем...' : 'Завершить стратегию'}
        </Button>
        <Button variant="secondary" onClick={handleClearSelection} disabled={attempt.isBusy}>
          Очистить
        </Button>
      </div>
    </section>
  );
}
