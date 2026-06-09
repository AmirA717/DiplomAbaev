export interface MfaCorrectPair {
  methodId: string;
  explanation: string;
}

export interface MfaMatchDetail {
  accountId: string;
  selectedMethodId: string | null;
  correctMethodId: string;
  explanation: string;
  isCorrect: boolean;
}

export function evaluateMfaChallenge(input: {
  correctPairs: Record<string, MfaCorrectPair>;
  selections: Record<string, string>;
  pointsPerMatch: number;
}) {
  const details: MfaMatchDetail[] = Object.entries(input.correctPairs).map(
    ([accountId, pair]) => {
      const selectedMethodId = input.selections[accountId] ?? null;
      return {
        accountId,
        selectedMethodId,
        correctMethodId: pair.methodId,
        explanation: pair.explanation,
        isCorrect: selectedMethodId === pair.methodId,
      };
    },
  );

  const score = details.filter((detail) => detail.isCorrect).length;

  return {
    score,
    total: details.length,
    pointsEarned: score * input.pointsPerMatch,
    details,
  };
}
