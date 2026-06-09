import { describe, expect, it } from 'vitest';
import { evaluateUpdateTriage } from '../features/minigames/updateTriage';

describe('updateTriage', () => {
  it('scores assigned labels against the correct columns', () => {
    const result = evaluateUpdateTriage({
      cases: [
        { id: 'browser', correctLabel: 'Срочно', explanation: 'critical' },
        { id: 'theme-pack', correctLabel: 'Можно отложить', explanation: 'optional' },
      ],
      selections: {
        browser: 'Срочно',
        'theme-pack': 'Запланировать',
      },
      pointsPerCase: 10,
    });

    expect(result.score).toBe(1);
    expect(result.pointsEarned).toBe(10);
    expect(result.details[1]?.correctLabel).toBe('Можно отложить');
  });
});
