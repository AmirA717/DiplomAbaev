# Листинг кода основных функций - Киберобразование

---

## BACKEND - Auth Service

```typescript
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        username: dto.username,
        passwordHash,
        role: UserRole.USER,
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
```

---

## BACKEND - Scoring Service

```typescript
import { Injectable } from '@nestjs/common';

interface ScoreInput {
  questions: Array<{
    id: number;
    points: number;
    explanation: string | null;
    answers: Array<{ id: number; isCorrect: boolean; text: string }>;
  }>;
  answersMap: Map<number, number[]>;
}

@Injectable()
export class ScoringService {
  calculateScore(input: ScoreInput) {
    let score = 0;
    let maxScore = 0;
    let correctAnswersCount = 0;

    const details = input.questions.map((question) => {
      maxScore += question.points;
      const selectedIds = new Set(input.answersMap.get(question.id) ?? []);
      const correctIds = new Set(
        question.answers.filter((a) => a.isCorrect).map((a) => a.id),
      );

      const isCorrect =
        selectedIds.size === correctIds.size &&
        [...selectedIds].every((id) => correctIds.has(id));

      if (isCorrect) {
        score += question.points;
        correctAnswersCount += 1;
      }

      return {
        questionId: question.id,
        isCorrect,
        selectedAnswerIds: [...selectedIds],
        explanation: question.explanation,
      };
    });

    return {
      score,
      maxScore,
      correctAnswersCount,
      details,
    };
  }
}
```

---

## BACKEND - Games Service

```typescript
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GamesQueryDto } from './dto/games-query.dto';
import { FinishGameAttemptDto } from './dto/finish-game-attempt.dto';
import { AchievementsService } from '../rewards/achievements.service';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly achievementsService: AchievementsService,
  ) {}

  async list(query: GamesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(query.topicId ? { topicId: query.topicId } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' as const } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.game.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: number) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (!game || !game.isPublished) {
      throw new NotFoundException('Игра не найдена');
    }
    return game;
  }

  async startAttempt(gameId: number, userId: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, isPublished: true },
    });

    if (!game || !game.isPublished) {
      throw new NotFoundException('Игра не найдена');
    }

    return this.prisma.gameAttempt.create({
      data: {
        gameId,
        userId,
      },
      select: {
        id: true,
        gameId: true,
        startedAt: true,
      },
    });
  }

  async finishAttempt(
    attemptId: number,
    userId: number,
    dto: FinishGameAttemptDto,
  ) {
    const attempt = await this.prisma.gameAttempt.findUnique({
      where: { id: attemptId },
      include: {
        game: {
          select: {
            id: true,
            topicId: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Попытка не найдена');
    }
    if (attempt.userId !== userId) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return this.prisma.gameAttempt.update({
      where: { id: attemptId },
      data: {
        isFinished: true,
        score: dto.pointsEarned,
        result: dto.result,
        completedAt: new Date(),
      },
    });
  }
}
```

---

## BACKEND - Users Service

```typescript
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        profilePicture: true,
        role: true,
        totalPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async updateMyProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: dto.username },
        select: { id: true },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Имя пользователя уже используется');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        fullName: dto.fullName,
        profilePicture: dto.avatarUrl,
      },
    });

    return this.getMyProfile(userId);
  }
}
```

---

## BACKEND - Quizzes Service

```typescript
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

    if (!quiz) {
      throw new NotFoundException('Викторина не найдена');
    }

    const maxScore = quiz.quizQuestions.reduce(
      (sum, qz) => sum + (qz.question.points ?? 0),
      0,
    );

    return this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        maxScore: maxScore || 0,
      },
      select: {
        id: true,
        quizId: true,
        startedAt: true,
      },
    });
  }
}
```

---

## BACKEND - Stats Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyStats(userId: number) {
    const [user, completedQuizzes, completedGames, topicProgresses] =
      await this.prisma.$transaction([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, totalPoints: true },
        }),
        this.prisma.quizAttempt.count({
          where: { userId, isFinished: true },
        }),
        this.prisma.gameAttempt.count({
          where: { userId, isFinished: true },
        }),
        this.prisma.topicProgress.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        }),
      ]);

    const correctAnswersAggregate = await this.prisma.quizAttempt.aggregate({
      where: { userId, isFinished: true },
      _sum: { score: true, maxScore: true },
    });

    return {
      userId: user?.id ?? userId,
      totalPoints: Number(user?.totalPoints ?? 0),
      completedQuizzes,
      completedGames,
      completedTopics: topicProgresses.length,
      scoreSummary: {
        earned: correctAnswersAggregate._sum.score ?? 0,
        possible: correctAnswersAggregate._sum.maxScore ?? 0,
      },
      topicProgresses,
    };
  }
}
```

---

## BACKEND - Achievements Service

```typescript
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateAndGrant(tx: TxClient, userId: number) {
    const achievements = await tx.achievement.findMany({
      where: { isActive: true },
    });

    const alreadyGranted = await tx.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const grantedSet = new Set(
      alreadyGranted.map((item) => item.achievementId),
    );
    const grantList: number[] = [];

    for (const achievement of achievements) {
      if (grantedSet.has(achievement.id)) {
        continue;
      }

      const criteria = (achievement.criteria ?? {}) as Record<string, unknown>;
      const rawType = criteria.type;
      const rawTarget = criteria.value;
      const type = typeof rawType === 'string' ? rawType : '';
      const target =
        typeof rawTarget === 'number' ? rawTarget : Number(rawTarget ?? 0);

      const isEligible = await this.checkCriteria(tx, userId, type, target);
      if (isEligible) {
        grantList.push(achievement.id);
      }
    }

    if (grantList.length > 0) {
      await tx.userAchievement.createMany({
        data: grantList.map((achievementId) => ({ userId, achievementId })),
        skipDuplicates: true,
      });
    }
  }

  private async checkCriteria(
    tx: TxClient,
    userId: number,
    type: string,
    target: number,
  ): Promise<boolean> {
    if (type === 'quiz_count') {
      const count = await tx.quizAttempt.count({
        where: { userId, isFinished: true },
      });
      return count >= target;
    }

    if (type === 'game_count') {
      const count = await tx.gameAttempt.count({
        where: { userId, isFinished: true },
      });
      return count >= target;
    }

    if (type === 'total_points') {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true },
      });
      return Number(user?.totalPoints ?? 0) >= target;
    }

    return false;
  }
}
```

---

## BACKEND - Topics Service

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TopicsQueryDto } from './dto/topics-query.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTopics(query: TopicsQueryDto, role?: UserRole) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.search
        ? {
            OR: [
              {
                title: { contains: query.search, mode: 'insensitive' as const },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(role === UserRole.ADMIN && query.includeUnpublished
        ? {}
        : { isPublished: true }),
    };

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

  async getTopicById(id: number, role?: UserRole) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic || (!topic.isPublished && role !== UserRole.ADMIN)) {
      throw new NotFoundException('Тема не найдена');
    }

    return topic;
  }

  async getTopicMaterials(topicId: number, role?: UserRole) {
    await this.getTopicById(topicId, role);

    return this.prisma.material.findMany({
      where: {
        topicId,
        ...(role === UserRole.ADMIN ? {} : { isPublished: true }),
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
  }
}
```

---

## BACKEND - Minigames Service

```typescript
import { Injectable } from '@nestjs/common';
import { GameType } from '@prisma/client';
import { GamesService } from '../games/games.service';
import { PrismaService } from '../prisma/prisma.service';
import { PHISHING_SCENARIOS } from './data/phishing-scenarios';
import { PhishingScenariosQueryDto } from './dto/phishing-scenarios-query.dto';
import { SaveMinigameResultDto } from './dto/save-minigame-result.dto';

@Injectable()
export class MinigamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamesService: GamesService,
  ) {}

  listPhishingScenarios(query: PhishingScenariosQueryDto) {
    const limit = query.limit ?? 10;
    const items = PHISHING_SCENARIOS.slice(0, limit);

    return {
      items,
      total: PHISHING_SCENARIOS.length,
      page: 1,
      limit,
    };
  }

  async saveResult(userId: number, dto: SaveMinigameResultDto) {
    const gameType = dto.type as GameType;
    const game = await this.prisma.game.findFirst({
      where: {
        type: gameType,
        isPublished: true,
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });

    if (!game) {
      return {
        saved: false,
        reason: `published game with type ${dto.type} was not found`,
      };
    }

    const startedAttempt = await this.gamesService.startAttempt(game.id, userId);

    const score = dto.score ?? 0;
    const total = dto.total ?? 0;
    const pointsEarned = dto.pointsEarned ?? score;
    const accuracyPercent = total > 0 ? Math.round((score / total) * 100) : 0;

    const finishedAttempt = await this.gamesService.finishAttempt(
      startedAttempt.id,
      userId,
      {
        pointsEarned,
        result: {
          source: 'api/minigames',
          type: dto.type,
          score,
          total,
          accuracyPercent,
          details: dto.details ?? {},
        },
      },
    );

    return {
      saved: true,
      gameType: dto.type,
      ...finishedAttempt,
    };
  }
}
```

---

## BACKEND - Attempts Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  getMyQuizAttempts(userId: number) {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  getMyGameAttempts(userId: number) {
    return this.prisma.gameAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });
  }
}
```

---

## FRONTEND - API Types

```typescript
export type Role = 'USER' | 'ADMIN';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: number;
  email: string;
  username: string | null;
  fullName: string;
  role: Role;
  totalPoints: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Topic {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MaterialType = 'TEXT' | 'VIDEO' | 'LINK';

export interface Material {
  id: number;
  type: MaterialType;
  content: string;
  order: number;
  isPublished: boolean;
  topicId: number;
  createdAt: string;
  updatedAt: string;
}

export type GameType =
  | 'QUIZ_SIMULATION'
  | 'PHISHING_DETECTOR'
  | 'PASSWORD_STRENGTH'
  | 'SOCIAL_NETWORK_SCENARIO'
  | 'MFA_CHALLENGE'
  | 'UPDATE_TRIAGE'
  | 'BACKUP_STRATEGY'
  | 'SAFE_DOWNLOADS'
  | 'APP_PERMISSION_AUDIT';

export interface Game {
  id: number;
  title: string;
  type: GameType;
  topicId: number;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  username: string | null;
  profilePicture: string | null;
  role: Role;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId: number;
  totalPoints: number;
  completedQuizzes: number;
  completedGames: number;
  completedTopics: number;
  scoreSummary: {
    earned: number;
    possible: number;
  };
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
}
```

---

## FRONTEND - Auth API

```typescript
import { request } from '../client';
import { AuthResponse, LoginPayload, User, RegisterPayload } from '../types';

export const authApi = {
  register(payload: RegisterPayload) {
    return request<AuthResponse, RegisterPayload>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  login(payload: LoginPayload) {
    return request<AuthResponse, LoginPayload>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  me() {
    return request<User>('/auth/me');
  },
};
```

---

## FRONTEND - Quizzes API

```typescript
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
```

---

## FRONTEND - Games API

```typescript
import { request } from '../client';
import { FinishedGameAttempt, Game, GameAttempt, PaginatedResponse } from '../types';

export const gamesApi = {
  list(topicId?: number) {
    return request<PaginatedResponse<Game>>('/games', {
      query: topicId ? { topicId } : undefined,
    });
  },

  byId(id: number) {
    return request<Game>(`/games/${id}`);
  },

  startAttempt(gameId: number) {
    return request<GameAttempt>(`/games/${gameId}/attempts`, {
      method: 'POST',
    });
  },

  finishAttempt(attemptId: number, payload: { pointsEarned: number; result?: Record<string, unknown> }) {
    return request<FinishedGameAttempt>(`/games/attempts/${attemptId}/finish`, {
      method: 'PATCH',
      body: payload,
    });
  },
};
```

---

## FRONTEND - Profile API

```typescript
import { request } from '../client';
import { Achievement, UpdateProfilePayload, UserProfile, UserStats } from '../types';

export const profileApi = {
  profile() {
    return request<UserProfile>('/users/me/profile');
  },

  updateProfile(payload: UpdateProfilePayload) {
    return request<UserProfile>('/users/me/profile', {
      method: 'PATCH',
      body: payload,
    });
  },

  stats() {
    return request<UserStats>('/users/me/stats');
  },

  achievements() {
    return request<Achievement[]>('/users/me/achievements');
  },
};
```

---

## FRONTEND - Auth Hook

```typescript
import { useContext } from 'react';
import { AuthContext } from './auth-context';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
```

---

## FRONTEND - Profile Hooks

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../api/endpoints/profile';
import { UserProfile, UpdateProfilePayload } from '../../api/types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.profile(),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => profileApi.stats(),
  });
}

export function useUserAchievements() {
  return useQuery({
    queryKey: ['user-achievements'],
    queryFn: () => profileApi.achievements(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData<UserProfile>(['profile']);

      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(['profile'], {
          ...previousProfile,
          username: payload.username ?? previousProfile.username,
          fullName: payload.fullName ?? previousProfile.fullName,
          profilePicture: payload.avatarUrl ?? previousProfile.profilePicture,
        });
      }

      return { previousProfile };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile);
    },
  });
}
```

---

## FRONTEND - Login Page

```typescript
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AuthCard } from '../../components/layout/AuthCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { normalizeApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/useAuth';
import { LoginFormValues, loginSchema } from '../../utils/validation';

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/', { replace: true });
    }
  }, [status, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      toast.success('Вход выполнен');
      navigate(from === '/login' ? '/' : from, { replace: true });
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      toast.error(normalizedError.message);
    }
  });

  return (
    <AuthCard
      title="Кибер-обучение"
      subtitle="Войдите в аккаунт, чтобы продолжить обучение"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Электронная почта"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Пароль"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Входим...' : 'Войти'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
          Регистрация
        </Link>
      </p>
    </AuthCard>
  );
}
```

---

## FRONTEND - Profile Page

```typescript
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { normalizeApiError } from '../../api/errors';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { useProfile, useUpdateProfile } from '../../features/profile/hooks';
import { formatDate } from '../../utils/format';
import { ProfileFormValues, profileSchema } from '../../utils/validation';

const roleLabel: Record<'USER' | 'ADMIN', string> = {
  USER: 'Обучающийся',
  ADMIN: 'Администратор',
};

export function ProfilePage() {
  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      username: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        fullName: profileQuery.data.fullName,
        username: profileQuery.data.username ?? '',
        avatarUrl: profileQuery.data.profilePicture ?? '',
      });
    }
  }, [profileQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfileMutation.mutateAsync({
        fullName: values.fullName,
        username: values.username || undefined,
        avatarUrl: values.avatarUrl || undefined,
      });
      toast.success('Профиль обновлен');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  });

  if (profileQuery.isLoading) {
    return <Loader label="Загружаем профиль..." />;
  }

  if (profileQuery.isError) {
    return <ErrorState message={normalizeApiError(profileQuery.error).message} />;
  }

  const profile = profileQuery.data;
  if (!profile) {
    return <Loader label="Профиль не найден..." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Профиль пользователя</h1>
          <Link to="/stats">
            <Button variant="secondary">Статистика</Button>
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Очки</p>
            <p className="text-2xl font-semibold text-slate-900">{profile.totalPoints}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Роль</p>
            <p className="text-2xl font-semibold text-slate-900">{roleLabel[profile.role]}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-500 bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-600">Регистрация</p>
            <p className="text-lg font-semibold text-slate-900">{formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Редактировать профиль</h2>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <Input
            label="ФИО"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Имя пользователя"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="URL аватара"
            error={errors.avatarUrl?.message}
            {...register('avatarUrl')}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </form>
      </section>
    </div>
  );
}
```

---

## FRONTEND - Home Page

```typescript
import { useState } from 'react';
import { normalizeApiError } from '../api/errors';
import { GameCard } from '../components/common/GameCard';
import { QuizCard } from '../components/common/QuizCard';
import { TopicCard } from '../components/common/TopicCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Loader } from '../components/ui/Loader';
import { useGames } from '../features/games/hooks';
import { useQuizzes } from '../features/quizzes/hooks';
import { useTopics } from '../features/topics/hooks';

export function HomePage() {
  const topicsQuery = useTopics({ page: 1, limit: 12 });
  const [manualTopicId, setManualTopicId] = useState<number | undefined>(undefined);
  const selectedTopicId = manualTopicId ?? topicsQuery.data?.items[0]?.id;

  const gamesQuery = useGames(selectedTopicId);
  const quizzesQuery = useQuizzes(selectedTopicId);

  const selectedTopic = topicsQuery.data?.items.find((topic) => topic.id === selectedTopicId);

  if (topicsQuery.isLoading) {
    return <Loader label="Загружаем темы и активности..." />;
  }

  if (topicsQuery.isError) {
    return <ErrorState message={normalizeApiError(topicsQuery.error).message} />;
  }

  const topics = topicsQuery.data?.items ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Главная</h1>
        <p className="mt-2 text-slate-600">Выберите тему и переходите к играм, материалам и викторинам.</p>
      </section>

      <section className="rounded-xl border-4 border-slate-800 bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Темы</h2>
          {selectedTopic ? (
            <p className="rounded-lg border-2 border-slate-500 bg-slate-100 px-3 py-1 text-sm text-slate-700">
              Активная тема: {selectedTopic.title}
            </p>
          ) : null}
        </div>

        {topics.length === 0 ? (
          <EmptyState title="Темы не найдены" description="Администратор пока не опубликовал учебные темы." />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setManualTopicId(topic.id)}
                  className={`rounded-md border-2 px-3 py-1 text-sm ${
                    selectedTopicId === topic.id
                      ? 'border-slate-900 bg-slate-700 text-white'
                      : 'border-slate-500 bg-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {gamesQuery.data?.items && (
          <div className="rounded-xl border-4 border-slate-800 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">Игры</h2>
            <div className="mt-4 space-y-3">
              {gamesQuery.data.items.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {quizzesQuery.data?.items && (
          <div className="rounded-xl border-4 border-slate-800 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">Викторины</h2>
            <div className="mt-4 space-y-3">
              {quizzesQuery.data.items.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
```

---
