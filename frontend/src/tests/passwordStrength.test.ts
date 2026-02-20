import { describe, expect, it } from 'vitest';
import {
  evaluatePassword,
  generatePasswordSuggestions,
  isChallengeCompleted,
  PASSWORD_CHALLENGES,
} from '../features/minigames/passwordStrength';

describe('passwordStrength', () => {
  it('marks common password as weak', () => {
    const result = evaluatePassword('password1');
    const commonCheck = result.checks.find((check) => check.key === 'notCommon');

    expect(result.score).toBeLessThan(40);
    expect(commonCheck?.passed).toBe(false);
  });

  it('returns strong score for complex long password', () => {
    const result = evaluatePassword('R!verStone#2026Falcon');

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.entropy).toBeGreaterThan(60);
  });

  it('generates three suggestions and at least one passes strong challenge', () => {
    const suggestions = generatePasswordSuggestions();
    const strongChallenge = PASSWORD_CHALLENGES.find(
      (challenge) => challenge.id === 'reach-strong',
    );

    expect(suggestions).toHaveLength(3);
    expect(strongChallenge).toBeDefined();
    expect(
      suggestions.some((suggestion) =>
        isChallengeCompleted(
          strongChallenge!,
          suggestion,
          evaluatePassword(suggestion),
        ),
      ),
    ).toBe(true);
  });
});
