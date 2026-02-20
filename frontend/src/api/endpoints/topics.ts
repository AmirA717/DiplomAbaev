import { request } from '../client';
import { Material, PaginatedResponse, Topic } from '../types';

interface TopicsQuery extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  limit?: number;
  search?: string;
}

export const topicsApi = {
  list(params: TopicsQuery = {}) {
    return request<PaginatedResponse<Topic>>('/topics', { query: params });
  },

  byId(id: number) {
    return request<Topic>(`/topics/${id}`);
  },

  materials(id: number) {
    return request<Material[]>(`/topics/${id}/materials`);
  },
};


