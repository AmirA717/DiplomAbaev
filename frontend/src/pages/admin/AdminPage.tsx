import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { normalizeApiError } from '../../api/errors';
import { AdminQuestion, QuestionType } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { Textarea } from '../../components/ui/Textarea';
import {
  useAdminLearners,
  useAdminOverview,
  useAdminQuestionMutations,
  useAdminQuizMutations,
  useAdminQuizQuestions,
  useAdminQuizzes,
  useAdminTopicMutations,
  useAdminTopics,
} from '../../features/admin/hooks';
import { adminTopicSchema } from '../../utils/validation';

interface EditableAnswer {
  text: string;
  isCorrect: boolean;
  order: number;
}

interface EditableQuestionForm {
  text: string;
  type: QuestionType;
  explanation: string;
  points: number;
  order: number;
  answers: EditableAnswer[];
}

const questionTypeOptions: Array<{ value: QuestionType; label: string }> = [
  { value: 'SINGLE', label: 'Один правильный ответ' },
  { value: 'MULTIPLE', label: 'Несколько правильных ответов' },
  { value: 'TRUE_FALSE', label: 'Верно / неверно' },
];

function toEditableQuestion(question: AdminQuestion): EditableQuestionForm {
  return {
    text: question.text,
    type: question.type,
    explanation: question.explanation ?? '',
    points: question.points,
    order: question.order,
    answers: question.answers.map((answer) => ({
      text: answer.text,
      isCorrect: answer.isCorrect,
      order: answer.order,
    })),
  };
}

export function AdminPage() {
  const overviewQuery = useAdminOverview();
  const topicsQuery = useAdminTopics({ page: 1, limit: 100 });
  const quizzesQuery = useAdminQuizzes({ page: 1, limit: 100 });
  const learnersQuery = useAdminLearners({ page: 1, limit: 100 });

  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [questionDraft, setQuestionDraft] = useState<EditableQuestionForm | null>(null);

  const questionsQuery = useAdminQuizQuestions(selectedQuizId);

  const { createTopic, updateTopic, deleteTopic } = useAdminTopicMutations();
  const { updateQuiz } = useAdminQuizMutations();
  const { updateQuestion } = useAdminQuestionMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminTopicSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      order: 0,
      isPublished: true,
    },
  });

  const quizzes = quizzesQuery.data?.items ?? [];
  const selectedQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null,
    [quizzes, selectedQuizId],
  );

  useEffect(() => {
    if (!selectedQuizId && quizzes.length > 0) {
      setSelectedQuizId(quizzes[0].id);
    }
  }, [selectedQuizId, quizzes]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createTopic.mutateAsync({
        title: values.title,
        slug: values.slug,
        description: values.description || undefined,
        order: values.order,
        isPublished: values.isPublished,
      });
      toast.success('Тема создана');
      reset();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  });

  const toggleTopicPublish = async (topicId: number, currentState: boolean) => {
    try {
      await updateTopic.mutateAsync({
        id: topicId,
        payload: { isPublished: !currentState },
      });
      toast.success('Статус темы обновлён');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const removeTopic = async (topicId: number) => {
    try {
      await deleteTopic.mutateAsync(topicId);
      toast.success('Тема удалена');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const toggleQuizPublish = async (quizId: number, currentState: boolean) => {
    try {
      await updateQuiz.mutateAsync({
        id: quizId,
        payload: { isPublished: !currentState },
      });
      toast.success('Статус викторины обновлён');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const beginQuestionEdit = (question: AdminQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionDraft(toEditableQuestion(question));
  };

  const cancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setQuestionDraft(null);
  };

  const updateAnswerField = (
    answerIndex: number,
    field: keyof EditableAnswer,
    value: string | boolean | number,
  ) => {
    setQuestionDraft((previous) => {
      if (!previous) {
        return previous;
      }

      const nextAnswers = [...previous.answers];
      const nextAnswer = { ...nextAnswers[answerIndex] };

      if (field === 'text' && typeof value === 'string') {
        nextAnswer.text = value;
      }

      if (field === 'isCorrect' && typeof value === 'boolean') {
        nextAnswer.isCorrect = value;
      }

      if (field === 'order' && typeof value === 'number') {
        nextAnswer.order = value;
      }

      nextAnswers[answerIndex] = nextAnswer;
      return { ...previous, answers: nextAnswers };
    });
  };

  const saveQuestion = async () => {
    if (!selectedQuizId || !editingQuestionId || !questionDraft) {
      return;
    }

    if (questionDraft.text.trim().length < 2) {
      toast.error('Текст вопроса должен быть не короче 2 символов');
      return;
    }

    const normalizedAnswers = questionDraft.answers
      .map((answer) => ({
        text: answer.text.trim(),
        isCorrect: answer.isCorrect,
        order: answer.order,
      }))
      .filter((answer) => answer.text.length > 0);

    if (normalizedAnswers.length < 2) {
      toast.error('У вопроса должно быть минимум два варианта ответа');
      return;
    }

    if (!normalizedAnswers.some((answer) => answer.isCorrect)) {
      toast.error('Нужно отметить хотя бы один правильный ответ');
      return;
    }

    try {
      await updateQuestion.mutateAsync({
        id: editingQuestionId,
        payload: {
          quizId: selectedQuizId,
          text: questionDraft.text.trim(),
          type: questionDraft.type,
          explanation: questionDraft.explanation.trim() || undefined,
          points: questionDraft.points,
          order: questionDraft.order,
          answers: normalizedAnswers,
        },
      });
      toast.success('Вопрос обновлён');
      cancelQuestionEdit();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  if (
    overviewQuery.isLoading ||
    topicsQuery.isLoading ||
    quizzesQuery.isLoading ||
    learnersQuery.isLoading
  ) {
    return <Loader label="Загружаем админ-панель..." />;
  }

  if (overviewQuery.isError) {
    return <ErrorState message={normalizeApiError(overviewQuery.error).message} />;
  }

  if (topicsQuery.isError) {
    return <ErrorState message={normalizeApiError(topicsQuery.error).message} />;
  }

  if (quizzesQuery.isError) {
    return <ErrorState message={normalizeApiError(quizzesQuery.error).message} />;
  }

  if (learnersQuery.isError) {
    return <ErrorState message={normalizeApiError(learnersQuery.error).message} />;
  }

  const overview = overviewQuery.data;
  if (!overview) {
    return <Loader label="Загружаем админ-данные..." />;
  }

  const topics = topicsQuery.data?.items ?? [];
  const learners = learnersQuery.data?.items ?? [];
  const questions = questionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Админ-панель</h1>
        <p className="mt-2 text-slate-600">
          Управление контентом, вопросами викторин и статистикой обучающихся.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Пользователи</p>
            <p className="text-2xl font-semibold text-slate-900">{overview.usersCount}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Попытки викторин</p>
            <p className="text-2xl font-semibold text-slate-900">
              {overview.attemptsCount.quizzes}
            </p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Попытки игр</p>
            <p className="text-2xl font-semibold text-slate-900">{overview.attemptsCount.games}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Завершение викторин</p>
            <p className="text-2xl font-semibold text-slate-900">
              {overview.quizCompletionConversionPercent}%
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Добавление темы</h2>

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2" noValidate>
          <Input label="Название" error={errors.title?.message} {...register('title')} />
          <Input label="Слаг" error={errors.slug?.message} {...register('slug')} />
          <Input
            label="Описание"
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            label="Порядок"
            type="number"
            error={errors.order?.message}
            {...register('order')}
          />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4" {...register('isPublished')} />
            Опубликовать сразу
          </label>

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting || createTopic.isPending}>
              {createTopic.isPending ? 'Создаём...' : 'Создать тему'}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Управление темами</h2>
        <p className="mt-1 text-sm text-slate-600">Показаны все темы, включая черновики.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-200">
                <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">ID</th>
                <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Название</th>
                <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Слаг</th>
                <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Статус</th>
                <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id} className="bg-white">
                  <td className="border-2 border-slate-400 px-3 py-2 text-sm">{topic.id}</td>
                  <td className="border-2 border-slate-400 px-3 py-2 text-sm">{topic.title}</td>
                  <td className="border-2 border-slate-400 px-3 py-2 text-sm">{topic.slug}</td>
                  <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                    {topic.isPublished ? 'Опубликована' : 'Черновик'}
                  </td>
                  <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => toggleTopicPublish(topic.id, topic.isPublished)}
                        disabled={updateTopic.isPending}
                      >
                        {topic.isPublished ? 'Скрыть' : 'Опубликовать'}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => removeTopic(topic.id)}
                        disabled={deleteTopic.isPending}
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Управление викторинами</h2>
        <p className="mt-1 text-sm text-slate-600">Переключайте публикацию и редактируйте вопросы.</p>

        {quizzes.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Викторины отсутствуют"
              description="Сначала добавьте викторину в систему."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">ID</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Название</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Тема</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Вопросы</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Статус</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="bg-white">
                    <td className="border-2 border-slate-400 px-3 py-2 text-sm">{quiz.id}</td>
                    <td className="border-2 border-slate-400 px-3 py-2 text-sm">{quiz.name}</td>
                    <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                      {quiz.topic?.title ?? 'Без темы'}
                    </td>
                    <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                      {quiz._count.quizQuestions}
                    </td>
                    <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                      {quiz.isPublished ? 'Опубликована' : 'Черновик'}
                    </td>
                    <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => toggleQuizPublish(quiz.id, quiz.isPublished)}
                          disabled={updateQuiz.isPending}
                        >
                          {quiz.isPublished ? 'Скрыть' : 'Опубликовать'}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedQuizId(quiz.id);
                            cancelQuestionEdit();
                          }}
                        >
                          Вопросы
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Редактирование вопросов викторин</h2>

        {quizzes.length > 0 ? (
          <label className="mt-4 block max-w-xl">
            <span className="mb-2 block text-sm font-medium text-slate-700">Выберите викторину</span>
            <select
              className="w-full rounded-lg border-2 border-slate-500 bg-white px-3 py-2 text-slate-900"
              value={selectedQuizId ?? ''}
              onChange={(event) => {
                const nextQuizId = Number(event.target.value);
                setSelectedQuizId(Number.isFinite(nextQuizId) ? nextQuizId : null);
                cancelQuestionEdit();
              }}
            >
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  #{quiz.id} - {quiz.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedQuiz ? (
          <p className="mt-3 text-sm text-slate-600">
            Редактируем: <strong>{selectedQuiz.name}</strong>
          </p>
        ) : null}

        {selectedQuizId && questionsQuery.isLoading ? (
          <Loader label="Загружаем вопросы..." />
        ) : null}

        {selectedQuizId && questionsQuery.isError ? (
          <ErrorState message={normalizeApiError(questionsQuery.error).message} />
        ) : null}

        {selectedQuizId && !questionsQuery.isLoading && !questionsQuery.isError ? (
          <div className="mt-4 space-y-4">
            {questions.length === 0 ? (
              <EmptyState
                title="Вопросы не найдены"
                description="У выбранной викторины пока нет вопросов."
              />
            ) : (
              questions.map((question) => (
                <article key={question.id} className="rounded-lg border-2 border-slate-400 bg-slate-50 p-4">
                  {editingQuestionId === question.id && questionDraft ? (
                    <div className="space-y-3">
                      <Input
                        label="Текст вопроса"
                        value={questionDraft.text}
                        onChange={(event) =>
                          setQuestionDraft((previous) =>
                            previous ? { ...previous, text: event.target.value } : previous,
                          )
                        }
                      />

                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-700">
                            Тип вопроса
                          </span>
                          <select
                            className="w-full rounded-lg border-2 border-slate-500 bg-white px-3 py-2 text-slate-900"
                            value={questionDraft.type}
                            onChange={(event) =>
                              setQuestionDraft((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      type: event.target.value as QuestionType,
                                    }
                                  : previous,
                              )
                            }
                          >
                            {questionTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <Input
                          label="Баллы"
                          type="number"
                          min={1}
                          value={String(questionDraft.points)}
                          onChange={(event) =>
                            setQuestionDraft((previous) =>
                              previous
                                ? {
                                    ...previous,
                                    points: Math.max(1, Number(event.target.value) || 1),
                                  }
                                : previous,
                            )
                          }
                        />

                        <Input
                          label="Порядок"
                          type="number"
                          min={0}
                          value={String(questionDraft.order)}
                          onChange={(event) =>
                            setQuestionDraft((previous) =>
                              previous
                                ? {
                                    ...previous,
                                    order: Math.max(0, Number(event.target.value) || 0),
                                  }
                                : previous,
                            )
                          }
                        />
                      </div>

                      <Textarea
                        label="Пояснение (опционально)"
                        value={questionDraft.explanation}
                        onChange={(event) =>
                          setQuestionDraft((previous) =>
                            previous ? { ...previous, explanation: event.target.value } : previous,
                          )
                        }
                      />

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">Варианты ответа</p>
                        {questionDraft.answers.map((answer, index) => (
                          <div
                            key={`${question.id}-answer-${index}`}
                            className="grid gap-2 rounded-lg border border-slate-300 bg-white p-3 md:grid-cols-[1fr_auto_auto]"
                          >
                            <Input
                              label={`Ответ ${index + 1}`}
                              value={answer.text}
                              onChange={(event) =>
                                updateAnswerField(index, 'text', event.target.value)
                              }
                            />

                            <Input
                              label="Порядок"
                              type="number"
                              min={0}
                              value={String(answer.order)}
                              onChange={(event) =>
                                updateAnswerField(
                                  index,
                                  'order',
                                  Math.max(0, Number(event.target.value) || 0),
                                )
                              }
                            />

                            <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={answer.isCorrect}
                                onChange={(event) =>
                                  updateAnswerField(index, 'isCorrect', event.target.checked)
                                }
                              />
                              Правильный
                            </label>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button onClick={saveQuestion} disabled={updateQuestion.isPending}>
                          {updateQuestion.isPending ? 'Сохраняем...' : 'Сохранить вопрос'}
                        </Button>
                        <Button variant="secondary" onClick={cancelQuestionEdit}>
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Вопрос #{question.id} • {question.points} балл(ов)
                      </p>
                      <p className="font-medium text-slate-900">{question.text}</p>
                      <div className="space-y-1 text-sm text-slate-700">
                        {question.answers.map((answer) => (
                          <p key={answer.id}>
                            {answer.isCorrect ? '✓' : '•'} {answer.text}
                          </p>
                        ))}
                      </div>
                      <Button onClick={() => beginQuestionEdit(question)}>Редактировать</Button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Статистика обучающихся</h2>
        <p className="mt-1 text-sm text-slate-600">
          Отчёт по пользователям с ролью обучающегося.
        </p>

        {learners.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Статистика пока пуста"
              description="В системе ещё нет данных по обучающимся."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">
                    Обучающийся
                  </th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Очки</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">
                    Викторины
                  </th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Игры</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">Темы</th>
                  <th className="border-2 border-slate-500 px-3 py-2 text-left text-sm">
                    Точность викторин
                  </th>
                </tr>
              </thead>
              <tbody>
                {learners.map((learner) => {
                  const scorePercent =
                    learner.scoreSummary.possible === 0
                      ? 0
                      : Math.round(
                          (learner.scoreSummary.earned / learner.scoreSummary.possible) * 100,
                        );

                  return (
                    <tr key={learner.userId} className="bg-white">
                      <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                        <p className="font-medium text-slate-900">{learner.fullName}</p>
                        <p className="text-slate-600">{learner.email}</p>
                        <p className="text-slate-500">{learner.username ? `@${learner.username}` : '—'}</p>
                      </td>
                      <td className="border-2 border-slate-400 px-3 py-2 text-sm">{learner.totalPoints}</td>
                      <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                        {learner.completedQuizzes}
                      </td>
                      <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                        {learner.completedGames}
                      </td>
                      <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                        {learner.completedTopics}
                      </td>
                      <td className="border-2 border-slate-400 px-3 py-2 text-sm">
                        {scorePercent}% ({learner.scoreSummary.earned}/{learner.scoreSummary.possible})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
