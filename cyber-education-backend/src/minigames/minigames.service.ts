import { Injectable } from '@nestjs/common';
import { GameType } from '@prisma/client';
import { GamesService } from '../games/games.service';
import { PrismaService } from '../prisma/prisma.service';
import { PHISHING_SCENARIOS } from './data/phishing-scenarios';
import {
  PhishingScenariosQueryDto,
} from './dto/phishing-scenarios-query.dto';
import {
  SaveMinigameResultDto,
  SupportedMinigameType,
} from './dto/save-minigame-result.dto';

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
      gameType: dto.type as SupportedMinigameType,
      ...finishedAttempt,
    };
  }
}
