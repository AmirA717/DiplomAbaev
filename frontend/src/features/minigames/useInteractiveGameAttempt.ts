import { useState } from 'react';
import { GameType } from '../../api/types';
import { useFinishGameAttempt, useStartGameAttempt } from '../games/hooks';

interface FinishInteractiveAttemptInput {
  engine: GameType;
  score: number;
  total: number;
  pointsEarned: number;
  details: Record<string, unknown>;
}

export function useInteractiveGameAttempt(gameId: number | null) {
  const startAttemptMutation = useStartGameAttempt();
  const finishAttemptMutation = useFinishGameAttempt();
  const [attemptId, setAttemptId] = useState<number | null>(null);

  const start = async () => {
    if (!gameId) {
      throw new Error('Game id is required to start an attempt');
    }

    if (attemptId) {
      return attemptId;
    }

    const startedAttempt = await startAttemptMutation.mutateAsync(gameId);
    setAttemptId(startedAttempt.id);
    return startedAttempt.id;
  };

  const finish = async (input: FinishInteractiveAttemptInput) => {
    const activeAttemptId = attemptId ?? (await start());
    const accuracyPercent =
      input.total > 0 ? Math.round((input.score / input.total) * 100) : 0;
    const result = {
      engine: input.engine,
      score: input.score,
      total: input.total,
      accuracyPercent,
      details: input.details,
    };

    const response = await finishAttemptMutation.mutateAsync({
      attemptId: activeAttemptId,
      pointsEarned: input.pointsEarned,
      result,
    });

    setAttemptId(null);

    return {
      response,
      result,
    };
  };

  const reset = () => {
    setAttemptId(null);
  };

  return {
    attemptId,
    hasActiveAttempt: attemptId !== null,
    start,
    finish,
    reset,
    isBusy: startAttemptMutation.isPending || finishAttemptMutation.isPending,
    isStarting: startAttemptMutation.isPending,
    isFinishing: finishAttemptMutation.isPending,
  };
}
