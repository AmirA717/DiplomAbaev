import { ScoringService } from './scoring.service';

describe('ScoringService', () => {
  const service = new ScoringService();

  it('calculates score for fully correct answers', () => {
    const result = service.calculateScore({
      questions: [
        {
          id: 1,
          points: 2,
          explanation: null,
          answers: [
            { id: 11, isCorrect: true, text: 'a' },
            { id: 12, isCorrect: false, text: 'b' },
          ],
        },
      ],
      answersMap: new Map([[1, [11]]]),
    });

    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(2);
    expect(result.correctAnswersCount).toBe(1);
  });

  it('returns zero score for wrong answer set', () => {
    const result = service.calculateScore({
      questions: [
        {
          id: 1,
          points: 3,
          explanation: 'exp',
          answers: [
            { id: 11, isCorrect: true, text: 'a' },
            { id: 12, isCorrect: true, text: 'b' },
            { id: 13, isCorrect: false, text: 'c' },
          ],
        },
      ],
      answersMap: new Map([[1, [11]]]),
    });

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(3);
    expect(result.correctAnswersCount).toBe(0);
  });
});
