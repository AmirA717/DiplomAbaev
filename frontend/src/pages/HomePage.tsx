import { useState } from 'react';
import { normalizeApiError } from '../api/errors';
import { GameCard } from '../components/common/GameCard';
import { QuizCard } from '../components/common/QuizCard';
import { TopicCard } from '../components/common/TopicCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Loader } from '../components/ui/Loader';
import { useGames } from '../features/games/hooks';
import { useQuizzes } from '../features/quizzes/hooks';
import { useTopics } from '../features/topics/hooks';

export function HomePage() {
  const topicsQuery = useTopics({ page: 1, limit: 12 });
  const [manualTopicId, setManualTopicId] = useState<number | undefined>(undefined);
  const selectedTopicId = manualTopicId ?? topicsQuery.data?.items[0]?.id;

  const gamesQuery = useGames(selectedTopicId);
  const quizzesQuery = useQuizzes(selectedTopicId);

  const selectedTopic = topicsQuery.data?.items.find((topic) => topic.id === selectedTopicId);

  if (topicsQuery.isLoading) {
    return <Loader label="Загружаем темы и активности..." />;
  }

  if (topicsQuery.isError) {
    return <ErrorState message={normalizeApiError(topicsQuery.error).message} />;
  }

  const topics = topicsQuery.data?.items ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Главная</h1>
        <p className="mt-2 text-slate-600">Выберите тему и переходите к играм, материалам и викторинам.</p>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Темы</h2>
          {selectedTopic ? (
            <p className="rounded-lg border-2 border-slate-500 bg-slate-100 px-3 py-1 text-sm text-slate-700">
              Активная тема: {selectedTopic.title}
            </p>
          ) : null}
        </div>

        {topics.length === 0 ? (
          <EmptyState title="Темы не найдены" description="Администратор пока не опубликовал учебные темы." />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setManualTopicId(topic.id)}
                  className={`rounded-md border-2 px-3 py-1 text-sm ${
                    selectedTopicId === topic.id
                      ? 'border-slate-900 bg-slate-700 text-white'
                      : 'border-slate-500 bg-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Мини-игры</h2>
          <p className="mt-1 text-sm text-slate-600">Игры по выбранной теме.</p>

          {gamesQuery.isLoading ? <Loader label="Загружаем игры..." /> : null}
          {gamesQuery.isError ? (
            <ErrorState message={normalizeApiError(gamesQuery.error).message} />
          ) : null}

          {!gamesQuery.isLoading && !gamesQuery.isError ? (
            <div className="mt-4 space-y-3">
              {(gamesQuery.data?.items ?? []).length === 0 ? (
                <EmptyState
                  title="Игры не найдены"
                  description="Для этой темы игры пока не опубликованы."
                />
              ) : (
                (gamesQuery.data?.items ?? []).map((game) => <GameCard key={game.id} game={game} />)
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Викторины</h2>
          <p className="mt-1 text-sm text-slate-600">Проверьте знания по выбранной теме.</p>

          {quizzesQuery.isLoading ? <Loader label="Загружаем викторины..." /> : null}
          {quizzesQuery.isError ? (
            <ErrorState message={normalizeApiError(quizzesQuery.error).message} />
          ) : null}

          {!quizzesQuery.isLoading && !quizzesQuery.isError ? (
            <div className="mt-4 space-y-3">
              {(quizzesQuery.data?.items ?? []).length === 0 ? (
                <EmptyState
                  title="Викторины не найдены"
                  description="Для этой темы викторины пока не опубликованы."
                />
              ) : (
                (quizzesQuery.data?.items ?? []).map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}


