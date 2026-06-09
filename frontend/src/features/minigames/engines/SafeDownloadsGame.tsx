import { useState } from 'react';
import { toast } from 'sonner';
import { normalizeApiError } from '../../../api/errors';
import { Button } from '../../../components/ui/Button';
import { SafeDownloadsConfig } from '../config';
import { evaluateSafeDownloads } from '../safeDownloads';
import { useInteractiveGameAttempt } from '../useInteractiveGameAttempt';

interface SafeDownloadsGameProps {
  gameId: number;
  config: SafeDownloadsConfig;
}

export function SafeDownloadsGame({ gameId, config }: SafeDownloadsGameProps) {
  const attempt = useInteractiveGameAttempt(gameId);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submittedResult, setSubmittedResult] = useState<ReturnType<
    typeof evaluateSafeDownloads
  > | null>(null);

  const currentItem = config.items[currentIndex];
  const selectedAction = currentItem ? selections[currentItem.id] ?? null : null;

  const handleStart = async () => {
    try {
      await attempt.start();
      setPhase('playing');
      toast.success('Попытка игры начата');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleChoose = (action: string) => {
    if (!currentItem) {
      return;
    }

    setSelections((current) => ({
      ...current,
      [currentItem.id]: action,
    }));
  };

  const handleNext = () => {
    if (!currentItem || !selectedAction) {
      return;
    }

    if (currentIndex + 1 >= config.items.length) {
      void handleFinish();
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  const handleFinish = async () => {
    const result = evaluateSafeDownloads({
      items: config.items,
      selections,
      pointsPerItem: config.pointsPerItem,
    });

    try {
      await attempt.finish({
        engine: 'SAFE_DOWNLOADS',
        score: result.score,
        total: result.total,
        pointsEarned: result.pointsEarned,
        details: {
          selections,
          decisions: result.details,
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
    setCurrentIndex(0);
    setSelections({});
    setSubmittedResult(null);
    attempt.reset();
    setPhase('intro');
  };

  if (phase === 'intro') {
    return (
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Безопасные решения по загрузкам</h2>
        <p className="mt-2 text-slate-700">
          Для каждого кейса выберите действие: `Скачать`, `Проверить` или
          `Отклонить`. После ответа сразу увидите объяснение.
        </p>
        <div className="mt-5">
          <Button onClick={handleStart} disabled={attempt.isBusy}>
            {attempt.isStarting ? 'Запускаем...' : 'Начать кейсы'}
          </Button>
        </div>
      </section>
    );
  }

  if (phase === 'result' && submittedResult) {
    return (
      <section className="space-y-4 rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="rounded-lg border-2 border-teal-500 bg-teal-50 p-4">
          <p className="text-sm text-teal-900">Итоговый результат</p>
          <p className="mt-1 text-3xl font-bold text-teal-900">
            {submittedResult.pointsEarned} / 50
          </p>
          <p className="mt-2 text-sm text-teal-800">
            Верных решений: {submittedResult.score} из {submittedResult.total}
          </p>
        </div>

        <div className="grid gap-3">
          {submittedResult.details.map((detail) => {
            const item = config.items.find((entry) => entry.id === detail.itemId);
            return (
              <article
                key={detail.itemId}
                className={`rounded-lg border-2 p-4 ${
                  detail.isCorrect
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-amber-400 bg-amber-50'
                }`}
              >
                <p className="font-medium text-slate-900">{item?.title}</p>
                <p className="mt-1 text-sm text-slate-700">
                  Ваш выбор: {detail.selectedAction ?? 'не выбрано'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Правильное решение: {detail.correctAction}
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

  if (!currentItem) {
    return null;
  }

  const hasExplanation = selectedAction !== null;
  const isCorrect = selectedAction === currentItem.correctAction;

  return (
    <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            Кейс {currentIndex + 1} из {config.items.length}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{currentItem.title}</h2>
        </div>
        <span className="rounded-full border-2 border-slate-300 bg-slate-100 px-3 py-1 text-sm text-slate-700">
          Счёт: {Object.keys(selections).length * 10}
        </span>
      </div>

      <div className="mt-5 rounded-xl border-2 border-slate-300 bg-slate-50 p-5">
        <p className="text-sm text-slate-800">{currentItem.context}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {config.actions.map((action) => (
          <Button
            key={action}
            variant={selectedAction === action ? 'primary' : 'secondary'}
            onClick={() => handleChoose(action)}
            disabled={hasExplanation}
          >
            {action}
          </Button>
        ))}
      </div>

      {hasExplanation ? (
        <div
          className={`mt-5 rounded-lg border-2 p-4 ${
            isCorrect
              ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
              : 'border-amber-400 bg-amber-50 text-amber-900'
          }`}
        >
          <p className="font-medium">
            Ваш выбор: {selectedAction}. Правильный ответ: {currentItem.correctAction}.
          </p>
          <p className="mt-2 text-sm">{currentItem.explanation}</p>
          <div className="mt-4">
            <Button onClick={handleNext} disabled={attempt.isBusy}>
              {currentIndex + 1 >= config.items.length ? 'Показать итог' : 'Следующий кейс'}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
