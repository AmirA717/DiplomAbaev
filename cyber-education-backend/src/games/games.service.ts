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
    if (attempt.isFinished) {
      throw new BadRequestException('Попытка уже завершена');
    }

    const points = dto.pointsEarned ?? 0;

    await this.prisma.$transaction(async (tx) => {
      await tx.gameAttempt.update({
        where: { id: attemptId },
        data: {
          finishedAt: new Date(),
          isFinished: true,
          pointsEarned: points,
          result: dto.result as Prisma.InputJsonValue | undefined,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: points },
        },
      });

      const existingProgress = await tx.topicProgress.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId: attempt.game.topicId,
          },
        },
        select: { id: true },
      });

      if (existingProgress) {
        await tx.topicProgress.update({
          where: {
            userId_topicId: {
              userId,
              topicId: attempt.game.topicId,
            },
          },
          data: {
            completedGamesCount: { increment: 1 },
            totalPoints: { increment: points },
          },
        });
      } else {
        await tx.topicProgress.create({
          data: {
            userId,
            topicId: attempt.game.topicId,
            completedGamesCount: 1,
            totalPoints: points,
          },
        });
      }

      await this.achievementsService.evaluateAndGrant(tx, userId);
    });

    return {
      attemptId,
      status: 'finished',
      pointsEarned: points,
    };
  }
}
