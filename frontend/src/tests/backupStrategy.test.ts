import { describe, expect, it } from 'vitest';
import { evaluateBackupStrategy } from '../features/minigames/backupStrategy';

describe('backupStrategy', () => {
  it('awards points for 3-2-1 coverage and restore test', () => {
    const result = evaluateBackupStrategy({
      selectedIds: ['laptop', 'disk', 'cloud'],
      storageOptions: [
        { id: 'laptop', mediaType: 'device', offsite: false, cost: 0 },
        { id: 'disk', mediaType: 'external-drive', offsite: false, cost: 20 },
        { id: 'cloud', mediaType: 'cloud', offsite: true, cost: 15 },
      ],
      requiredRules: {
        copies: 3,
        mediaTypes: 2,
        offsiteCopies: 1,
      },
      points: {
        copiesRule: 15,
        mediaRule: 15,
        offsiteRule: 10,
        restoreTestBonus: 10,
      },
      budget: 50,
      testRestore: true,
    });

    expect(result.pointsEarned).toBe(50);
    expect(result.withinBudget).toBe(true);
    expect(result.status.mediaRuleMet).toBe(true);
  });
});
