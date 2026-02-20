import { normalizeApiError } from '../../api/errors';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Loader } from '../../components/ui/Loader';
import { useUserAchievements, useUserStats } from '../../features/profile/hooks';
import { toPercent } from '../../utils/format';

export function StatsPage() {
  const statsQuery = useUserStats();
  const achievementsQuery = useUserAchievements();

  if (statsQuery.isLoading || achievementsQuery.isLoading) {
    return <Loader label="Загружаем статистику..." />;
  }

  if (statsQuery.isError) {
    return <ErrorState message={normalizeApiError(statsQuery.error).message} />;
  }

  if (achievementsQuery.isError) {
    return <ErrorState message={normalizeApiError(achievementsQuery.error).message} />;
  }

  const stats = statsQuery.data;
  if (!stats) {
    return <Loader label="Статистика не найдена..." />;
  }

  const achievements = achievementsQuery.data ?? [];
  const scorePercent =
    stats.scoreSummary.possible === 0
      ? 0
      : (stats.scoreSummary.earned / stats.scoreSummary.possible) * 100;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Мой прогресс</h1>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Очки</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.totalPoints}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Викторины</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.completedQuizzes}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Игры</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.completedGames}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Завершенные темы</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.completedTopics}</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border-2 border-slate-500 bg-slate-100 p-4">
          <p className="text-sm text-slate-600">Точность по викторинам</p>
          <div className="mt-2 h-6 overflow-hidden rounded border-2 border-slate-500 bg-slate-200">
            <div className="h-full bg-slate-700 text-center text-xs leading-5 text-white" style={{ width: toPercent(scorePercent) }}>
              {toPercent(scorePercent)}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-700">
            {stats.scoreSummary.earned} из {stats.scoreSummary.possible} возможных баллов
          </p>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Прогресс по темам</h2>
        {stats.topicProgresses.length === 0 ? (
          <EmptyState title="Прогресс пока пуст" description="Пройдите первую игру или викторину, чтобы увидеть аналитику." />
        ) : (
          <div className="mt-4 space-y-3">
            {stats.topicProgresses.map((progress) => (
              <article key={progress.id} className="rounded-lg border-2 border-slate-400 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{progress.topic.title}</p>
                <p className="text-sm text-slate-700">
                  Игры: {progress.completedGamesCount} • Викторины: {progress.completedQuizzesCount} • Лучший результат: {progress.bestQuizScore}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Достижения</h2>
        {achievements.length === 0 ? (
          <EmptyState title="Достижения не получены" description="Завершайте темы и игры, чтобы открыть награды." />
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((item) => (
              <article key={`${item.achievement.id}-${item.earnedAt ?? 'na'}`} className="rounded-lg border-2 border-slate-400 bg-slate-50 p-4">
                <p className="text-lg">{item.achievement.icon ?? '??'}</p>
                <p className="mt-1 font-semibold text-slate-900">{item.achievement.title ?? item.achievement.name}</p>
                <p className="mt-1 text-sm text-slate-700">{item.achievement.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


