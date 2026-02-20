import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuizzesQueryDto } from './dto/quizzes-query.dto';
import { AnswerAttemptDto } from './dto/answer-attempt.dto';
import { ScoringService } from './scoring.service';
import { AchievementsService } from '../rewards/achievements.service';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
    private readonly achievementsService: AchievementsService,
  ) {}

  async list(query: QuizzesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(query.topicId ? { topicId: query.topicId } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' as const } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: number) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz || !quiz.isPublished) {
      throw new NotFoundException('Викторина не найдена');
    }
    return quiz;
  }

  async getQuestions(quizId: number, role: UserRole) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, isPublished: true },
    });

    if (!quiz || (!quiz.isPublished && role !== UserRole.ADMIN)) {
      throw new NotFoundException('Викторина не найдена');
    }

    const questions = await this.prisma.question.findMany({
      where: { quizQuestions: { some: { quizId } } },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        answers: {
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            text: true,
            isCorrect: role === UserRole.ADMIN,
          },
        },
      },
    });

    return questions.map((question) => ({
      id: question.id,
      text: question.text,
      type: question.type,
      points: question.points,
      explanation: role === UserRole.ADMIN ? question.explanation : undefined,
      answers: question.answers,
    }));
  }

  async startAttempt(quizId: number, userId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        quizQuestions: {
          include: { question: { select: { points: true } } },
        },
      },
    });

    if (!quiz || !quiz.isPublished) {
      throw new NotFoundException('Викторина не найдена');
    }

    const maxScore = quiz.quizQuestions.reduce(
      (sum, item) => sum + item.question.points,
      0,
    );

    return this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        maxScore,
      },
      select: {
        id: true,
        startedAt: true,
        maxScore: true,
      },
    });
  }

  async answerAttempt(
    attemptId: number,
    userId: number,
    dto: AnswerAttemptDto,
  ) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, userId: true, isFinished: true, quizId: true },
    });

    if (!attempt) {
      throw new NotFoundException('Попытка не найдена');
    }
    if (attempt.userId !== userId) {
      throw new ForbiddenException('Доступ запрещен');
    }
    if (attempt.isFinished) {
      throw new BadRequestException('Попытка уже завершена');
    }

    const questionExistsInQuiz = await this.prisma.quizQuestion.findUnique({
      where: {
        quizId_questionId: {
          quizId: attempt.quizId,
          questionId: dto.questionId,
        },
      },
      select: { questionId: true },
    });

    if (!questionExistsInQuiz) {
      throw new BadRequestException('Вопрос не относится к этой викторине');
    }

    return this.prisma.quizAttemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: dto.questionId,
        },
      },
      create: {
        attemptId,
        questionId: dto.questionId,
        selectedIds: dto.answerIds,
      },
      update: {
        selectedIds: dto.answerIds,
      },
    });
  }

  async submitAttempt(attemptId: number, userId: number) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            quizQuestions: {
              include: {
                question: {
                  include: {
                    answers: {
                      select: { id: true, text: true, isCorrect: true },
                    },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Попытка не найдена');
    }
    if (attempt.userId !== userId) {
      throw new ForbiddenException('Доступ запрещен');
    }
    if (attempt.isFinished) {
      throw new BadRequestException('Попытка уже завершена');
    }

    const answersMap = new Map<number, number[]>(
      attempt.answers.map((answer) => [answer.questionId, answer.selectedIds]),
    );

    const scoring = this.scoringService.calculateScore({
      questions: attempt.quiz.quizQuestions.map((item) => ({
        id: item.question.id,
        points: item.question.points,
        explanation: item.question.explanation,
        answers: item.question.answers,
      })),
      answersMap,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          finishedAt: new Date(),
          isFinished: true,
          score: scoring.score,
          maxScore: scoring.maxScore,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: scoring.score },
        },
      });

      if (attempt.quiz.topicId) {
        const existingProgress = await tx.topicProgress.findUnique({
          where: {
            userId_topicId: {
              userId,
              topicId: attempt.quiz.topicId,
            },
          },
          select: { bestQuizScore: true },
        });

        await tx.topicProgress.upsert({
          where: {
            userId_topicId: {
              userId,
              topicId: attempt.quiz.topicId,
            },
          },
          create: {
            userId,
            topicId: attempt.quiz.topicId,
            completedQuizzesCount: 1,
            bestQuizScore: scoring.score,
            totalPoints: scoring.score,
          },
          update: {
            completedQuizzesCount: { increment: 1 },
            bestQuizScore: {
              set: Math.max(
                existingProgress?.bestQuizScore ?? 0,
                scoring.score,
              ),
            },
            totalPoints: { increment: scoring.score },
          },
        });
      }

      await this.achievementsService.evaluateAndGrant(tx, userId);
    });

    return {
      attemptId,
      score: scoring.score,
      maxScore: scoring.maxScore,
      correctAnswersCount: scoring.correctAnswersCount,
      details: scoring.details,
      passed: scoring.score >= (attempt.quiz.passingScore ?? 0),
    };
  }
}
