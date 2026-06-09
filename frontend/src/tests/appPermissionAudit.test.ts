import { describe, expect, it } from 'vitest';
import { evaluateAppPermissionAudit } from '../features/minigames/appPermissionAudit';

describe('appPermissionAudit', () => {
  it('requires exact permission matches per app', () => {
    const result = evaluateAppPermissionAudit({
      apps: [{ id: 'maps' }, { id: 'flashlight' }],
      expectedMatrix: {
        maps: ['location'],
        flashlight: [],
      },
      selectedMatrix: {
        maps: ['location'],
        flashlight: ['camera'],
      },
      pointsPerApp: 10,
    });

    expect(result.score).toBe(1);
    expect(result.pointsEarned).toBe(10);
    expect(result.details[1]?.extraPermissions).toEqual(['camera']);
  });
});
