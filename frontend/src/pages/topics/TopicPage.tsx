import { Link, useParams } from 'react-router-dom';
import { normalizeApiError } from '../../api/errors';
import { GameCard } from '../../components/common/GameCard';
import { QuizCard } from '../../components/common/QuizCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Loader } from '../../components/ui/Loader';
import { useGames } from '../../features/games/hooks';
import { useQuizzes } from '../../features/quizzes/hooks';
import { useTopic, useTopicMaterials } from '../../features/topics/hooks';

const materialTypeLabels: Record<'TEXT' | 'VIDEO' | 'LINK', string> = {
  TEXT: 'Текст',
  VIDEO: 'Видео',
  LINK: 'Ссылка',
};

export function TopicPage() {
  const { topicId } = useParams();
  const parsedTopicId = Number(topicId);
  const isValidTopicId = Number.isFinite(parsedTopicId);

  const topicQuery = useTopic(isValidTopicId ? parsedTopicId : null);
  const materialsQuery = useTopicMaterials(isValidTopicId ? parsedTopicId : null);
  const gamesQuery = useGames(isValidTopicId ? parsedTopicId : undefined);
  const quizzesQuery = useQuizzes(isValidTopicId ? parsedTopicId : undefined);

  if (!isValidTopicId) {
    return <ErrorState message="Некорректный идентификатор темы." />;
  }

  if (topicQuery.isLoading) {
    return <Loader label="Загружаем тему..." />;
  }

  if (topicQuery.isError) {
    return <ErrorState message={normalizeApiError(topicQuery.error).message} />;
  }

  const topic = topicQuery.data;
  if (!topic) {
    return <Loader label="Тема не найдена..." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{topic.title}</h1>
            <p className="mt-2 text-slate-600">
              {topic.description ?? 'Описание темы отсутствует.'}
            </p>
          </div>
          <Link to="/">
            <Button variant="secondary">Назад на главную</Button>
          </Link>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Материалы</h2>
        {materialsQuery.isLoading ? <Loader label="Загружаем материалы..." /> : null}
        {materialsQuery.isError ? (
          <ErrorState message={normalizeApiError(materialsQuery.error).message} />
        ) : null}

        {!materialsQuery.isLoading && !materialsQuery.isError ? (
          <div className="mt-4 space-y-3">
            {(materialsQuery.data ?? []).length === 0 ? (
              <EmptyState title="Материалов пока нет" description="Администратор еще не добавил контент для темы." />
            ) : (
              (materialsQuery.data ?? []).map((material) => (
                <article key={material.id} className="rounded-lg border-2 border-slate-400 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    {materialTypeLabels[material.type]}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-700">{material.content}</p>
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Игры по теме</h2>
          {gamesQuery.isLoading ? <Loader label="Загружаем игры..." /> : null}
          {gamesQuery.isError ? <ErrorState message={normalizeApiError(gamesQuery.error).message} /> : null}
          {!gamesQuery.isLoading && !gamesQuery.isError ? (
            <div className="mt-4 space-y-3">
              {(gamesQuery.data?.items ?? []).length === 0 ? (
                <EmptyState title="Игры не найдены" description="Для темы пока нет игр." />
              ) : (
                (gamesQuery.data?.items ?? []).map((game) => <GameCard key={game.id} game={game} />)
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Викторины по теме</h2>
          {quizzesQuery.isLoading ? <Loader label="Загружаем викторины..." /> : null}
          {quizzesQuery.isError ? (
            <ErrorState message={normalizeApiError(quizzesQuery.error).message} />
          ) : null}
          {!quizzesQuery.isLoading && !quizzesQuery.isError ? (
            <div className="mt-4 space-y-3">
              {(quizzesQuery.data?.items ?? []).length === 0 ? (
                <EmptyState title="Викторины не найдены" description="Для темы пока нет викторин." />
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


