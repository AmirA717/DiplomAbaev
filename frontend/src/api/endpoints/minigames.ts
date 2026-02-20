import { request } from '../client';
import {
  PaginatedResponse,
  PhishingScenario,
  SaveMinigameResultPayload,
  SaveMinigameResultResponse,
} from '../types';

export const minigamesApi = {
  getPhishingScenarios(limit = 10) {
    return request<PaginatedResponse<PhishingScenario>>(
      '/api/minigames/phishing/scenarios',
      {
        query: { limit },
      },
    );
  },

  saveResult(payload: SaveMinigameResultPayload) {
    return request<SaveMinigameResultResponse, SaveMinigameResultPayload>(
      '/api/minigames/results',
      {
        method: 'POST',
        body: payload,
      },
    );
  },
};
