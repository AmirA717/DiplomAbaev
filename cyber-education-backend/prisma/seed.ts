import {
  GameType,
  MaterialType,
  Prisma,
  PrismaClient,
  QuestionType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin12345!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@cyber.local' },
    update: {
      fullName: 'Администратор платформы',
      role: UserRole.ADMIN,
      username: 'admin',
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@cyber.local',
      fullName: 'Администратор платформы',
      role: UserRole.ADMIN,
      username: 'admin',
      passwordHash: adminPasswordHash,
    },
  });

  const phishingTopic = await prisma.topic.upsert({
    where: { slug: 'phishing' },
    update: {
      title: 'Фишинг',
      description: 'Как распознавать фишинговые сообщения и поддельные сайты',
      order: 1,
      isPublished: true,
    },
    create: {
      slug: 'phishing',
      title: 'Фишинг',
      description: 'Как распознавать фишинговые сообщения и поддельные сайты',
      order: 1,
      isPublished: true,
    },
  });

  const passwordsTopic = await prisma.topic.upsert({
    where: { slug: 'passwords' },
    update: {
      title: 'Пароли',
      description: 'Как создавать надёжные пароли и защищать аккаунты',
      order: 2,
      isPublished: true,
    },
    create: {
      slug: 'passwords',
      title: 'Пароли',
      description: 'Как создавать надёжные пароли и защищать аккаунты',
      order: 2,
      isPublished: true,
    },
  });

  await upsertMaterial({
    topicId: phishingTopic.id,
    type: MaterialType.TEXT,
    order: 1,
    content: 'Проверяйте адрес отправителя и домен сайта перед вводом учётных данных.',
  });

  await upsertMaterial({
    topicId: passwordsTopic.id,
    type: MaterialType.TEXT,
    order: 1,
    content: 'Используйте длинные уникальные пароли и менеджер паролей.',
  });

  await upsertGame({
    topicId: phishingTopic.id,
    title: 'Найди фишинг',
    type: GameType.PHISHING_DETECTOR,
    order: 1,
    isPublished: true,
    config: {
      rounds: 5,
      timerSeconds: 60,
    },
  });

  await upsertGame({
    topicId: passwordsTopic.id,
    title: 'Создай надёжный пароль',
    type: GameType.PASSWORD_STRENGTH,
    order: 1,
    isPublished: true,
    config: {
      minLength: 12,
    },
  });

  const phishingQuiz = await prisma.quiz.upsert({
    where: { id: 1001 },
    update: {
      topicId: phishingTopic.id,
      name: 'Основы фишинга',
      description: 'Проверьте, насколько хорошо вы распознаёте фишинг',
      order: 1,
      passingScore: 2,
      isActive: true,
      isPublished: true,
    },
    create: {
      id: 1001,
      topicId: phishingTopic.id,
      name: 'Основы фишинга',
      description: 'Проверьте, насколько хорошо вы распознаёте фишинг',
      order: 1,
      passingScore: 2,
      isActive: true,
      isPublished: true,
    },
  });

  const passwordsQuiz = await prisma.quiz.upsert({
    where: { id: 1002 },
    update: {
      topicId: passwordsTopic.id,
      name: 'Безопасность паролей',
      description: 'Проверьте свои знания по безопасности паролей',
      order: 1,
      passingScore: 2,
      isActive: true,
      isPublished: true,
    },
    create: {
      id: 1002,
      topicId: passwordsTopic.id,
      name: 'Безопасность паролей',
      description: 'Проверьте свои знания по безопасности паролей',
      order: 1,
      passingScore: 2,
      isActive: true,
      isPublished: true,
    },
  });

  await upsertQuestion(phishingQuiz.id, {
    order: 1,
    text: 'Какой признак часто указывает на фишинг?',
    type: QuestionType.SINGLE,
    explanation: 'Подозрительные ссылки и срочность — типичные признаки фишинга.',
    points: 1,
    answers: [
      { order: 1, text: 'Опечатки в домене', isCorrect: true },
      { order: 2, text: 'Письмо от учителя', isCorrect: false },
      { order: 3, text: 'Обычное приветствие', isCorrect: false },
    ],
  });

  await upsertQuestion(phishingQuiz.id, {
    order: 2,
    text: 'Что нужно сделать, если вы подозреваете фишинг?',
    type: QuestionType.MULTIPLE,
    explanation: 'Не переходите по ссылке и сообщите взрослому или администратору.',
    points: 1,
    answers: [
      { order: 1, text: 'Не переходить по ссылке', isCorrect: true },
      { order: 2, text: 'Сообщить учителю или родителю', isCorrect: true },
      { order: 3, text: 'Скачать вложение, чтобы проверить его', isCorrect: false },
    ],
  });

  await upsertQuestion(phishingQuiz.id, {
    order: 3,
    text: 'Можно ли вводить пароль на подозрительном сайте?',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Всегда проверяйте домен и сертификат сайта.',
    points: 1,
    answers: [
      { order: 1, text: 'Да', isCorrect: false },
      { order: 2, text: 'Нет', isCorrect: true },
    ],
  });

  await upsertQuestion(passwordsQuiz.id, {
    order: 1,
    text: 'Какой пароль более надёжный?',
    type: QuestionType.SINGLE,
    explanation: 'Длинный случайный пароль более надёжный.',
    points: 1,
    answers: [
      { order: 1, text: 'qwerty123', isCorrect: false },
      { order: 2, text: 'S!mplePwd', isCorrect: false },
      { order: 3, text: 'M7#kP9!tR2@vL5x', isCorrect: true },
    ],
  });

  await upsertQuestion(passwordsQuiz.id, {
    order: 2,
    text: 'Какие практики повышают безопасность пароля?',
    type: QuestionType.MULTIPLE,
    explanation: 'Уникальные пароли и двухфакторная аутентификация снижают риск.',
    points: 1,
    answers: [
      { order: 1, text: 'Один пароль для всех сайтов', isCorrect: false },
      { order: 2, text: 'Менеджер паролей', isCorrect: true },
      { order: 3, text: 'Двухфакторная аутентификация', isCorrect: true },
    ],
  });

  await upsertQuestion(passwordsQuiz.id, {
    order: 3,
    text: 'Можно ли делиться своим паролем с одноклассниками?',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Пароль — это личный секрет.',
    points: 1,
    answers: [
      { order: 1, text: 'Да', isCorrect: false },
      { order: 2, text: 'Нет', isCorrect: true },
    ],
  });

  await prisma.achievement.upsert({
    where: { code: 'FIRST_QUIZ' },
    update: {
      name: 'Первый тест',
      title: 'Первый тест',
      description: 'Пройти 1 тест',
      conditionType: 'quiz_count',
      criteria: { type: 'quiz_count', value: 1 },
      isActive: true,
    },
    create: {
      code: 'FIRST_QUIZ',
      name: 'Первый тест',
      title: 'Первый тест',
      description: 'Пройти 1 тест',
      conditionType: 'quiz_count',
      criteria: { type: 'quiz_count', value: 1 },
      isActive: true,
    },
  });

  await prisma.achievement.upsert({
    where: { code: 'POINTS_100' },
    update: {
      name: '100 баллов',
      title: '100 баллов',
      description: 'Набрать всего 100 баллов',
      conditionType: 'total_points',
      criteria: { type: 'total_points', value: 100 },
      isActive: true,
    },
    create: {
      code: 'POINTS_100',
      name: '100 баллов',
      title: '100 баллов',
      description: 'Набрать всего 100 баллов',
      conditionType: 'total_points',
      criteria: { type: 'total_points', value: 100 },
      isActive: true,
    },
  });

  console.log('Сидирование успешно завершено');
}

async function upsertMaterial(input: {
  topicId: number;
  type: MaterialType;
  order: number;
  content: string;
}) {
  const existing = await prisma.material.findFirst({
    where: {
      topicId: input.topicId,
      type: input.type,
      order: input.order,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.material.update({
      where: { id: existing.id },
      data: {
        content: input.content,
        isPublished: true,
      },
    });
    return;
  }

  await prisma.material.create({
    data: {
      topicId: input.topicId,
      type: input.type,
      order: input.order,
      content: input.content,
      isPublished: true,
    },
  });
}

async function upsertGame(input: {
  topicId: number;
  title: string;
  type: GameType;
  order: number;
  isPublished: boolean;
  config: Record<string, unknown>;
}) {
  const existing = await prisma.game.findFirst({
    where: {
      topicId: input.topicId,
      title: input.title,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.game.update({
      where: { id: existing.id },
      data: {
        type: input.type,
        order: input.order,
        isPublished: input.isPublished,
        config: input.config as Prisma.InputJsonValue,
      },
    });
    return;
  }

  await prisma.game.create({
    data: {
      topicId: input.topicId,
      title: input.title,
      type: input.type,
      order: input.order,
      isPublished: input.isPublished,
      config: input.config as Prisma.InputJsonValue,
    },
  });
}

async function upsertQuestion(
  quizId: number,
  input: {
    order: number;
    text: string;
    type: QuestionType;
    explanation: string;
    points: number;
    answers: Array<{
      order: number;
      text: string;
      isCorrect: boolean;
    }>;
  },
) {
  const existing = await prisma.question.findFirst({
    where: {
      order: input.order,
      quizQuestions: {
        some: { quizId },
      },
    },
    select: { id: true },
  });

  let questionId: number;

  if (existing) {
    const updated = await prisma.question.update({
      where: { id: existing.id },
      data: {
        text: input.text,
        type: input.type,
        explanation: input.explanation,
        points: input.points,
        order: input.order,
      },
      select: { id: true },
    });
    questionId = updated.id;

    await prisma.answer.deleteMany({
      where: { questionId },
    });
  } else {
    const created = await prisma.question.create({
      data: {
        text: input.text,
        type: input.type,
        explanation: input.explanation,
        points: input.points,
        order: input.order,
      },
      select: { id: true },
    });
    questionId = created.id;
  }

  await prisma.quizQuestion.upsert({
    where: {
      quizId_questionId: {
        quizId,
        questionId,
      },
    },
    update: {},
    create: {
      quizId,
      questionId,
    },
  });

  await prisma.answer.createMany({
    data: input.answers.map((answer) => ({
      questionId,
      order: answer.order,
      text: answer.text,
      isCorrect: answer.isCorrect,
    })),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });