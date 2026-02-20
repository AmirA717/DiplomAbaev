import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints/admin';
import { QuestionType } from '../../api/types';

interface AdminListParams extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  limit?: number;
  search?: string;
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.statsOverview(),
  });
}

export function useAdminLearners(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin-learners', params],
    queryFn: () => adminApi.statsLearners(params),
  });
}

export function useAdminTopics(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin-topics', params],
    queryFn: () => adminApi.listTopics(params),
  });
}

export function useAdminQuizzes(params: AdminListParams & { topicId?: number } = {}) {
  return useQuery({
    queryKey: ['admin-quizzes', params],
    queryFn: () => adminApi.listQuizzes(params),
  });
}

export function useAdminQuizQuestions(quizId: number | null) {
  return useQuery({
    queryKey: ['admin-quiz-questions', quizId],
    queryFn: () => adminApi.quizQuestions(quizId as number),
    enabled: Number.isFinite(quizId),
  });
}

export function useAdminTopicMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['topics'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-topics'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
  };

  const createTopic = useMutation({
    mutationFn: adminApi.createTopic,
    onSuccess: invalidate,
  });

  const updateTopic = useMutation({
    mutationFn: (params: { id: number; payload: { title?: string; description?: string; slug?: string; order?: number; isPublished?: boolean } }) =>
      adminApi.updateTopic(params.id, params.payload),
    onSuccess: invalidate,
  });

  const deleteTopic = useMutation({
    mutationFn: (id: number) => adminApi.deleteTopic(id),
    onSuccess: invalidate,
  });

  return {
    createTopic,
    updateTopic,
    deleteTopic,
  };
}

export function useAdminQuizMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
  };

  const updateQuiz = useMutation({
    mutationFn: (params: {
      id: number;
      payload: {
        topicId?: number;
        name?: string;
        description?: string;
        order?: number;
        passingScore?: number;
        isPublished?: boolean;
      };
    }) => adminApi.updateQuiz(params.id, params.payload),
    onSuccess: invalidate,
  });

  return { updateQuiz };
}

export function useAdminQuestionMutations() {
  const queryClient = useQueryClient();

  const updateQuestion = useMutation({
    mutationFn: (params: {
      id: number;
      payload: {
        quizId?: number;
        text?: string;
        type?: QuestionType;
        explanation?: string;
        points?: number;
        order?: number;
        answers?: Array<{ text: string; isCorrect?: boolean; order?: number }>;
      };
    }) => adminApi.updateQuestion(params.id, params.payload),
    onSuccess: (_data, variables) => {
      if (variables.payload.quizId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: ['admin-quiz-questions', variables.payload.quizId],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
    },
  });

  return { updateQuestion };
}


