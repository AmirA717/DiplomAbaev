import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { normalizeApiError } from '../../api/errors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSaveMinigameResult } from '../../features/minigames/hooks';
import {
  evaluatePassword,
  generatePasswordSuggestions,
  getLevelLabel,
  isChallengeCompleted,
  PASSWORD_CHALLENGES,
} from '../../features/minigames/passwordStrength';

function getMeterColor(score: number): string {
  if (score >= 85) {
    return 'bg-emerald-600';
  }
  if (score >= 70) {
    return 'bg-lime-600';
  }
  if (score >= 50) {
    return 'bg-amber-500';
  }
  if (score >= 30) {
    return 'bg-orange-500';
  }
  return 'bg-red-500';
}

export function PasswordStrengthGamePage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(
    generatePasswordSuggestions(),
  );
  const [resultSaved, setResultSaved] = useState(false);

  const saveResultMutation = useSaveMinigameResult();
  const evaluation = useMemo(() => evaluatePassword(password), [password]);
  const completedChallenges = PASSWORD_CHALLENGES.filter((challenge) =>
    isChallengeCompleted(challenge, password, evaluation),
  ).length;

  const handleGenerate = () => {
    setSuggestions(generatePasswordSuggestions());
  };

  const handleUseSuggestion = (suggestion: string) => {
    setPassword(suggestion);
    toast.success('Вариант подставлен в поле пароля');
  };

  const handleSaveResult = async () => {
    try {
      const response = await saveResultMutation.mutateAsync({
        type: 'PASSWORD_STRENGTH',
        score: evaluation.score,
        total: 100,
        pointsEarned: Math.round(evaluation.score / 2),
        details: {
          entropy: evaluation.entropy,
          level: evaluation.level,
          completedChallenges,
          totalChallenges: PASSWORD_CHALLENGES.length,
        },
      });

      if (response.saved) {
        setResultSaved(true);
        toast.success('Результат мини-игры сохранён');
        return;
      }

      toast.warning('Результат не сохранён: игра этого типа не настроена в админке');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Создай надёжный пароль
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Проверяйте устойчивость пароля и улучшайте его до целевого уровня.
            </p>
          </div>
          <Link to="/">
            <Button variant="ghost">На главную</Button>
          </Link>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="space-y-4">
          <Input
            label="Введите пароль"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setResultSaved(false);
            }}
            placeholder="Пример: F0rest!Signal#2026"
            autoComplete="off"
          />

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            </Button>
            <Button
              onClick={handleSaveResult}
              disabled={!password || resultSaved || saveResultMutation.isPending}
            >
              {resultSaved
                ? 'Результат сохранён'
                : saveResultMutation.isPending
                  ? 'Сохраняем...'
                  : 'Сохранить результат'}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>
                Сила: {getLevelLabel(evaluation.level)} ({evaluation.score}/100)
              </span>
              <span>Энтропия: {evaluation.entropy} bit</span>
            </div>
            <div className="h-3 rounded-full border-2 border-slate-400 bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${getMeterColor(
                  evaluation.score,
                )}`}
                style={{ width: `${evaluation.score}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Почему пароль такой</h2>
          <ul className="mt-4 space-y-2">
            {evaluation.feedback.map((item) => (
              <li
                key={item}
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-5 text-base font-semibold text-slate-900">Проверки</h3>
          <ul className="mt-3 space-y-2">
            {evaluation.checks.map((check) => (
              <li
                key={check.key}
                className={`rounded-md border px-3 py-2 text-sm ${
                  check.passed
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : 'border-slate-300 bg-slate-50 text-slate-700'
                }`}
              >
                {check.passed ? '✓' : '•'} {check.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Режим генератора</h2>
              <Button variant="secondary" onClick={handleGenerate}>
                Обновить 3 варианта
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="rounded-lg border-2 border-slate-300 bg-slate-50 p-3"
                >
                  <p className="break-all font-mono text-sm text-slate-800">{suggestion}</p>
                  <div className="mt-2">
                    <Button variant="ghost" onClick={() => handleUseSuggestion(suggestion)}>
                      Использовать
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">Мини-задания</h2>
            <p className="mt-1 text-sm text-slate-600">
              Выполнено: {completedChallenges}/{PASSWORD_CHALLENGES.length}
            </p>
            <div className="mt-4 space-y-3">
              {PASSWORD_CHALLENGES.map((challenge) => {
                const completed = isChallengeCompleted(challenge, password, evaluation);
                return (
                  <article
                    key={challenge.id}
                    className={`rounded-lg border-2 p-3 ${
                      completed
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="font-medium">{challenge.title}</p>
                    <p className="mt-1 text-sm">{challenge.description}</p>
                    <p className="mt-2 text-xs">
                      Цель: score ≥ {challenge.targetScore}, длина ≥ {challenge.minLength}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
