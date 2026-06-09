import { FormEvent, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Game } from '../../api/types';
import { normalizeApiError } from '../../api/errors';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { Textarea } from '../../components/ui/Textarea';
import {
  appPermissionAuditConfigSchema,
  backupStrategyConfigSchema,
  mfaChallengeConfigSchema,
  safeDownloadsConfigSchema,
  updateTriageConfigSchema,
} from '../../features/minigames/config';
import { AppPermissionAuditGame } from '../../features/minigames/engines/AppPermissionAuditGame';
import { BackupStrategyGame } from '../../features/minigames/engines/BackupStrategyGame';
import { MfaChallengeGame } from '../../features/minigames/engines/MfaChallengeGame';
import { SafeDownloadsGame } from '../../features/minigames/engines/SafeDownloadsGame';
import { UpdateTriageGame } from '../../features/minigames/engines/UpdateTriageGame';
import { gameTypeLabels } from '../../features/minigames/gameTypeMeta';
import {
  useFinishGameAttempt,
  useGame,
  useStartGameAttempt,
} from '../../features/games/hooks';

function ManualGameFallback({ gameId }: { gameId: number }) {
  const startAttemptMutation = useStartGameAttempt();
  const finishAttemptMutation = useFinishGameAttempt();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [notes, setNotes] = useState('');

  const isBusy = startAttemptMutation.isPending || finishAttemptMutation.isPending;

  const startAttempt = async () => {
    try {
      const startedAttempt = await startAttemptMutation.mutateAsync(gameId);
      setAttemptId(startedAttempt.id);
      setResultMessage('Попытка игры запущена. Заполните результат и завершите её.');
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
      toast.success('Результат игры сохранён');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  return (
    <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
      <div className="space-y-4">
        <p className="text-slate-700">
          Для этого типа игры пока используется ручной режим: нажмите `Старт`,
          затем укажите итоговые очки и заметки, после чего завершите попытку.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={startAttempt} disabled={isBusy || attemptId !== null}>
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
            placeholder="Например: выполнено 4 из 5 шагов"
          />

          <Button type="submit" disabled={attemptId === null || isBusy}>
            {finishAttemptMutation.isPending ? 'Сохраняем...' : 'Завершить попытку'}
          </Button>
        </form>

        {resultMessage ? (
          <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-3 text-emerald-800">
            {resultMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function renderGameContent(game: Game) {
  switch (game.type) {
    case 'MFA_CHALLENGE': {
      const parsed = mfaChallengeConfigSchema.safeParse(game.config);
      return parsed.success ? (
        <MfaChallengeGame gameId={game.id} config={parsed.data} />
      ) : (
        <ErrorState message="Конфиг игры MFA_CHALLENGE повреждён или неполон." />
      );
    }
    case 'UPDATE_TRIAGE': {
      const parsed = updateTriageConfigSchema.safeParse(game.config);
      return parsed.success ? (
        <UpdateTriageGame gameId={game.id} config={parsed.data} />
      ) : (
        <ErrorState message="Конфиг игры UPDATE_TRIAGE повреждён или неполон." />
      );
    }
    case 'BACKUP_STRATEGY': {
      const parsed = backupStrategyConfigSchema.safeParse(game.config);
      return parsed.success ? (
        <BackupStrategyGame gameId={game.id} config={parsed.data} />
      ) : (
        <ErrorState message="Конфиг игры BACKUP_STRATEGY повреждён или неполон." />
      );
    }
    case 'SAFE_DOWNLOADS': {
      const parsed = safeDownloadsConfigSchema.safeParse(game.config);
      return parsed.success ? (
        <SafeDownloadsGame gameId={game.id} config={parsed.data} />
      ) : (
        <ErrorState message="Конфиг игры SAFE_DOWNLOADS повреждён или неполон." />
      );
    }
    case 'APP_PERMISSION_AUDIT': {
      const parsed = appPermissionAuditConfigSchema.safeParse(game.config);
      return parsed.success ? (
        <AppPermissionAuditGame gameId={game.id} config={parsed.data} />
      ) : (
        <ErrorState message="Конфиг игры APP_PERMISSION_AUDIT повреждён или неполон." />
      );
    }
    case 'QUIZ_SIMULATION':
    case 'SOCIAL_NETWORK_SCENARIO':
      return <ManualGameFallback gameId={game.id} />;
    default:
      return (
        <ErrorState message="Для этого типа игры пока не настроен экран запуска." />
      );
  }
}

export function GamePlayPage() {
  const { gameId } = useParams();
  const parsedGameId = Number(gameId);
  const isValidGameId = Number.isFinite(parsedGameId);

  const gameQuery = useGame(isValidGameId ? parsedGameId : null);

  if (!isValidGameId) {
    return <ErrorState message="Некорректный идентификатор игры." />;
  }

  if (gameQuery.isLoading) {
    return <Loader label="Загружаем игру..." />;
  }

  if (gameQuery.isError) {
    return <ErrorState message={normalizeApiError(gameQuery.error).message} />;
  }

  const game = gameQuery.data;
  if (!game) {
    return <ErrorState message="Игра не найдена." />;
  }

  if (game.type === 'PHISHING_DETECTOR') {
    return <Navigate to="/mini-games/phishing" replace />;
  }

  if (game.type === 'PASSWORD_STRENGTH') {
    return <Navigate to="/mini-games/password" replace />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{game.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Тип игры: {gameTypeLabels[game.type]}
            </p>
          </div>
          <Link to="/">
            <Button variant="secondary">Назад на главную</Button>
          </Link>
        </div>
      </section>

      {renderGameContent(game)}
    </div>
  );
}
