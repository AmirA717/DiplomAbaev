export type PasswordStrengthLevel =
  | 'VERY_WEAK'
  | 'WEAK'
  | 'MEDIUM'
  | 'STRONG'
  | 'VERY_STRONG';

export interface PasswordRuleCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface PasswordEvaluation {
  score: number;
  entropy: number;
  level: PasswordStrengthLevel;
  checks: PasswordRuleCheck[];
  feedback: string[];
}

export interface PasswordChallenge {
  id: string;
  title: string;
  description: string;
  targetScore: number;
  minLength: number;
}

const COMMON_PASSWORDS = new Set([
  '123456',
  '123456789',
  'qwerty',
  'password',
  '111111',
  '123123',
  'admin',
  'letmein',
  'welcome',
  'password1',
  'qwerty123',
  'iloveyou',
  'abc123',
  '12345678',
  '000000',
  'dragon',
  'sunshine',
  'football',
  'monkey',
  'shadow',
]);

const SEQUENCE_PATTERNS = [
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  'qwertyuiopasdfghjklzxcvbnm',
];

const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/\\|';

const WORDS = [
  'forest',
  'signal',
  'vector',
  'planet',
  'cipher',
  'anchor',
  'rocket',
  'matrix',
  'falcon',
  'harbor',
  'orbit',
  'nebula',
  'shelter',
  'guardian',
  'quantum',
  'pixel',
];

export const PASSWORD_CHALLENGES: PasswordChallenge[] = [
  {
    id: 'reach-medium',
    title: 'Дойдите до уровня "Средний"',
    description: 'Наберите минимум 50 баллов и длину 10+ символов.',
    targetScore: 50,
    minLength: 10,
  },
  {
    id: 'reach-strong',
    title: 'Дойдите до уровня "Сильный"',
    description: 'Наберите минимум 70 баллов и длину 12+ символов.',
    targetScore: 70,
    minLength: 12,
  },
  {
    id: 'reach-very-strong',
    title: 'Дойдите до уровня "Очень сильный"',
    description: 'Наберите минимум 85 баллов и длину 16+ символов.',
    targetScore: 85,
    minLength: 16,
  },
];

function hasSequence(input: string): boolean {
  const normalized = input.toLowerCase();
  if (normalized.length < 4) {
    return false;
  }

  return SEQUENCE_PATTERNS.some((pattern) => {
    const reversed = pattern.split('').reverse().join('');
    for (let i = 0; i <= pattern.length - 4; i += 1) {
      const piece = pattern.slice(i, i + 4);
      const reversePiece = reversed.slice(i, i + 4);
      if (normalized.includes(piece) || normalized.includes(reversePiece)) {
        return true;
      }
    }
    return false;
  });
}

function hasLongRepeat(input: string): boolean {
  return /(.)\1{3,}/.test(input);
}

function getCharPoolSize(input: string): number {
  let size = 0;
  if (/[a-z]/.test(input)) {
    size += 26;
  }
  if (/[A-Z]/.test(input)) {
    size += 26;
  }
  if (/[0-9]/.test(input)) {
    size += 10;
  }
  if (/[^a-zA-Z0-9]/.test(input)) {
    size += SYMBOLS.length;
  }
  return size;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function uniqueRatio(input: string): number {
  if (!input) {
    return 0;
  }
  return new Set(input).size / input.length;
}

export function getLevelLabel(level: PasswordStrengthLevel): string {
  switch (level) {
    case 'VERY_WEAK':
      return 'Очень слабый';
    case 'WEAK':
      return 'Слабый';
    case 'MEDIUM':
      return 'Средний';
    case 'STRONG':
      return 'Сильный';
    case 'VERY_STRONG':
      return 'Очень сильный';
    default:
      return 'Слабый';
  }
}

export function evaluatePassword(password: string): PasswordEvaluation {
  const normalized = password.trim();
  const length = normalized.length;
  const hasLower = /[a-z]/.test(normalized);
  const hasUpper = /[A-Z]/.test(normalized);
  const hasDigit = /[0-9]/.test(normalized);
  const hasSymbol = /[^a-zA-Z0-9]/.test(normalized);
  const isCommon = COMMON_PASSWORDS.has(normalized.toLowerCase());
  const sequenceDetected = hasSequence(normalized);
  const repeatDetected = hasLongRepeat(normalized);
  const uniqRatio = uniqueRatio(normalized);
  const poolSize = getCharPoolSize(normalized);

  let score = 0;
  score += Math.min(length, 20) * 3;
  score += [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length * 10;

  if (length >= 16) {
    score += 8;
  }
  if (length < 8) {
    score -= 30;
  } else if (length < 12) {
    score -= 10;
  }
  if (isCommon) {
    score -= 45;
  }
  if (sequenceDetected) {
    score -= 20;
  }
  if (repeatDetected) {
    score -= 15;
  }
  if (uniqRatio < 0.55 && length > 0) {
    score -= 10;
  }

  score = clamp(score, 0, 100);

  let entropy = 0;
  if (length > 0 && poolSize > 0) {
    entropy = length * Math.log2(poolSize);
    if (isCommon) {
      entropy *= 0.2;
    }
    if (sequenceDetected) {
      entropy *= 0.7;
    }
    if (repeatDetected) {
      entropy *= 0.75;
    }
    if (uniqRatio < 0.55) {
      entropy *= 0.8;
    }
  }
  entropy = Number(entropy.toFixed(1));

  let level: PasswordStrengthLevel = 'VERY_WEAK';
  if (score >= 85) {
    level = 'VERY_STRONG';
  } else if (score >= 70) {
    level = 'STRONG';
  } else if (score >= 50) {
    level = 'MEDIUM';
  } else if (score >= 30) {
    level = 'WEAK';
  }

  const checks: PasswordRuleCheck[] = [
    { key: 'length12', label: 'Длина не менее 12 символов', passed: length >= 12 },
    { key: 'length16', label: 'Длина 16+ для повышенной защиты', passed: length >= 16 },
    {
      key: 'variety',
      label: 'Есть строчные, заглавные, цифры и спецсимволы',
      passed: hasLower && hasUpper && hasDigit && hasSymbol,
    },
    {
      key: 'notCommon',
      label: 'Не входит в список популярных паролей',
      passed: !isCommon,
    },
    {
      key: 'noSequence',
      label: 'Нет последовательностей вроде 1234 или abcd',
      passed: !sequenceDetected,
    },
    {
      key: 'noLongRepeat',
      label: 'Нет длинных повторов символов (aaaa)',
      passed: !repeatDetected,
    },
  ];

  const feedback: string[] = [];
  if (length < 12) {
    feedback.push('Увеличьте длину до 12+ символов.');
  }
  if (!(hasLower && hasUpper && hasDigit && hasSymbol)) {
    feedback.push('Добавьте разные типы символов: A-z, 0-9, спецсимволы.');
  }
  if (isCommon) {
    feedback.push('Пароль слишком распространён и легко угадывается.');
  }
  if (sequenceDetected) {
    feedback.push('Обнаружена предсказуемая последовательность символов.');
  }
  if (repeatDetected) {
    feedback.push('Длинные повторы снижают устойчивость пароля.');
  }
  if (feedback.length === 0 && length > 0) {
    feedback.push('Отлично: пароль выглядит устойчивым к базовым атакам.');
  }

  return {
    score,
    entropy,
    level,
    checks,
    feedback,
  };
}

function randomItem(items: string[]): string {
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? items[0];
}

function randomChars(source: string, count: number): string {
  let result = '';
  for (let i = 0; i < count; i += 1) {
    result += source[Math.floor(Math.random() * source.length)] ?? '';
  }
  return result;
}

function generateMixedPassword(length = 16): string {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const all = `${lower}${upper}${digits}${SYMBOLS}`;

  const base = [
    randomChars(lower, 1),
    randomChars(upper, 1),
    randomChars(digits, 1),
    randomChars(SYMBOLS, 1),
    randomChars(all, Math.max(length - 4, 0)),
  ].join('');

  return base
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

function generatePassphrase(): string {
  const separator = randomItem(['-', '_', '.']);
  const words = [randomItem(WORDS), randomItem(WORDS), randomItem(WORDS), randomItem(WORDS)];
  const capitalized = words.map((word, index) =>
    index % 2 === 0 ? `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}` : word,
  );

  return `${capitalized.join(separator)}${randomChars('0123456789', 2)}${randomItem(
    SYMBOLS.split(''),
  )}`;
}

export function generatePasswordSuggestions(): string[] {
  const suggestions = new Set<string>();

  while (suggestions.size < 3) {
    if (suggestions.size === 1) {
      suggestions.add(generatePassphrase());
    } else if (suggestions.size === 2) {
      suggestions.add(generateMixedPassword(20));
    } else {
      suggestions.add(generateMixedPassword(16));
    }
  }

  return Array.from(suggestions);
}

export function isChallengeCompleted(
  challenge: PasswordChallenge,
  password: string,
  evaluation: PasswordEvaluation,
): boolean {
  return password.length >= challenge.minLength && evaluation.score >= challenge.targetScore;
}
