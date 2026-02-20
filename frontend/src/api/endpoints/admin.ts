import { request } from '../client';
import {
  AdminLearnerStats,
  AdminOverview,
  AdminQuestion,
  AdminQuiz,
  PaginatedResponse,
  QuestionType,
  Topic,
} from '../types';

interface AdminListQuery extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  limit?: number;
  search?: string;
}

interface TopicPayload {
  title: string;
  description?: string;
  slug: string;
  order?: number;
  isPublished?: boolean;
}

interface QuizPayload {
  topicId?: number;
  name?: string;
  description?: string;
  order?: number;
  passingScore?: number;
  isPublished?: boolean;
}

interface QuestionAnswerPayload {
  text: string;
  isCorrect?: boolean;
  order?: number;
}

interface UpdateQuestionPayload {
  quizId?: number;
  text?: string;
  type?: QuestionType;
  explanation?: string;
  points?: number;
  order?: number;
  answers?: QuestionAnswerPayload[];
}

export const adminApi = {
  statsOverview() {
    return request<AdminOverview>('/admin/stats/overview');
  },

  statsLearners(params: AdminListQuery = {}) {
    return request<PaginatedResponse<AdminLearnerStats>>('/admin/stats/learners', {
      query: params,
    });
  },

  listTopics(params: AdminListQuery = {}) {
    return request<PaginatedResponse<Topic>>('/admin/topics', { query: params });
  },

  createTopic(payload: TopicPayload) {
    return request('/admin/topics', {
      method: 'POST',
      body: payload,
    });
  },

  updateTopic(id: number, payload: Partial<TopicPayload>) {
    return request(`/admin/topics/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  deleteTopic(id: number) {
    return request(`/admin/topics/${id}`, {
      method: 'DELETE',
    });
  },

  listQuizzes(params: AdminListQuery & { topicId?: number } = {}) {
    return request<PaginatedResponse<AdminQuiz>>('/admin/quizzes', { query: params });
  },

  updateQuiz(id: number, payload: QuizPayload) {
    return request(`/admin/quizzes/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  quizQuestions(quizId: number) {
    return request<AdminQuestion[]>(`/admin/quizzes/${quizId}/questions`);
  },

  updateQuestion(id: number, payload: UpdateQuestionPayload) {
    return request(`/admin/questions/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  createEntity(path: 'materials' | 'games' | 'quizzes' | 'questions' | 'achievements', payload: Record<string, unknown>) {
    return request(`/admin/${path}`, {
      method: 'POST',
      body: payload,
    });
  },

  updateEntity(path: 'materials' | 'games' | 'quizzes' | 'questions' | 'achievements', id: number, payload: Record<string, unknown>) {
    return request(`/admin/${path}/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  deleteEntity(path: 'materials' | 'games' | 'quizzes' | 'questions' | 'achievements', id: number) {
    return request(`/admin/${path}/${id}`, {
      method: 'DELETE',
    });
  },
};


