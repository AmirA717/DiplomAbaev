export interface SafeDownloadItem {
  id: string;
  correctAction: string;
  explanation: string;
}

export interface SafeDownloadDetail {
  itemId: string;
  selectedAction: string | null;
  correctAction: string;
  explanation: string;
  isCorrect: boolean;
}

export function evaluateSafeDownloads(input: {
  items: SafeDownloadItem[];
  selections: Record<string, string>;
  pointsPerItem: number;
}) {
  const details: SafeDownloadDetail[] = input.items.map((item) => {
    const selectedAction = input.selections[item.id] ?? null;
    return {
      itemId: item.id,
      selectedAction,
      correctAction: item.correctAction,
      explanation: item.explanation,
      isCorrect: selectedAction === item.correctAction,
    };
  });

  const score = details.filter((detail) => detail.isCorrect).length;

  return {
    score,
    total: input.items.length,
    pointsEarned: score * input.pointsPerItem,
    details,
  };
}
