import { useQuery } from '@tanstack/react-query';
import { topicsApi } from '../../api/endpoints/topics';

interface TopicsParams extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  limit?: number;
  search?: string;
}

export function useTopics(params: TopicsParams = {}) {
  return useQuery({
    queryKey: ['topics', params],
    queryFn: () => topicsApi.list(params),
  });
}

export function useTopic(topicId: number | null) {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: () => topicsApi.byId(topicId as number),
    enabled: Number.isFinite(topicId),
  });
}

export function useTopicMaterials(topicId: number | null) {
  return useQuery({
    queryKey: ['topic-materials', topicId],
    queryFn: () => topicsApi.materials(topicId as number),
    enabled: Number.isFinite(topicId),
  });
}


