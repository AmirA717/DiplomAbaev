export type Role = 'USER' | 'ADMIN';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: number;
  email: string;
  username: string | null;
  fullName: string;
  role: Role;
  totalPoints: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Topic {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MaterialType = 'TEXT' | 'VIDEO' | 'LINK';

export interface Material {
  id: number;
  type: MaterialType;
  content: string;
  order: number;
  isPublished: boolean;
  topicId: number;
  createdAt: string;
  updatedAt: string;
}

export type GameType =
  | 'QUIZ_SIMULATION'
  | 'PHISHING_DETECTOR'
  | 'PASSWORD_STRENGTH'
  | 'SOCIAL_NETWORK_SCENARIO';

export interface Game {
  id: number;
  title: string;
  type: GameType;
  config: Record<string, unknown> | null;
  topicId: number;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameAttempt {
  id: number;
  gameId: number;
  startedAt: string;
}

export interface FinishedGameAttempt {
  attemptId: number;
  status: 'finished';
  pointsEarned: number;
}

export type PhishingScenarioLabel = 'PHISHING' | 'SAFE';
export type PhishingScenarioChannel = 'EMAIL' | 'CHAT' | 'SMS';

export interface PhishingIndicator {
  key:
    | 'sender'
    | 'domain'
    | 'url'
    | 'urgency'
    | 'credentials'
    | 'attachment'
    | 'grammar'
    | 'payment';
  text: string;
}

export interface PhishingScenario {
  id: string;
  channel: PhishingScenarioChannel;
  sender: string;
  senderAddress: string;
  subject?: string;
  preview: string;
  body: string;
  url?: string;
  label: PhishingScenarioLabel;
  hint: string;
  suspiciousParts: string[];
  indicators: PhishingIndicator[];
  explanation: string;
}

export interface SaveMinigameResultPayload {
  type: 'PHISHING_DETECTOR' | 'PASSWORD_STRENGTH';
  score?: number;
  total?: number;
  pointsEarned?: number;
  details?: Record<string, unknown>;
}

export interface SaveMinigameResultResponse {
  saved: boolean;
  reason?: string;
  gameType?: 'PHISHING_DETECTOR' | 'PASSWORD_STRENGTH';
  attemptId?: number;
  status?: 'finished';
  pointsEarned?: number;
}

export interface Quiz {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isPublished: boolean;
  passingScore: number;
  order: number;
  topicId: number | null;
}

export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE';

export interface QuestionAnswer {
  id: number;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: number;
  text: string;
  type: QuestionType;
  points: number;
  explanation?: string;
  answers: QuestionAnswer[];
}

export interface QuizAttempt {
  id: number;
  startedAt: string;
  maxScore: number;
}

export interface QuizResultDetail {
  questionId: number;
  isCorrect: boolean;
  selectedAnswerIds: number[];
  explanation: string | null;
}

export interface QuizSubmitResult {
  attemptId: number;
  score: number;
  maxScore: number;
  correctAnswersCount: number;
  details: QuizResultDetail[];
  passed: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string | null;
  fullName: string;
  profilePicture: string | null;
  role: Role;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicProgress {
  id: number;
  completedGamesCount: number;
  completedQuizzesCount: number;
  bestQuizScore: number;
  totalPoints: number;
  updatedAt: string;
  topicId: number;
  topic: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface UserStats {
  userId: number;
  totalPoints: number;
  completedQuizzes: number;
  completedGames: number;
  completedTopics: number;
  scoreSummary: {
    earned: number;
    possible: number;
  };
  topicProgresses: TopicProgress[];
}

export interface Achievement {
  userId?: number;
  achievementId?: number;
  earnedAt?: string;
  achievement: {
    id: number;
    code: string;
    title: string | null;
    name: string;
    description: string;
    icon: string | null;
  };
}

export interface AdminOverview {
  usersCount: number;
  attemptsCount: {
    quizzes: number;
    games: number;
  };
  averageQuizScore: {
    score: number;
    maxScore: number;
  };
  topTopics: Array<{
    id: number;
    title: string;
    slug: string;
    _count: {
      quizzes: number;
      games: number;
    };
  }>;
  quizCompletionConversionPercent: number;
}

export interface AdminQuiz {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isPublished: boolean;
  passingScore: number;
  order: number;
  topicId: number | null;
  topic: {
    id: number;
    title: string;
    slug: string;
  } | null;
  _count: {
    quizQuestions: number;
  };
}

export interface AdminQuestionAnswer {
  id: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface AdminQuestion {
  id: number;
  text: string;
  type: QuestionType;
  explanation: string | null;
  points: number;
  order: number;
  answers: AdminQuestionAnswer[];
}

export interface AdminLearnerStats {
  userId: number;
  email: string;
  username: string | null;
  fullName: string;
  totalPoints: number;
  registeredAt: string;
  completedQuizzes: number;
  completedGames: number;
  completedTopics: number;
  scoreSummary: {
    earned: number;
    possible: number;
  };
}

export interface UpdateProfilePayload {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  username?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}


