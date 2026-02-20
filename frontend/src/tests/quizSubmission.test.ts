import { describe, expect, it } from 'vitest';
import { buildAnswerPayloads } from '../api/adapters/quizSubmission';

describe('buildAnswerPayloads', () => {
  it('creates payload list and removes empty answers', () => {
    const payload = buildAnswerPayloads({
      1: [10],
      2: [],
      3: [30, 31],
    });

    expect(payload).toEqual([
      { questionId: 1, answerIds: [10] },
      { questionId: 3, answerIds: [30, 31] },
    ]);
  });
});


