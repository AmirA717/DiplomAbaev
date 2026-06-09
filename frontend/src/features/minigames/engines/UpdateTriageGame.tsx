import { useState } from 'react';
import { toast } from 'sonner';
import { normalizeApiError } from '../../../api/errors';
import { Button } from '../../../components/ui/Button';
import { UpdateTriageConfig } from '../config';
import { evaluateUpdateTriage } from '../updateTriage';
import { useInteractiveGameAttempt } from '../useInteractiveGameAttempt';

interface UpdateTriageGameProps {
  gameId: number;
  config: UpdateTriageConfig;
}

export function UpdateTriageGame({ gameId, config }: UpdateTriageGameProps) {
  const attempt = useInteractiveGameAttempt(gameId);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submittedResult, setSubmittedResult] = useState<ReturnType<
    typeof evaluateUpdateTriage
  > | null>(null);

  const handleStart = async () => {
    try {
      await attempt.start();
      setPhase('playing');
      toast.success('Попытка игры начата');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleSubmit = async () => {
    const result = evaluateUpdateTriage({
      cases: config.cases,
      selections,
      pointsPerCase: config.pointsPerCase,
    });

    try {
      await attempt.finish({
        engine: 'UPDATE_TRIAGE',
        score: result.score,
        total: result.total,
        pointsEarned: result.pointsEarned,
        details: {
          labels: config.labels,
          assignments: result.details,
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
    setSelections({});
    setSubmittedResult(null);
    attempt.reset();
    setPhase('intro');
  };

  const handleClearAssignments = () => {
    setSelections({});
  };

  if (phase === 'intro') {
    return (
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Триаж обновлений</h2>
        <p className="mt-2 text-slate-700">
          Разложите 5 кейсов по колонкам: `Срочно`, `Запланировать` или
          `Можно отложить`. За каждый точный выбор начисляется 10 очков.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {config.labels.map((label) => (
            <span
              key={label}
              className="rounded-full border-2 border-slate-400 bg-slate-100 px-3 py-1 text-sm text-slate-800"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="mt-5">
          <Button onClick={handleStart} disabled={attempt.isBusy}>
            {attempt.isStarting ? 'Запускаем...' : 'Начать сортировку'}
          </Button>
        </div>
      </section>
    );
  }

  if (phase === 'result' && submittedResult) {
    return (
      <section className="space-y-4 rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">Итоговый счёт</p>
          <p className="mt-1 text-3xl font-bold text-blue-900">
            {submittedResult.pointsEarned} / 50
          </p>
          <p className="mt-2 text-sm text-blue-800">
            Верно разобрано кейсов: {submittedResult.score} из {submittedResult.total}
          </p>
        </div>

        <div className="grid gap-3">
          {submittedResult.details.map((detail) => {
            const currentCase = config.cases.find((item) => item.id === detail.caseId);
            return (
              <article
                key={detail.caseId}
                className={`rounded-lg border-2 p-4 ${
                  detail.isCorrect
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-amber-400 bg-amber-50'
                }`}
              >
                <p className="font-medium text-slate-900">{currentCase?.title}</p>
                <p className="mt-1 text-sm text-slate-700">
                  Ваше решение: {detail.selectedLabel ?? 'не выбрано'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Правильная колонка: {detail.correctLabel}
                </p>
                <p className="mt-2 text-sm text-slate-800">{detail.explanation}</p>
              </article>
            );
          })}
        </div>

        <Button onClick={handleRestart}>Пройти заново</Button>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border-4 border-slate-800 bg-white p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {config.labels.map((label) => (
          <div
            key={label}
            className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              {label}
            </p>
            <div className="mt-3 space-y-2">
              {config.cases
                .filter((item) => selections[item.id] === label)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    {item.title}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {config.cases.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border-2 border-slate-300 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-700">{item.context}</p>
              </div>
              <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs text-slate-700">
                Сейчас: {selections[item.id] ?? 'не назначено'}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {config.labels.map((label) => (
                <Button
                  key={label}
                  variant={selections[item.id] === label ? 'primary' : 'secondary'}
                  onClick={() =>
                    setSelections((current) => ({
                      ...current,
                      [item.id]: label,
                    }))
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleSubmit}
          disabled={config.cases.some((item) => !selections[item.id]) || attempt.isBusy}
        >
          {attempt.isFinishing ? 'Проверяем...' : 'Показать разбор'}
        </Button>
        <Button variant="secondary" onClick={handleClearAssignments} disabled={attempt.isBusy}>
          Очистить
        </Button>
      </div>
    </section>
  );
}
