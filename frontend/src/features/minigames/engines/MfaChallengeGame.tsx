import { useState } from 'react';
import { toast } from 'sonner';
import { normalizeApiError } from '../../../api/errors';
import { Button } from '../../../components/ui/Button';
import { MfaChallengeConfig } from '../config';
import { evaluateMfaChallenge } from '../mfaChallenge';
import { useInteractiveGameAttempt } from '../useInteractiveGameAttempt';

interface MfaChallengeGameProps {
  gameId: number;
  config: MfaChallengeConfig;
}

export function MfaChallengeGame({ gameId, config }: MfaChallengeGameProps) {
  const attempt = useInteractiveGameAttempt(gameId);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submittedResult, setSubmittedResult] = useState<ReturnType<
    typeof evaluateMfaChallenge
  > | null>(null);

  const methodLabels = Object.fromEntries(
    config.methods.map((method) => [method.id, method.label]),
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

  const handleSubmit = async () => {
    const result = evaluateMfaChallenge({
      correctPairs: config.correctPairs,
      selections,
      pointsPerMatch: config.pointsPerMatch,
    });

    try {
      await attempt.finish({
        engine: 'MFA_CHALLENGE',
        score: result.score,
        total: result.total,
        pointsEarned: result.pointsEarned,
        details: {
          selections,
          matches: result.details,
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

  const handleClearSelections = () => {
    setSelections({});
  };

  if (phase === 'intro') {
    return (
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Старт</h2>
        <p className="mt-2 text-slate-700">
          Сопоставьте 5 аккаунтов с лучшим вторым фактором. За каждое точное
          совпадение начисляется 10 очков.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {config.methods.map((method) => (
            <article
              key={method.id}
              className="rounded-lg border-2 border-slate-300 bg-slate-50 p-3"
            >
              <p className="font-medium text-slate-900">{method.label}</p>
              <p className="mt-1 text-sm text-slate-700">{method.description}</p>
            </article>
          ))}
        </div>
        <div className="mt-5">
          <Button onClick={handleStart} disabled={attempt.isBusy}>
            {attempt.isStarting ? 'Запускаем...' : 'Начать сопоставление'}
          </Button>
        </div>
      </section>
    );
  }

  if (phase === 'result' && submittedResult) {
    return (
      <section className="space-y-4 rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">Итог</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900">
            {submittedResult.pointsEarned} / 50
          </p>
          <p className="mt-2 text-sm text-emerald-800">
            Верных совпадений: {submittedResult.score} из {submittedResult.total}
          </p>
        </div>

        <div className="grid gap-3">
          {submittedResult.details.map((detail) => {
            const account = config.accounts.find((item) => item.id === detail.accountId);
            return (
              <article
                key={detail.accountId}
                className={`rounded-lg border-2 p-4 ${
                  detail.isCorrect
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-amber-400 bg-amber-50'
                }`}
              >
                <p className="font-medium text-slate-900">{account?.title}</p>
                <p className="mt-1 text-sm text-slate-700">
                  Ваш выбор: {detail.selectedMethodId ? methodLabels[detail.selectedMethodId] : 'не выбран'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Лучший вариант: {methodLabels[detail.correctMethodId]}
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
    <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
      <div className="grid gap-4">
        {config.accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4"
          >
            <p className="text-lg font-semibold text-slate-900">{account.title}</p>
            <p className="mt-1 text-sm text-slate-700">{account.description}</p>
            <label className="mt-4 block text-sm font-medium text-slate-800">
              Выберите лучший второй фактор
              <select
                className="mt-2 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2"
                value={selections[account.id] ?? ''}
                onChange={(event) =>
                  setSelections((current) => ({
                    ...current,
                    [account.id]: event.target.value,
                  }))
                }
              >
                <option value="">Выберите вариант</option>
                {config.methods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          onClick={handleSubmit}
          disabled={config.accounts.some((account) => !selections[account.id]) || attempt.isBusy}
        >
          {attempt.isFinishing ? 'Проверяем...' : 'Проверить ответы'}
        </Button>
        <Button variant="secondary" onClick={handleClearSelections} disabled={attempt.isBusy}>
          Очистить выбор
        </Button>
      </div>
    </section>
  );
}
