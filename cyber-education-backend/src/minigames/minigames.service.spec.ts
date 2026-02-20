import { GamesService } from '../games/games.service';
import { PrismaService } from '../prisma/prisma.service';
import { MinigamesService } from './minigames.service';

describe('MinigamesService', () => {
  let service: MinigamesService;
  let prisma: {
    game: {
      findFirst: jest.Mock;
    };
  };
  let gamesService: {
    startAttempt: jest.Mock;
    finishAttempt: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      game: {
        findFirst: jest.fn(),
      },
    };
    gamesService = {
      startAttempt: jest.fn(),
      finishAttempt: jest.fn(),
    };

    service = new MinigamesService(
      prisma as unknown as PrismaService,
      gamesService as unknown as GamesService,
    );
  });

  it('returns phishing scenarios with default limit', () => {
    const result = service.listPhishingScenarios({});

    expect(result.items.length).toBe(10);
    expect(result.total).toBeGreaterThanOrEqual(10);
    expect(result.limit).toBe(10);
  });

  it('respects provided limit for phishing scenarios', () => {
    const result = service.listPhishingScenarios({ limit: 3 });

    expect(result.items).toHaveLength(3);
    expect(result.limit).toBe(3);
  });

  it('returns saved=false when game for result persistence is missing', async () => {
    prisma.game.findFirst.mockResolvedValue(null);

    const result = await service.saveResult(1, {
      type: 'PHISHING_DETECTOR',
      score: 7,
      total: 10,
    });

    expect(result.saved).toBe(false);
    expect(gamesService.startAttempt).not.toHaveBeenCalled();
  });
});
