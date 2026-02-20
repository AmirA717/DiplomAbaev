import { useMutation, useQuery } from '@tanstack/react-query';
import { quizzesApi } from '../../api/endpoints/quizzes';

export function useQuizzes(topicId?: number) {
  return useQuery({
    queryKey: ['quizzes', topicId],
    queryFn: () => quizzesApi.list(topicId),
  });
}

export function useQuiz(quizId: number | null) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizzesApi.byId(quizId as number),
    enabled: Number.isFinite(quizId),
  });
}

export function useQuizQuestions(quizId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => quizzesApi.questions(quizId as number),
    enabled: enabled && Number.isFinite(quizId),
  });
}

export function useStartQuizAttempt() {
  return useMutation({
    mutationFn: (quizId: number) => quizzesApi.startAttempt(quizId),
  });
}

export function useSubmitQuizAttempt() {
  return useMutation({
    mutationFn: (params: { attemptId: number; answers: Record<number, number[]> }) =>
      quizzesApi.submitAttempt(params.attemptId, params.answers),
  });
}


