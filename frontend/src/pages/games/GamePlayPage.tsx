import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { normalizeApiError } from '../../api/errors';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { Textarea } from '../../components/ui/Textarea';
import { useFinishGameAttempt, useGame, useStartGameAttempt } from '../../features/games/hooks';

const gameTypeLabels: Record<
  'QUIZ_SIMULATION' | 'PHISHING_DETECTOR' | 'PASSWORD_STRENGTH' | 'SOCIAL_NETWORK_SCENARIO',
  string
> = {
  QUIZ_SIMULATION: 'Симуляция викторины',
  PHISHING_DETECTOR: 'Детектор фишинга',
  PASSWORD_STRENGTH: 'Надёжность пароля',
  SOCIAL_NETWORK_SCENARIO: 'Сценарий в соцсетях',
};

export function GamePlayPage() {
  const { gameId } = useParams();
  const parsedGameId = Number(gameId);
  const isValidGameId = Number.isFinite(parsedGameId);

  const gameQuery = useGame(isValidGameId ? parsedGameId : null);
  const startAttemptMutation = useStartGameAttempt();
  const finishAttemptMutation = useFinishGameAttempt();

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const isBusy = startAttemptMutation.isPending || finishAttemptMutation.isPending;

  const startAttempt = async () => {
    if (!isValidGameId) {
      return;
    }

    try {
      const startedAttempt = await startAttemptMutation.mutateAsync(parsedGameId);
      setAttemptId(startedAttempt.id);
      setResultMessage('Попытка игры запущена. Заполните результат и завершите.');
      toast.success('Попытка начата');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const finishAttempt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!attemptId) {
      toast.error('Сначала запустите попытку игры');
      return;
    }

    try {
      const result = await finishAttemptMutation.mutateAsync({
        attemptId,
        pointsEarned,
        result: {
          notes,
          finishedAt: new Date().toISOString(),
        },
      });

      setResultMessage(`Попытка #${result.attemptId} завершена. Очки: ${result.pointsEarned}.`);
      setAttemptId(null);
      setNotes('');
      setPointsEarned(0);
      toast.success('Результат игры сохранен');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const game = useMemo(() => gameQuery.data, [gameQuery.data]);

  if (!isValidGameId) {
    return <ErrorState message="Некорректный идентификатор игры." />;
  }

  if (gameQuery.isLoading) {
    return <Loader label="Загружаем игру..." />;
  }

  if (gameQuery.isError) {
    return <ErrorState message={normalizeApiError(gameQuery.error).message} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{game?.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Тип игры: {game ? gameTypeLabels[game.type] : ''}
            </p>
          </div>
          <Link to="/">
            <Button variant="secondary">Назад на главную</Button>
          </Link>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="space-y-4">
          <p className="text-slate-700">
            Нажмите "Старт", затем укажите итоговые очки и заметки. После этого завершите попытку.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={startAttempt} disabled={isBusy || Boolean(attemptId)}>
              {attemptId ? `Попытка #${attemptId} активна` : 'Старт попытки'}
            </Button>
          </div>

          <form className="space-y-4" onSubmit={finishAttempt} noValidate>
            <Input
              label="Очки за игру"
              type="number"
              min={0}
              value={String(pointsEarned)}
              onChange={(event) => setPointsEarned(Math.max(0, Number(event.target.value)))}
            />

            <Textarea
              label="Комментарий / результат"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Например: найдено 3 фишинговых признака"
            />

            <Button type="submit" disabled={!attemptId || isBusy}>
              {finishAttemptMutation.isPending ? 'Сохраняем...' : 'Завершить попытку'}
            </Button>
          </form>

          {resultMessage ? (
            <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-3 text-emerald-800">{resultMessage}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}


