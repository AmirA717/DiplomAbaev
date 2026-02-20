import { request } from '../client';
import { FinishedGameAttempt, Game, GameAttempt, PaginatedResponse } from '../types';

export const gamesApi = {
  list(topicId?: number) {
    return request<PaginatedResponse<Game>>('/games', {
      query: topicId ? { topicId } : undefined,
    });
  },

  byId(id: number) {
    return request<Game>(`/games/${id}`);
  },

  startAttempt(gameId: number) {
    return request<GameAttempt>(`/games/${gameId}/attempts`, {
      method: 'POST',
    });
  },

  finishAttempt(attemptId: number, payload: { pointsEarned: number; result?: Record<string, unknown> }) {
    return request<FinishedGameAttempt, { pointsEarned: number; result?: Record<string, unknown> }>(
      `/games/attempts/${attemptId}/finish`,
      {
        method: 'PATCH',
        body: payload,
      },
    );
  },
};


