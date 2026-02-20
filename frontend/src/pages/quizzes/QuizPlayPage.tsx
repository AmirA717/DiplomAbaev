import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { normalizeApiError } from '../../api/errors';
import { QuestionType } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Loader } from '../../components/ui/Loader';
import {
  useQuiz,
  useQuizQuestions,
  useStartQuizAttempt,
  useSubmitQuizAttempt,
} from '../../features/quizzes/hooks';

function isMultiSelectQuestion(type: QuestionType) {
  return type === 'MULTIPLE';
}

export function QuizPlayPage() {
  const { quizId } = useParams();
  const parsedQuizId = Number(quizId);
  const isValidQuizId = Number.isFinite(parsedQuizId);

  const quizQuery = useQuiz(isValidQuizId ? parsedQuizId : null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitResult, setSubmitResult] = useState<null | {
    score: number;
    maxScore: number;
    correctAnswersCount: number;
    passed: boolean;
    details: Array<{ questionId: number; isCorrect: boolean; explanation: string | null }>;
  }>(null);

  const questionsQuery = useQuizQuestions(isValidQuizId ? parsedQuizId : null, Boolean(attemptId));
  const startAttemptMutation = useStartQuizAttempt();
  const submitAttemptMutation = useSubmitQuizAttempt();

  const questions = questionsQuery.data ?? [];

  const allQuestionsAnswered =
    questions.length > 0 && questions.every((question) => (answers[question.id] ?? []).length > 0);

  const startQuiz = async () => {
    if (!isValidQuizId) {
      return;
    }

    try {
      const startedAttempt = await startAttemptMutation.mutateAsync(parsedQuizId);
      setAttemptId(startedAttempt.id);
      setSubmitResult(null);
      setAnswers({});
      toast.success('Попытка викторины начата');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const toggleAnswer = (questionId: number, answerId: number, questionType: QuestionType) => {
    setAnswers((previous) => {
      const currentQuestionAnswers = previous[questionId] ?? [];

      if (isMultiSelectQuestion(questionType)) {
        const exists = currentQuestionAnswers.includes(answerId);
        return {
          ...previous,
          [questionId]: exists
            ? currentQuestionAnswers.filter((id) => id !== answerId)
            : [...currentQuestionAnswers, answerId],
        };
      }

      return {
        ...previous,
        [questionId]: [answerId],
      };
    });
  };

  const submitQuiz = async () => {
    if (!attemptId) {
      toast.error('Сначала начните попытку викторины');
      return;
    }

    try {
      const result = await submitAttemptMutation.mutateAsync({
        attemptId,
        answers,
      });

      setSubmitResult({
        score: result.score,
        maxScore: result.maxScore,
        correctAnswersCount: result.correctAnswersCount,
        passed: result.passed,
        details: result.details.map((detail) => ({
          questionId: detail.questionId,
          isCorrect: detail.isCorrect,
          explanation: detail.explanation,
        })),
      });
      setAttemptId(null);
      toast.success('Викторина отправлена');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  if (!isValidQuizId) {
    return <ErrorState message="Некорректный идентификатор викторины." />;
  }

  if (quizQuery.isLoading) {
    return <Loader label="Загружаем викторину..." />;
  }

  if (quizQuery.isError) {
    return <ErrorState message={normalizeApiError(quizQuery.error).message} />;
  }

  const quiz = quizQuery.data;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{quiz?.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{quiz?.description}</p>
          </div>
          <Link to="/">
            <Button variant="secondary">Назад на главную</Button>
          </Link>
        </div>
      </section>

      {!attemptId && !submitResult ? (
        <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <p className="text-slate-700">Нажмите кнопку, чтобы начать попытку и получить вопросы.</p>
          <div className="mt-4">
            <Button onClick={startQuiz} disabled={startAttemptMutation.isPending}>
              {startAttemptMutation.isPending ? 'Запускаем...' : 'Старт попытки'}
            </Button>
          </div>
        </section>
      ) : null}

      {attemptId ? (
        <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
          {questionsQuery.isLoading ? <Loader label="Загружаем вопросы..." /> : null}
          {questionsQuery.isError ? (
            <ErrorState message={normalizeApiError(questionsQuery.error).message} />
          ) : null}

          {!questionsQuery.isLoading && !questionsQuery.isError ? (
            <div className="space-y-5">
              {questions.length === 0 ? (
                <EmptyState
                  title="Вопросы не найдены"
                  description="У выбранной викторины пока нет вопросов."
                />
              ) : (
                questions.map((question, index) => (
                  <article key={question.id} className="rounded-lg border-2 border-slate-400 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Вопрос {index + 1} • {question.points} балл(ов)</p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">{question.text}</h3>
                    <div className="mt-3 space-y-2" role="group" aria-label={`Ответы для вопроса ${index + 1}`}>
                      {question.answers.map((answer) => {
                        const selected = (answers[question.id] ?? []).includes(answer.id);

                        return (
                          <button
                            key={answer.id}
                            type="button"
                            className={`w-full rounded-lg border-2 px-3 py-2 text-left transition ${
                              selected
                                ? 'border-slate-900 bg-slate-700 text-white'
                                : 'border-slate-400 bg-white text-slate-800 hover:bg-slate-100'
                            }`}
                            onClick={() => toggleAnswer(question.id, answer.id, question.type)}
                            aria-pressed={selected}
                          >
                            {answer.text}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))
              )}

              <Button
                onClick={submitQuiz}
                disabled={!allQuestionsAnswered || submitAttemptMutation.isPending || questions.length === 0}
              >
                {submitAttemptMutation.isPending ? 'Отправляем...' : 'Завершить викторину'}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {submitResult ? (
        <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Результат</h2>
          <p className="mt-2 text-slate-700">
            Счет: <strong>{submitResult.score}</strong> из <strong>{submitResult.maxScore}</strong>
          </p>
          <p className="mt-1 text-slate-700">
            Правильных ответов: <strong>{submitResult.correctAnswersCount}</strong>
          </p>
          <p className={`mt-1 font-semibold ${submitResult.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
            {submitResult.passed ? 'Тест пройден' : 'Тест не пройден'}
          </p>

          <div className="mt-4 space-y-3">
            {submitResult.details.map((detail) => (
              <article
                key={detail.questionId}
                className={`rounded-lg border-2 p-3 ${
                  detail.isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-amber-500 bg-amber-50 text-amber-900'
                }`}
              >
                <p className="font-medium">Вопрос #{detail.questionId}</p>
                <p className="text-sm">{detail.isCorrect ? 'Ответ верный' : 'Ответ неверный'}</p>
                {detail.explanation ? <p className="mt-1 text-sm">Пояснение: {detail.explanation}</p> : null}
              </article>
            ))}
          </div>

          <div className="mt-4">
            <Button onClick={startQuiz}>Пройти снова</Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}


