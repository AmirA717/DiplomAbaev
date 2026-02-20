interface AnswerPayload {
  questionId: number;
  answerIds: number[];
}

export function buildAnswerPayloads(answerMap: Record<number, number[]>) {
  return Object.entries(answerMap)
    .map(([questionId, answerIds]) => ({
      questionId: Number(questionId),
      answerIds,
    }))
    .filter((item): item is AnswerPayload => Number.isFinite(item.questionId) && item.answerIds.length > 0);
}


