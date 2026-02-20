import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { normalizeApiError } from '../../api/errors';
import { PhishingScenarioLabel } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Loader } from '../../components/ui/Loader';
import {
  usePhishingScenarios,
  useSaveMinigameResult,
} from '../../features/minigames/hooks';

interface AnswerRecord {
  scenarioId: string;
  selected: PhishingScenarioLabel;
  isCorrect: boolean;
}

const labelText: Record<PhishingScenarioLabel, string> = {
  PHISHING: 'Фишинг',
  SAFE: 'Безопасно',
};

export function PhishingGamePage() {
  const [trainingMode, setTrainingMode] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [hasSavedResult, setHasSavedResult] = useState(false);

  const scenariosQuery = usePhishingScenarios(10);
  const saveResultMutation = useSaveMinigameResult();

  const scenarios = useMemo(() => scenariosQuery.data?.items ?? [], [
    scenariosQuery.data?.items,
  ]);
  const totalQuestions = scenarios.length;
  const currentScenario = scenarios[currentIndex];
  const finished = totalQuestions > 0 && currentIndex >= totalQuestions;
  const score = answers.filter((answer) => answer.isCorrect).length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answers.length / totalQuestions) * 100) : 0;
  const currentAnswer =
    currentScenario === undefined
      ? null
      : answers.find((answer) => answer.scenarioId === currentScenario.id) ?? null;

  const handleAnswer = (label: PhishingScenarioLabel) => {
    if (!currentScenario || currentAnswer) {
      return;
    }

    const isCorrect = label === currentScenario.label;
    setAnswers((prev) => [
      ...prev,
      {
        scenarioId: currentScenario.id,
        selected: label,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (!currentAnswer) {
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setHasSavedResult(false);
  };

  const handleSaveResult = async () => {
    try {
      const response = await saveResultMutation.mutateAsync({
        type: 'PHISHING_DETECTOR',
        score,
        total: totalQuestions,
        pointsEarned: score * 10,
        details: {
          trainingMode,
          answeredQuestions: answers.length,
        },
      });

      if (response.saved) {
        setHasSavedResult(true);
        toast.success('Результат мини-игры сохранён');
        return;
      }

      toast.warning('Результат не сохранён: игра этого типа не настроена в админке');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  if (scenariosQuery.isLoading) {
    return <Loader label="Загружаем сценарии фишинга..." />;
  }

  if (scenariosQuery.isError) {
    return <ErrorState message={normalizeApiError(scenariosQuery.error).message} />;
  }

  if (totalQuestions === 0) {
    return <ErrorState message="Сценарии фишинга не найдены." />;
  }

  if (finished) {
    const isGoodResult = score >= Math.ceil(totalQuestions * 0.7);

    return (
      <div className="space-y-6">
        <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Найди фишинг: результат
          </h1>
          <p className="mt-2 text-slate-600">
            Вы завершили {totalQuestions} сценариев.
          </p>
        </section>

        <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Итоговый счёт</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {score} / {totalQuestions}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {isGoodResult
                  ? 'Хороший результат: вы уверенно распознаёте подозрительные сообщения.'
                  : 'Рекомендуется пройти тренажёр ещё раз в режиме обучения.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleRestart}>Пройти снова</Button>
              <Button
                variant="secondary"
                onClick={handleSaveResult}
                disabled={saveResultMutation.isPending || hasSavedResult}
              >
                {hasSavedResult
                  ? 'Результат сохранён'
                  : saveResultMutation.isPending
                    ? 'Сохраняем...'
                    : 'Сохранить результат'}
              </Button>
              <Link to="/">
                <Button variant="ghost">На главную</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Найди фишинг</h1>
            <p className="mt-1 text-sm text-slate-600">
              Выберите: сообщение фишинговое или безопасное.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={trainingMode ? 'primary' : 'secondary'}
              onClick={() => setTrainingMode((prev) => !prev)}
            >
              {trainingMode ? 'Обучение: включено' : 'Обучение: выключено'}
            </Button>
            <Link to="/">
              <Button variant="ghost">На главную</Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>
              Прогресс: {answers.length}/{totalQuestions}
            </span>
            <span>Счёт: {score}</span>
          </div>
          <div className="h-3 rounded-full border-2 border-slate-400 bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Сценарий {currentIndex + 1} из {totalQuestions} · {currentScenario.channel}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          {currentScenario.subject ?? currentScenario.preview}
        </h2>

        <div className="mt-4 space-y-3 rounded-lg border-2 border-slate-300 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">От:</span>{' '}
            {currentScenario.sender} ({currentScenario.senderAddress})
          </p>
          <p className="text-sm text-slate-700">{currentScenario.body}</p>
          {currentScenario.url ? (
            <p className="break-words text-sm text-slate-700">
              <span className="font-medium text-slate-900">Ссылка:</span>{' '}
              {currentScenario.url}
            </p>
          ) : null}
        </div>

        {trainingMode ? (
          <div className="mt-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">Режим обучения</p>
            <p className="mt-1 text-sm text-amber-800">{currentScenario.hint}</p>
            {currentScenario.suspiciousParts.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentScenario.suspiciousParts.map((part) => (
                  <span
                    key={part}
                    className="rounded-md border border-amber-500 bg-white px-2 py-1 text-xs text-amber-900"
                  >
                    {part}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            onClick={() => handleAnswer('PHISHING')}
            disabled={Boolean(currentAnswer)}
          >
            Фишинг
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAnswer('SAFE')}
            disabled={Boolean(currentAnswer)}
          >
            Безопасно
          </Button>
        </div>

        {currentAnswer ? (
          <div
            className={`mt-5 rounded-lg border-2 p-4 ${
              currentAnswer.isCorrect
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-red-500 bg-red-50 text-red-900'
            }`}
          >
            <p className="font-medium">
              Ваш ответ: {labelText[currentAnswer.selected]} ·{' '}
              {currentAnswer.isCorrect
                ? 'Верно'
                : `Неверно (правильно: ${labelText[currentScenario.label]})`}
            </p>
            <p className="mt-2 text-sm">{currentScenario.explanation}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {currentScenario.indicators.map((indicator) => (
                <li key={`${currentScenario.id}-${indicator.key}-${indicator.text}`}>
                  {indicator.text}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button onClick={handleNext}>
                {currentIndex + 1 >= totalQuestions
                  ? 'Показать итог'
                  : 'Следующий сценарий'}
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
