import { z } from 'zod';

export const mfaChallengeConfigSchema = z.object({
  accounts: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  ),
  methods: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
    }),
  ),
  correctPairs: z.record(
    z.string(),
    z.object({
      methodId: z.string(),
      explanation: z.string(),
    }),
  ),
  pointsPerMatch: z.number().int().positive(),
});

export const updateTriageConfigSchema = z.object({
  cases: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      context: z.string(),
      correctLabel: z.string(),
      explanation: z.string(),
    }),
  ),
  labels: z.array(z.string()).min(3),
  pointsPerCase: z.number().int().positive(),
});

export const backupStrategyConfigSchema = z.object({
  storageOptions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      mediaType: z.string(),
      offsite: z.boolean(),
      cost: z.number().nonnegative(),
    }),
  ),
  requiredRules: z.object({
    copies: z.number().int().positive(),
    mediaTypes: z.number().int().positive(),
    offsiteCopies: z.number().int().positive(),
  }),
  budget: z.number().nonnegative(),
  points: z.object({
    copiesRule: z.number().nonnegative(),
    mediaRule: z.number().nonnegative(),
    offsiteRule: z.number().nonnegative(),
    restoreTestBonus: z.number().nonnegative(),
  }),
});

export const safeDownloadsConfigSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      context: z.string(),
      correctAction: z.string(),
      explanation: z.string(),
    }),
  ),
  actions: z.array(z.string()).min(3),
  pointsPerItem: z.number().int().positive(),
});

export const appPermissionAuditConfigSchema = z.object({
  apps: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  ),
  permissions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
    }),
  ),
  expectedMatrix: z.record(z.string(), z.array(z.string())),
  pointsPerApp: z.number().int().positive(),
});

export type MfaChallengeConfig = z.infer<typeof mfaChallengeConfigSchema>;
export type UpdateTriageConfig = z.infer<typeof updateTriageConfigSchema>;
export type BackupStrategyConfig = z.infer<typeof backupStrategyConfigSchema>;
export type SafeDownloadsConfig = z.infer<typeof safeDownloadsConfigSchema>;
export type AppPermissionAuditConfig = z.infer<typeof appPermissionAuditConfigSchema>;
