import { Injectable } from '@nestjs/common';

interface ScoreInput {
  questions: Array<{
    id: number;
    points: number;
    explanation: string | null;
    answers: Array<{ id: number; isCorrect: boolean; text: string }>;
  }>;
  answersMap: Map<number, number[]>;
}

@Injectable()
export class ScoringService {
  calculateScore(input: ScoreInput) {
    let score = 0;
    let maxScore = 0;
    let correctAnswersCount = 0;

    const details = input.questions.map((question) => {
      maxScore += question.points;
      const selectedIds = new Set(input.answersMap.get(question.id) ?? []);
      const correctIds = new Set(
        question.answers.filter((a) => a.isCorrect).map((a) => a.id),
      );

      const isCorrect =
        selectedIds.size === correctIds.size &&
        [...selectedIds].every((id) => correctIds.has(id));

      if (isCorrect) {
        score += question.points;
        correctAnswersCount += 1;
      }

      return {
        questionId: question.id,
        isCorrect,
        selectedAnswerIds: [...selectedIds],
        explanation: question.explanation,
      };
    });

    return {
      score,
      maxScore,
      correctAnswersCount,
      details,
    };
  }
}
