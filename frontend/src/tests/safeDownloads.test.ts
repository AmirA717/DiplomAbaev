import { describe, expect, it } from 'vitest';
import { evaluateSafeDownloads } from '../features/minigames/safeDownloads';

describe('safeDownloads', () => {
  it('evaluates selected actions for each download case', () => {
    const result = evaluateSafeDownloads({
      items: [
        { id: 'official', correctAction: 'Скачать', explanation: 'ok' },
        { id: 'mirror', correctAction: 'Отклонить', explanation: 'bad' },
      ],
      selections: {
        official: 'Скачать',
        mirror: 'Проверить',
      },
      pointsPerItem: 10,
    });

    expect(result.score).toBe(1);
    expect(result.pointsEarned).toBe(10);
    expect(result.details[1]?.isCorrect).toBe(false);
  });
});
