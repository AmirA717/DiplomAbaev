import { useMutation, useQuery } from '@tanstack/react-query';
import { gamesApi } from '../../api/endpoints/games';

export function useGames(topicId?: number) {
  return useQuery({
    queryKey: ['games', topicId],
    queryFn: () => gamesApi.list(topicId),
  });
}

export function useGame(gameId: number | null) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gamesApi.byId(gameId as number),
    enabled: Number.isFinite(gameId),
  });
}

export function useStartGameAttempt() {
  return useMutation({
    mutationFn: (gameId: number) => gamesApi.startAttempt(gameId),
  });
}

export function useFinishGameAttempt() {
  return useMutation({
    mutationFn: (params: { attemptId: number; pointsEarned: number; result?: Record<string, unknown> }) =>
      gamesApi.finishAttempt(params.attemptId, {
        pointsEarned: params.pointsEarned,
        result: params.result,
      }),
  });
}


