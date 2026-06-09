export interface UpdateTriageCase {
  id: string;
  correctLabel: string;
  explanation: string;
}

export interface UpdateTriageDetail {
  caseId: string;
  selectedLabel: string | null;
  correctLabel: string;
  explanation: string;
  isCorrect: boolean;
}

export function evaluateUpdateTriage(input: {
  cases: UpdateTriageCase[];
  selections: Record<string, string>;
  pointsPerCase: number;
}) {
  const details: UpdateTriageDetail[] = input.cases.map((item) => {
    const selectedLabel = input.selections[item.id] ?? null;
    return {
      caseId: item.id,
      selectedLabel,
      correctLabel: item.correctLabel,
      explanation: item.explanation,
      isCorrect: selectedLabel === item.correctLabel,
    };
  });

  const score = details.filter((detail) => detail.isCorrect).length;

  return {
    score,
    total: input.cases.length,
    pointsEarned: score * input.pointsPerCase,
    details,
  };
}
