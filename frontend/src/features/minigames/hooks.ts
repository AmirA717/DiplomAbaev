import { useMutation, useQuery } from '@tanstack/react-query';
import { minigamesApi } from '../../api/endpoints/minigames';
import { SaveMinigameResultPayload } from '../../api/types';

export function usePhishingScenarios(limit = 10) {
  return useQuery({
    queryKey: ['minigames', 'phishing-scenarios', limit],
    queryFn: () => minigamesApi.getPhishingScenarios(limit),
  });
}

export function useSaveMinigameResult() {
  return useMutation({
    mutationFn: (payload: SaveMinigameResultPayload) =>
      minigamesApi.saveResult(payload),
  });
}
