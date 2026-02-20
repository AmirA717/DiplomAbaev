import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
import { CreateGameDto, UpdateGameDto } from './dto/game.dto';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import {
  AdminLearnersQueryDto,
  AdminQuizListQueryDto,
  AdminTopicListQueryDto,
} from './dto/admin-query.dto';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
} from './dto/achievement.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listTopics(query: AdminTopicListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TopicWhereInput = query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.topic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.topic.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  createTopic(dto: CreateTopicDto) {
    return this.prisma.topic.create({ data: dto });
  }

  updateTopic(id: number, dto: UpdateTopicDto) {
    return this.prisma.topic.update({ where: { id }, data: dto });
  }

  deleteTopic(id: number) {
    return this.prisma.topic.delete({ where: { id } });
  }

  createMaterial(dto: CreateMaterialDto) {
    return this.prisma.material.create({ data: dto });
  }

  updateMaterial(id: number, dto: UpdateMaterialDto) {
    return this.prisma.material.update({ where: { id }, data: dto });
  }

  deleteMaterial(id: number) {
    return this.prisma.material.delete({ where: { id } });
  }

  createGame(dto: CreateGameDto) {
    return this.prisma.game.create({
      data: {
        topicId: dto.topicId,
        title: dto.title,
        type: dto.type,
        config: dto.config as Prisma.InputJsonValue | undefined,
        order: dto.order,
        isPublished: dto.isPublished,
      },
    });
  }

  updateGame(id: number, dto: UpdateGameDto) {
    return this.prisma.game.update({
      where: { id },
      data: {
        ...(dto.topicId !== undefined ? { topicId: dto.topicId } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.config !== undefined
          ? { config: dto.config as Prisma.InputJsonValue }
          : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {}),
        ...(dto.isPublished !== undefined
          ? { isPublished: dto.isPublished }
          : {}),
      },
    });
  }

  deleteGame(id: number) {
    return this.prisma.game.delete({ where: { id } });
  }

  async listQuizzes(query: AdminQuizListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.QuizWhereInput = {
      ...(query.topicId ? { topicId: query.topicId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          _count: {
            select: {
              quizQuestions: true,
            },
          },
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  createQuiz(dto: CreateQuizDto) {
    return this.prisma.quiz.create({
      data: {
        ...dto,
        isActive: true,
      },
    });
  }

  updateQuiz(id: number, dto: UpdateQuizDto) {
    return this.prisma.quiz.update({ where: { id }, data: dto });
  }

  deleteQuiz(id: number) {
    return this.prisma.quiz.delete({ where: { id } });
  }

  async listQuizQuestions(quizId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true },
    });

    if (!quiz) {
      throw new NotFoundException('Викторина не найдена');
    }

    return this.prisma.question.findMany({
      where: {
        quizQuestions: {
          some: { quizId },
        },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        answers: {
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            text: true,
            isCorrect: true,
            order: true,
          },
        },
      },
    });
  }

  async createQuestion(dto: CreateQuestionDto) {
    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.findUnique({
        where: { id: dto.quizId },
        select: { id: true },
      });
      if (!quiz) {
        throw new NotFoundException('Викторина не найдена');
      }

      const question = await tx.question.create({
        data: {
          text: dto.text,
          type: dto.type,
          explanation: dto.explanation,
          points: dto.points,
          order: dto.order,
          answers: {
            create: dto.answers,
          },
        },
        include: { answers: true },
      });

      await tx.quizQuestion.create({
        data: {
          quizId: dto.quizId,
          questionId: question.id,
        },
      });

      return question;
    });
  }

  async updateQuestion(id: number, dto: UpdateQuestionDto) {
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.findUnique({
        where: { id },
        include: { quizQuestions: true },
      });
      if (!question) {
        throw new NotFoundException('Вопрос не найден');
      }

      if (
        dto.quizId &&
        !question.quizQuestions.some((q) => q.quizId === dto.quizId)
      ) {
        await tx.quizQuestion.deleteMany({ where: { questionId: id } });
        await tx.quizQuestion.create({
          data: {
            quizId: dto.quizId,
            questionId: id,
          },
        });
      }

      if (dto.answers) {
        await tx.answer.deleteMany({ where: { questionId: id } });
      }

      return tx.question.update({
        where: { id },
        data: {
          text: dto.text,
          type: dto.type,
          explanation: dto.explanation,
          points: dto.points,
          order: dto.order,
          ...(dto.answers
            ? {
                answers: {
                  create: dto.answers,
                },
              }
            : {}),
        },
        include: { answers: true },
      });
    });
  }

  async deleteQuestion(id: number) {
    await this.prisma.quizQuestion.deleteMany({ where: { questionId: id } });
    await this.prisma.answer.deleteMany({ where: { questionId: id } });
    return this.prisma.question.delete({ where: { id } });
  }

  createAchievement(dto: CreateAchievementDto) {
    return this.prisma.achievement.create({
      data: {
        code: dto.code,
        name: dto.name,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        conditionType: dto.conditionType ?? 'custom',
        criteria: dto.criteria as Prisma.InputJsonValue | undefined,
        isActive: dto.isActive,
      },
    });
  }

  updateAchievement(id: number, dto: UpdateAchievementDto) {
    return this.prisma.achievement.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
        ...(dto.conditionType !== undefined
          ? { conditionType: dto.conditionType }
          : {}),
        ...(dto.criteria !== undefined
          ? { criteria: dto.criteria as Prisma.InputJsonValue }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  deleteAchievement(id: number) {
    return this.prisma.achievement.delete({ where: { id } });
  }

  async getOverviewStats() {
    const [
      usersCount,
      quizAttemptsCount,
      gameAttemptsCount,
      avgQuizScore,
      topTopics,
      completedQuizAttempts,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.quizAttempt.count(),
      this.prisma.gameAttempt.count(),
      this.prisma.quizAttempt.aggregate({
        where: { isFinished: true },
        _avg: { score: true, maxScore: true },
      }),
      this.prisma.topic.findMany({
        take: 5,
        orderBy: {
          quizzes: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          _count: {
            select: { quizzes: true, games: true },
          },
        },
      }),
      this.prisma.quizAttempt.count({
        where: { isFinished: true },
      }),
    ]);

    const startedQuizAttempts = await this.prisma.quizAttempt.count();
    const conversion =
      startedQuizAttempts === 0
        ? 0
        : Number(
            ((completedQuizAttempts / startedQuizAttempts) * 100).toFixed(2),
          );

    return {
      usersCount,
      attemptsCount: {
        quizzes: quizAttemptsCount,
        games: gameAttemptsCount,
      },
      averageQuizScore: {
        score: avgQuizScore._avg.score ?? 0,
        maxScore: avgQuizScore._avg.maxScore ?? 0,
      },
      topTopics,
      quizCompletionConversionPercent: conversion,
    };
  }

  async getLearnersStats(query: AdminLearnersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: UserRole.USER,
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { username: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ totalPoints: 'desc' }, { id: 'asc' }],
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          totalPoints: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    if (users.length === 0) {
      return { items: [], total, page, limit };
    }

    const items = await Promise.all(users.map(async (user) => {
      const [completedQuizzes, completedGames, completedTopics, quizScore] =
        await this.prisma.$transaction([
          this.prisma.quizAttempt.count({
            where: {
              userId: user.id,
              isFinished: true,
            },
          }),
          this.prisma.gameAttempt.count({
            where: {
              userId: user.id,
              isFinished: true,
            },
          }),
          this.prisma.topicProgress.count({
            where: {
              userId: user.id,
              completedGamesCount: { gt: 0 },
              completedQuizzesCount: { gt: 0 },
            },
          }),
          this.prisma.quizAttempt.aggregate({
            where: {
              userId: user.id,
              isFinished: true,
            },
            _sum: {
              score: true,
              maxScore: true,
            },
          }),
        ]);

      return {
        userId: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        totalPoints: Number(user.totalPoints),
        registeredAt: user.createdAt,
        completedQuizzes,
        completedGames,
        completedTopics,
        scoreSummary: {
          earned: quizScore._sum.score ?? 0,
          possible: quizScore._sum.maxScore ?? 0,
        },
      };
    }));

    return { items, total, page, limit };
  }
}
