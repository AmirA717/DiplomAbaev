import { describe, expect, it } from 'vitest';
import { evaluateMfaChallenge } from '../features/minigames/mfaChallenge';

describe('mfaChallenge', () => {
  it('counts correct matches and points', () => {
    const result = evaluateMfaChallenge({
      correctPairs: {
        mail: { methodId: 'totp', explanation: 'best' },
        bank: { methodId: 'hardware', explanation: 'best' },
      },
      selections: {
        mail: 'totp',
        bank: 'sms',
      },
      pointsPerMatch: 10,
    });

    expect(result.score).toBe(1);
    expect(result.pointsEarned).toBe(10);
    expect(result.details[1]?.isCorrect).toBe(false);
  });
});
