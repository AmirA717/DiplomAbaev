export interface BackupStorageOption {
  id: string;
  mediaType: string;
  offsite: boolean;
  cost: number;
}

export interface BackupRequiredRules {
  copies: number;
  mediaTypes: number;
  offsiteCopies: number;
}

export interface BackupPoints {
  copiesRule: number;
  mediaRule: number;
  offsiteRule: number;
  restoreTestBonus: number;
}

export function evaluateBackupStrategy(input: {
  selectedIds: string[];
  storageOptions: BackupStorageOption[];
  requiredRules: BackupRequiredRules;
  points: BackupPoints;
  budget: number;
  testRestore: boolean;
}) {
  const selectedOptions = input.storageOptions.filter((option) =>
    input.selectedIds.includes(option.id),
  );
  const uniqueMediaTypes = new Set(selectedOptions.map((option) => option.mediaType));
  const offsiteCount = selectedOptions.filter((option) => option.offsite).length;
  const totalCost = selectedOptions.reduce((sum, option) => sum + option.cost, 0);

  const copiesRuleMet = selectedOptions.length >= input.requiredRules.copies;
  const mediaRuleMet = uniqueMediaTypes.size >= input.requiredRules.mediaTypes;
  const offsiteRuleMet = offsiteCount >= input.requiredRules.offsiteCopies;
  const withinBudget = totalCost <= input.budget;

  const pointsEarned =
    (copiesRuleMet ? input.points.copiesRule : 0) +
    (mediaRuleMet ? input.points.mediaRule : 0) +
    (offsiteRuleMet ? input.points.offsiteRule : 0) +
    (input.testRestore ? input.points.restoreTestBonus : 0);

  const total =
    input.points.copiesRule +
    input.points.mediaRule +
    input.points.offsiteRule +
    input.points.restoreTestBonus;

  return {
    score: pointsEarned,
    total,
    pointsEarned,
    totalCost,
    withinBudget,
    status: {
      copiesRuleMet,
      mediaRuleMet,
      offsiteRuleMet,
      restoreTestMet: input.testRestore,
    },
    selectedOptions,
  };
}
