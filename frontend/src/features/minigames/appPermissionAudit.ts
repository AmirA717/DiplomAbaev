export interface PermissionApp {
  id: string;
}

export interface PermissionAuditDetail {
  appId: string;
  selectedPermissions: string[];
  expectedPermissions: string[];
  extraPermissions: string[];
  missingPermissions: string[];
  isCorrect: boolean;
}

function sortValues(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

export function evaluateAppPermissionAudit(input: {
  apps: PermissionApp[];
  expectedMatrix: Record<string, string[]>;
  selectedMatrix: Record<string, string[]>;
  pointsPerApp: number;
}) {
  const details: PermissionAuditDetail[] = input.apps.map((app) => {
    const selectedPermissions = sortValues(input.selectedMatrix[app.id] ?? []);
    const expectedPermissions = sortValues(input.expectedMatrix[app.id] ?? []);
    const selectedSet = new Set(selectedPermissions);
    const expectedSet = new Set(expectedPermissions);
    const extraPermissions = selectedPermissions.filter(
      (permissionId) => !expectedSet.has(permissionId),
    );
    const missingPermissions = expectedPermissions.filter(
      (permissionId) => !selectedSet.has(permissionId),
    );

    return {
      appId: app.id,
      selectedPermissions,
      expectedPermissions,
      extraPermissions,
      missingPermissions,
      isCorrect: extraPermissions.length === 0 && missingPermissions.length === 0,
    };
  });

  const score = details.filter((detail) => detail.isCorrect).length;

  return {
    score,
    total: input.apps.length,
    pointsEarned: score * input.pointsPerApp,
    details,
  };
}
