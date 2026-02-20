import { buildAnswerPayloads } from '../adapters/quizSubmission';
import { request } from '../client';
import { PaginatedResponse, Quiz, QuizAttempt, QuizQuestion, QuizSubmitResult } from '../types';

export const quizzesApi = {
  list(topicId?: number) {
    return request<PaginatedResponse<Quiz>>('/quizzes', {
      query: topicId ? { topicId } : undefined,
    });
  },

  byId(id: number) {
    return request<Quiz>(`/quizzes/${id}`);
  },

  questions(quizId: number) {
    return request<QuizQuestion[]>(`/quizzes/${quizId}/questions`);
  },

  startAttempt(quizId: number) {
    return request<QuizAttempt>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
    });
  },

  answerAttempt(attemptId: number, payload: { questionId: number; answerIds: number[] }) {
    return request(`/quizzes/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: payload,
    });
  },

  async submitAttempt(attemptId: number, answers: Record<number, number[]>) {
    const payloads = buildAnswerPayloads(answers);

    await Promise.all(
      payloads.map((payload) => quizzesApi.answerAttempt(attemptId, payload)),
    );

    return request<QuizSubmitResult>(`/quizzes/attempts/${attemptId}/submit`, {
      method: 'POST',
    });
  },
};


