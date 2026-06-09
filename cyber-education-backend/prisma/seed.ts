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

type TopicSeed = {
  slug: string;
  title: string;
  description: string;
  order: number;
};

type MaterialSeed = {
  topicSlug: string;
  type: MaterialType;
  order: number;
  content: string;
};

type GameSeed = {
  topicSlug: string;
  title: string;
  type: GameType;
  order: number;
  isPublished: boolean;
  config: Record<string, unknown>;
};

type QuizSeed = {
  id: number;
  topicSlug: string;
  name: string;
  description: string;
  order: number;
  passingScore: number;
  isActive: boolean;
  isPublished: boolean;
};

type QuestionSeed = {
  quizId: number;
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
};

const TOPICS: TopicSeed[] = [
  {
    slug: 'phishing',
    title: 'Фишинг',
    description: 'Как распознавать фишинговые сообщения и поддельные сайты',
    order: 1,
  },
  {
    slug: 'passwords',
    title: 'Пароли',
    description: 'Как создавать надёжные пароли и защищать аккаунты',
    order: 2,
  },
  {
    slug: 'two-factor-auth',
    title: 'Двухфакторная аутентификация',
    description: 'Как второй фактор помогает защитить аккаунты, даже если пароль уже утёк',
    order: 3,
  },
  {
    slug: 'software-updates',
    title: 'Обновления и патчи',
    description: 'Почему обновления безопасности нельзя откладывать без причины',
    order: 4,
  },
  {
    slug: 'backups',
    title: 'Резервные копии',
    description: 'Как собрать простую и надёжную backup-стратегию по правилу 3-2-1',
    order: 5,
  },
  {
    slug: 'safe-downloads',
    title: 'Безопасный браузер и загрузки',
    description: 'Как скачивать файлы и расширения без лишнего риска',
    order: 6,
  },
  {
    slug: 'app-permissions',
    title: 'Разрешения приложений',
    description: 'Как выдавать приложениям только те права, которые реально нужны',
    order: 7,
  },
];

const MATERIALS: MaterialSeed[] = [
  {
    topicSlug: 'phishing',
    type: MaterialType.TEXT,
    order: 1,
    content:
      'Проверяйте адрес отправителя и домен сайта перед вводом учётных данных.',
  },
  {
    topicSlug: 'passwords',
    type: MaterialType.TEXT,
    order: 1,
    content:
      'Используйте длинные уникальные пароли и менеджер паролей.',
  },
  {
    topicSlug: 'two-factor-auth',
    type: MaterialType.TEXT,
    order: 1,
    content:
      '2FA или MFA означает, что для входа нужен не только пароль, но и второй шаг: код из приложения, подтверждение на устройстве или аппаратный ключ. Это важно, потому что пароли могут утечь, быть угаданы или украдены через фишинг. Если злоумышленник знает только пароль, второй фактор часто останавливает атаку.',
  },
  {
    topicSlug: 'two-factor-auth',
    type: MaterialType.TEXT,
    order: 2,
    content:
      'Для большинства аккаунтов лучше выбирать приложение-аутентификатор с TOTP или аппаратный ключ. Push-уведомления удобны, но их нельзя подтверждать автоматически. SMS лучше, чем ничего, но слабее из-за риска перехвата номера. Обязательно сохраните backup-коды и продумайте восстановление доступа заранее.',
  },
  {
    topicSlug: 'software-updates',
    type: MaterialType.TEXT,
    order: 1,
    content:
      'Обновления и патчи закрывают уязвимости, которые могут использовать вирусы и злоумышленники. Даже если программа кажется “обычной”, старая версия может содержать известную дыру. Поэтому обновлять нужно не только антивирус, но и операционную систему, браузер, мессенджеры и роутер.',
  },
  {
    topicSlug: 'software-updates',
    type: MaterialType.TEXT,
    order: 2,
    content:
      'Безопаснее всего включать автообновления для ОС и браузера, а приложения скачивать только с официальных источников. Перед крупным обновлением полезно проверить свободное место и сделать резервную копию важных файлов. Если устройство редко получает обновления от производителя, это уже сигнал риска.',
  },
  {
    topicSlug: 'backups',
    type: MaterialType.TEXT,
    order: 1,
    content:
      'Правило 3-2-1 означает: держите 3 копии данных, используйте минимум 2 разных типа носителей и храните 1 копию вне основного места. Тогда поломка ноутбука, ошибка пользователя или вирус-шифровальщик не уничтожат всё сразу.',
  },
  {
    topicSlug: 'backups',
    type: MaterialType.TEXT,
    order: 2,
    content:
      'Резервная копия полезна только тогда, когда вы умеете из неё восстанавливаться. Периодически проверяйте восстановление нескольких файлов и не храните все копии в одном месте. Если один и тот же компьютер заражён, подключённый к нему диск тоже может пострадать.',
  },
  {
    topicSlug: 'safe-downloads',
    type: MaterialType.TEXT,
    order: 1,
    content:
      'Перед скачиванием проверьте, откуда именно идёт файл: официальный сайт, магазин приложений или проверенный репозиторий. Обращайте внимание на домен, цифровую подпись, checksum и тип файла. Файлы вида .exe, .msi, .apk и архивы с установщиками требуют особенно внимательной проверки.',
  },
  {
    topicSlug: 'safe-downloads',
    type: MaterialType.TEXT,
    order: 2,
    content:
      'Красные флаги: фейковые кнопки “Download”, зеркала с рекламой, bundle-установщики, неожиданные просьбы отключить защиту и расширения с лишними разрешениями. Если сайт торопит вас или просит поставить “ускоритель загрузки”, лучше остановиться и найти официальный источник.',
  },
  {
    topicSlug: 'app-permissions',
    type: MaterialType.TEXT,
    order: 1,
    content:
      'Принцип минимальных привилегий означает, что приложению дают только те разрешения, которые нужны для его задачи. Фонарик не должен читать контакты, а калькулятору не нужен микрофон. Чем меньше лишних прав, тем меньше данных можно случайно раскрыть.',
  },
  {
    topicSlug: 'app-permissions',
    type: MaterialType.TEXT,
    order: 2,
    content:
      'Разрешения стоит пересматривать после установки, после крупных обновлений и если приложение давно не использовалось. Для камеры, микрофона, геолокации и фоновой активности лучше выбирать режим “только во время использования”, если этого достаточно. Лишние фоновые разрешения сильнее всего влияют на приватность.',
  },
];

const GAMES: GameSeed[] = [
  {
    topicSlug: 'phishing',
    title: 'Найди фишинг',
    type: GameType.PHISHING_DETECTOR,
    order: 1,
    isPublished: true,
    config: {
      rounds: 5,
      timerSeconds: 60,
    },
  },
  {
    topicSlug: 'passwords',
    title: 'Создай надёжный пароль',
    type: GameType.PASSWORD_STRENGTH,
    order: 1,
    isPublished: true,
    config: {
      minLength: 12,
    },
  },
  {
    topicSlug: 'two-factor-auth',
    title: 'Подбери лучший второй фактор',
    type: GameType.MFA_CHALLENGE,
    order: 1,
    isPublished: true,
    config: {
      accounts: [
        {
          id: 'school-mail',
          title: 'Школьная почта',
          description: 'В почте есть оценки, восстановление других аккаунтов и переписка.',
        },
        {
          id: 'social-main',
          title: 'Основная соцсеть',
          description: 'Входите почти каждый день со смартфона.',
        },
        {
          id: 'family-bank',
          title: 'Банковское приложение семьи',
          description: 'Нужна максимальная защита для денежных операций.',
        },
        {
          id: 'gaming-account',
          title: 'Игровой аккаунт',
          description: 'Есть покупки и редкие предметы, вход с домашнего ПК.',
        },
        {
          id: 'cloud-drive',
          title: 'Облачный диск',
          description: 'Хранятся документы и резервные копии фотографий.',
        },
      ],
      methods: [
        {
          id: 'totp-app',
          label: 'Код из приложения-аутентификатора (TOTP)',
          description: 'Надёжный вариант без SMS и без зависимости от оператора.',
        },
        {
          id: 'push-confirm',
          label: 'Push-подтверждение',
          description: 'Удобно, но нужно внимательно проверять запросы.',
        },
        {
          id: 'hardware-key',
          label: 'Аппаратный ключ',
          description: 'Очень сильный второй фактор для критичных аккаунтов.',
        },
        {
          id: 'backup-codes',
          label: 'Backup-коды',
          description: 'Нужны как запасной способ восстановления, но не как основной ежедневный фактор.',
        },
        {
          id: 'sms-code',
          label: 'SMS-код',
          description: 'Лучше, чем один пароль, но слабее TOTP и аппаратного ключа.',
        },
        {
          id: 'no-mfa',
          label: 'Оставить только пароль',
          description: 'Самый слабый вариант. Его лучше избегать.',
        },
      ],
      correctPairs: {
        'school-mail': {
          methodId: 'totp-app',
          explanation: 'Почта часто используется для восстановления доступа, поэтому TOTP даёт хороший баланс защиты и удобства.',
        },
        'social-main': {
          methodId: 'push-confirm',
          explanation: 'Для ежедневного входа push удобно, если не подтверждать неожиданные запросы вслепую.',
        },
        'family-bank': {
          methodId: 'hardware-key',
          explanation: 'Для финансовых аккаунтов лучше выбирать самый стойкий фактор, если сервис его поддерживает.',
        },
        'gaming-account': {
          methodId: 'sms-code',
          explanation: 'Для игрового аккаунта SMS приемлем как базовая защита, хотя TOTP был бы ещё лучше.',
        },
        'cloud-drive': {
          methodId: 'backup-codes',
          explanation: 'Облачный диск критичен для данных, поэтому важно помнить о запасном способе входа и восстановлении.',
        },
      },
      pointsPerMatch: 10,
    },
  },
  {
    topicSlug: 'software-updates',
    title: 'Триаж обновлений',
    type: GameType.UPDATE_TRIAGE,
    order: 1,
    isPublished: true,
    config: {
      cases: [
        {
          id: 'browser-zero-day',
          title: 'Браузер сообщил о критическом обновлении',
          context: 'Исправляется активно используемая уязвимость для просмотра сайтов.',
          correctLabel: 'Срочно',
          explanation: 'Браузер работает с интернетом постоянно, а известная критическая уязвимость требует быстрого обновления.',
        },
        {
          id: 'router-firmware',
          title: 'Для домашнего роутера вышла новая прошивка',
          context: 'В описании есть исправления безопасности для удалённого доступа.',
          correctLabel: 'Срочно',
          explanation: 'Роутер стоит на границе сети, поэтому уязвимость в нём опасна для всех устройств дома.',
        },
        {
          id: 'office-feature-pack',
          title: 'Офисный пакет предлагает крупное функциональное обновление',
          context: 'Добавлены новые шаблоны и интерфейс, про исправление критичных CVE не сказано.',
          correctLabel: 'Запланировать',
          explanation: 'Это похоже на обычное плановое обновление без сигнала немедленной угрозы, но откладывать навсегда не стоит.',
        },
        {
          id: 'pirated-editor',
          title: 'Пиратский редактор просит обновиться через неизвестный загрузчик',
          context: 'Сайт-источник неофициальный, подпись отсутствует.',
          correctLabel: 'Срочно',
          explanation: 'Срочность здесь не в установке обновления, а в том, что такой софт нужно заменить на официальный и безопасный вариант как можно быстрее.',
        },
        {
          id: 'game-cosmetics',
          title: 'Игровой лаунчер скачивает пакет скинов',
          context: 'Это необязательный косметический набор без исправлений безопасности.',
          correctLabel: 'Можно отложить',
          explanation: 'Если обновление не связано с безопасностью и не влияет на защиту данных, его можно отложить.',
        },
      ],
      labels: ['Срочно', 'Запланировать', 'Можно отложить'],
      pointsPerCase: 10,
    },
  },
  {
    topicSlug: 'backups',
    title: 'Собери стратегию 3-2-1',
    type: GameType.BACKUP_STRATEGY,
    order: 1,
    isPublished: true,
    config: {
      storageOptions: [
        {
          id: 'laptop',
          title: 'Ноутбук',
          description: 'Основные файлы находятся здесь каждый день.',
          mediaType: 'device',
          offsite: false,
          cost: 0,
        },
        {
          id: 'external-hdd',
          title: 'Внешний жёсткий диск',
          description: 'Подключается для резервного копирования раз в неделю.',
          mediaType: 'external-drive',
          offsite: false,
          cost: 25,
        },
        {
          id: 'usb-drive',
          title: 'USB-флешка',
          description: 'Небольшой носитель для отдельных важных файлов.',
          mediaType: 'flash-drive',
          offsite: false,
          cost: 10,
        },
        {
          id: 'cloud-storage',
          title: 'Облачное хранилище',
          description: 'Копия хранится в аккаунте с отдельным входом.',
          mediaType: 'cloud',
          offsite: true,
          cost: 15,
        },
        {
          id: 'nas-home',
          title: 'Домашнее NAS-хранилище',
          description: 'Сетевое хранилище дома, удобно для автоматических копий.',
          mediaType: 'nas',
          offsite: false,
          cost: 35,
        },
        {
          id: 'relative-drive',
          title: 'Диск у родственников',
          description: 'Отключённый диск хранится в другом месте.',
          mediaType: 'external-drive',
          offsite: true,
          cost: 20,
        },
      ],
      requiredRules: {
        copies: 3,
        mediaTypes: 2,
        offsiteCopies: 1,
      },
      budget: 50,
      points: {
        copiesRule: 15,
        mediaRule: 15,
        offsiteRule: 10,
        restoreTestBonus: 10,
      },
    },
  },
  {
    topicSlug: 'safe-downloads',
    title: 'Решения по загрузкам',
    type: GameType.SAFE_DOWNLOADS,
    order: 1,
    isPublished: true,
    config: {
      items: [
        {
          id: 'official-browser',
          title: 'Обновление браузера с официального сайта',
          context: 'Домен совпадает с производителем, есть HTTPS и цифровая подпись.',
          correctAction: 'Скачать',
          explanation: 'Это типичный случай безопасной загрузки с официального источника.',
        },
        {
          id: 'mirror-zip',
          title: 'Архив .zip с “ускорителем загрузки” на зеркале',
          context: 'Сайт пестрит рекламой, точный издатель непонятен.',
          correctAction: 'Отклонить',
          explanation: 'Неофициальные зеркала и навязанные загрузчики часто добавляют лишнее ПО или вредоносный код.',
        },
        {
          id: 'checksum-tool',
          title: 'Утилита с GitHub Releases и checksum',
          context: 'Есть файл хеша и подпись релиза, но вы ещё не проверяли их.',
          correctAction: 'Проверить',
          explanation: 'Источник выглядит лучше среднего, но перед запуском стоит проверить checksum или подпись.',
        },
        {
          id: 'extension-coupons',
          title: 'Расширение для “поиска скидок”',
          context: 'Просит доступ ко всем сайтам, вкладкам и истории браузера.',
          correctAction: 'Отклонить',
          explanation: 'Для простой купонной функции такой объём прав выглядит избыточно и рискованно.',
        },
        {
          id: 'school-pdf',
          title: 'PDF с заданиями от школьного портала',
          context: 'Файл лежит на знакомом домене, но ссылка пришла в мессенджере.',
          correctAction: 'Проверить',
          explanation: 'Даже знакомый файл лучше дополнительно проверить по домену и источнику ссылки, прежде чем открывать.',
        },
      ],
      actions: ['Скачать', 'Проверить', 'Отклонить'],
      pointsPerItem: 10,
    },
  },
  {
    topicSlug: 'app-permissions',
    title: 'Аудит разрешений приложений',
    type: GameType.APP_PERMISSION_AUDIT,
    order: 1,
    isPublished: true,
    config: {
      apps: [
        {
          id: 'flashlight',
          title: 'Фонарик',
          description: 'Нужен только для включения вспышки как фонарика.',
        },
        {
          id: 'maps',
          title: 'Навигатор',
          description: 'Прокладывает маршруты и показывает пробки.',
        },
        {
          id: 'video-call',
          title: 'Приложение для видеозвонков',
          description: 'Используется для уроков и звонков.',
        },
        {
          id: 'weather',
          title: 'Погода',
          description: 'Показывает прогноз рядом с вашим городом.',
        },
        {
          id: 'photo-editor',
          title: 'Фоторедактор',
          description: 'Редактирует картинки из галереи.',
        },
      ],
      permissions: [
        {
          id: 'camera',
          label: 'Камера',
          description: 'Нужна для фото и видео.',
        },
        {
          id: 'microphone',
          label: 'Микрофон',
          description: 'Нужен для звонков и записи аудио.',
        },
        {
          id: 'location',
          label: 'Геолокация',
          description: 'Нужна для карт и некоторых локальных сервисов.',
        },
        {
          id: 'contacts',
          label: 'Контакты',
          description: 'Нужны, если приложение действительно работает со списком контактов.',
        },
        {
          id: 'photos',
          label: 'Фото и файлы',
          description: 'Нужны для выбора и сохранения изображений.',
        },
      ],
      expectedMatrix: {
        flashlight: [],
        maps: ['location'],
        'video-call': ['camera', 'microphone'],
        weather: ['location'],
        'photo-editor': ['photos'],
      },
      pointsPerApp: 10,
    },
  },
];

const QUIZZES: QuizSeed[] = [
  {
    id: 1001,
    topicSlug: 'phishing',
    name: 'Основы фишинга',
    description: 'Проверьте, насколько хорошо вы распознаёте фишинг',
    order: 1,
    passingScore: 2,
    isActive: true,
    isPublished: true,
  },
  {
    id: 1002,
    topicSlug: 'passwords',
    name: 'Безопасность паролей',
    description: 'Проверьте свои знания по безопасности паролей',
    order: 1,
    passingScore: 2,
    isActive: true,
    isPublished: true,
  },
  {
    id: 1003,
    topicSlug: 'two-factor-auth',
    name: '2FA и MFA без паники',
    description: 'Проверьте, как выбирать второй фактор и безопасно восстанавливать доступ',
    order: 1,
    passingScore: 3,
    isActive: true,
    isPublished: true,
  },
  {
    id: 1004,
    topicSlug: 'software-updates',
    name: 'Обновления без откладывания',
    description: 'Проверьте, когда обновляться срочно, а когда можно планово',
    order: 1,
    passingScore: 3,
    isActive: true,
    isPublished: true,
  },
  {
    id: 1005,
    topicSlug: 'backups',
    name: 'Резервные копии 3-2-1',
    description: 'Проверьте, как хранить копии данных так, чтобы они реально помогли',
    order: 1,
    passingScore: 3,
    isActive: true,
    isPublished: true,
  },
  {
    id: 1006,
    topicSlug: 'safe-downloads',
    name: 'Безопасные загрузки',
    description: 'Проверьте, умеете ли вы отличать безопасную загрузку от рискованной',
    order: 1,
    passingScore: 3,
    isActive: true,
    isPublished: true,
  },
  {
    id: 1007,
    topicSlug: 'app-permissions',
    name: 'Минимальные разрешения',
    description: 'Проверьте, какие права приложениям действительно нужны',
    order: 1,
    passingScore: 3,
    isActive: true,
    isPublished: true,
  },
];

const QUESTIONS: QuestionSeed[] = [
  {
    quizId: 1001,
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
  },
  {
    quizId: 1001,
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
  },
  {
    quizId: 1001,
    order: 3,
    text: 'Можно ли вводить пароль на подозрительном сайте?',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Всегда проверяйте домен и сертификат сайта.',
    points: 1,
    answers: [
      { order: 1, text: 'Да', isCorrect: false },
      { order: 2, text: 'Нет', isCorrect: true },
    ],
  },
  {
    quizId: 1002,
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
  },
  {
    quizId: 1002,
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
  },
  {
    quizId: 1002,
    order: 3,
    text: 'Можно ли делиться своим паролем с одноклассниками?',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Пароль — это личный секрет.',
    points: 1,
    answers: [
      { order: 1, text: 'Да', isCorrect: false },
      { order: 2, text: 'Нет', isCorrect: true },
    ],
  },
  {
    quizId: 1003,
    order: 1,
    text: 'Какой второй фактор обычно лучше SMS для повседневной защиты аккаунта?',
    type: QuestionType.SINGLE,
    explanation: 'TOTP-коды из приложения не зависят от оператора и обычно устойчивее SMS.',
    points: 1,
    answers: [
      { order: 1, text: 'Код из приложения-аутентификатора (TOTP)', isCorrect: true },
      { order: 2, text: 'Один и тот же пароль, но длиннее', isCorrect: false },
      { order: 3, text: 'Подсказка к паролю', isCorrect: false },
    ],
  },
  {
    quizId: 1003,
    order: 2,
    text: 'Зачем нужны backup-коды?',
    type: QuestionType.MULTIPLE,
    explanation: 'Backup-коды помогают войти, если потерян телефон или временно недоступен основной второй фактор.',
    points: 1,
    answers: [
      { order: 1, text: 'Чтобы восстановить вход при потере устройства', isCorrect: true },
      { order: 2, text: 'Чтобы хранить их отдельно от телефона', isCorrect: true },
      { order: 3, text: 'Чтобы отправлять их друзьям на всякий случай', isCorrect: false },
    ],
  },
  {
    quizId: 1003,
    order: 3,
    text: 'Если на телефон приходят десятки неожиданных push-запросов на вход, их безопасно быстро подтверждать, чтобы они исчезли.',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Это может быть MFA fatigue-атака, когда злоумышленник ждёт случайного подтверждения.',
    points: 1,
    answers: [
      { order: 1, text: 'Верно', isCorrect: false },
      { order: 2, text: 'Неверно', isCorrect: true },
    ],
  },
  {
    quizId: 1003,
    order: 4,
    text: 'Что важно продумать заранее, если вы включаете MFA?',
    type: QuestionType.MULTIPLE,
    explanation: 'Хорошая защита включает не только вход, но и безопасное восстановление доступа.',
    points: 1,
    answers: [
      { order: 1, text: 'Где хранятся backup-коды', isCorrect: true },
      { order: 2, text: 'Есть ли запасное устройство или метод входа', isCorrect: true },
      { order: 3, text: 'Как отключить все уведомления о входе', isCorrect: false },
    ],
  },
  {
    quizId: 1003,
    order: 5,
    text: 'Какое действие является типичной ошибкой при использовании MFA?',
    type: QuestionType.SINGLE,
    explanation: 'Подтверждать запрос, который вы не инициировали, нельзя. Сначала нужно остановиться и проверить ситуацию.',
    points: 1,
    answers: [
      { order: 1, text: 'Хранить backup-коды в безопасном месте', isCorrect: false },
      { order: 2, text: 'Подтверждать неожиданный push-запрос', isCorrect: true },
      { order: 3, text: 'Использовать аутентификатор для почты', isCorrect: false },
    ],
  },
  {
    quizId: 1004,
    order: 1,
    text: 'Что означает сообщение о критичном обновлении безопасности для браузера?',
    type: QuestionType.SINGLE,
    explanation: 'Критичное обновление означает высокий риск, особенно для программ, которые постоянно работают с интернетом.',
    points: 1,
    answers: [
      { order: 1, text: 'Обновление лучше поставить как можно скорее', isCorrect: true },
      { order: 2, text: 'Можно отложить на несколько месяцев', isCorrect: false },
      { order: 3, text: 'Это важно только для разработчиков', isCorrect: false },
    ],
  },
  {
    quizId: 1004,
    order: 2,
    text: 'Какие утверждения про автообновления верны?',
    type: QuestionType.MULTIPLE,
    explanation: 'Автообновления особенно полезны для ОС, браузера и другого массового ПО с частыми патчами безопасности.',
    points: 1,
    answers: [
      { order: 1, text: 'Для ОС и браузера автообновления обычно полезны', isCorrect: true },
      { order: 2, text: 'Автообновления снижают риск забыть про важный патч', isCorrect: true },
      { order: 3, text: 'Автообновления всегда нужно отключать ради безопасности', isCorrect: false },
    ],
  },
  {
    quizId: 1004,
    order: 3,
    text: 'Пиратский софт и патчи с неизвестных сайтов безопасны, если у них красивый интерфейс.',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Неофициальные сборки и патчи сами по себе могут быть источником заражения.',
    points: 1,
    answers: [
      { order: 1, text: 'Верно', isCorrect: false },
      { order: 2, text: 'Неверно', isCorrect: true },
    ],
  },
  {
    quizId: 1004,
    order: 4,
    text: 'Чем опасна долгая задержка с установкой патчей?',
    type: QuestionType.SINGLE,
    explanation: 'После публикации патча об уязвимости часто узнают не только защитники, но и атакующие.',
    points: 1,
    answers: [
      { order: 1, text: 'Уязвимость остаётся открытой дольше', isCorrect: true },
      { order: 2, text: 'Компьютер начнёт работать быстрее', isCorrect: false },
      { order: 3, text: 'Сайт производителя перестанет существовать', isCorrect: false },
    ],
  },
  {
    quizId: 1004,
    order: 5,
    text: 'Откуда безопаснее получать обновления?',
    type: QuestionType.MULTIPLE,
    explanation: 'Официальные источники позволяют снизить риск поддельных установщиков и вредоносных файлов.',
    points: 1,
    answers: [
      { order: 1, text: 'Из встроенного механизма обновления программы', isCorrect: true },
      { order: 2, text: 'С сайта производителя или из официального магазина', isCorrect: true },
      { order: 3, text: 'Из случайного комментария с зеркалом', isCorrect: false },
    ],
  },
  {
    quizId: 1005,
    order: 1,
    text: 'Что означает “1” в правиле 3-2-1?',
    type: QuestionType.SINGLE,
    explanation: 'Хотя бы одна копия должна быть вне основного места хранения.',
    points: 1,
    answers: [
      { order: 1, text: 'Одна копия хранится вне основного места', isCorrect: true },
      { order: 2, text: 'Делается только одна копия', isCorrect: false },
      { order: 3, text: 'Нужен один пароль для всех архивов', isCorrect: false },
    ],
  },
  {
    quizId: 1005,
    order: 2,
    text: 'Какие варианты помогают выполнить правило 3-2-1?',
    type: QuestionType.MULTIPLE,
    explanation: 'Нужны разные носители и хотя бы одна копия вне основного устройства.',
    points: 1,
    answers: [
      { order: 1, text: 'Ноутбук + внешний диск + облако', isCorrect: true },
      { order: 2, text: 'Телефон + флешка + диск у родственников', isCorrect: true },
      { order: 3, text: 'Три папки на одном и том же ноутбуке', isCorrect: false },
    ],
  },
  {
    quizId: 1005,
    order: 3,
    text: 'Если копия лежит только на подключённом внешнем диске рядом с компьютером, этого всегда достаточно против ransomware.',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Подключённый диск тоже может пострадать, поэтому нужна отдельная и лучше офсайт-копия.',
    points: 1,
    answers: [
      { order: 1, text: 'Верно', isCorrect: false },
      { order: 2, text: 'Неверно', isCorrect: true },
    ],
  },
  {
    quizId: 1005,
    order: 4,
    text: 'Почему важно проверять восстановление из backup?',
    type: QuestionType.SINGLE,
    explanation: 'Резервная копия бесполезна, если файл повреждён или вы не понимаете, как его восстановить.',
    points: 1,
    answers: [
      { order: 1, text: 'Чтобы убедиться, что копия реально работает', isCorrect: true },
      { order: 2, text: 'Чтобы удалить оригиналы сразу после копирования', isCorrect: false },
      { order: 3, text: 'Чтобы ускорить интернет', isCorrect: false },
    ],
  },
  {
    quizId: 1005,
    order: 5,
    text: 'Какие утверждения про резервные копии верны?',
    type: QuestionType.MULTIPLE,
    explanation: 'Хорошая стратегия строится на разных носителях, офсайт-копии и регулярной проверке.',
    points: 1,
    answers: [
      { order: 1, text: 'Облако может быть частью стратегии backup', isCorrect: true },
      { order: 2, text: 'Внешний диск полезен, если это не единственная копия', isCorrect: true },
      { order: 3, text: 'Все копии лучше хранить в одном рюкзаке', isCorrect: false },
    ],
  },
  {
    quizId: 1006,
    order: 1,
    text: 'Откуда лучше всего скачивать приложение или обновление?',
    type: QuestionType.SINGLE,
    explanation: 'Самый безопасный базовый выбор — официальный источник.',
    points: 1,
    answers: [
      { order: 1, text: 'С официального сайта или из официального магазина', isCorrect: true },
      { order: 2, text: 'С первого попавшегося зеркала', isCorrect: false },
      { order: 3, text: 'Из рекламного блока “быстрая загрузка”', isCorrect: false },
    ],
  },
  {
    quizId: 1006,
    order: 2,
    text: 'Что стоит сделать, если сайт публикует checksum или цифровую подпись?',
    type: QuestionType.MULTIPLE,
    explanation: 'Проверка checksum или подписи помогает убедиться, что файл не подменили.',
    points: 1,
    answers: [
      { order: 1, text: 'Сверить checksum после скачивания', isCorrect: true },
      { order: 2, text: 'Проверить подпись, если она есть', isCorrect: true },
      { order: 3, text: 'Игнорировать всё и сразу запускать файл', isCorrect: false },
    ],
  },
  {
    quizId: 1006,
    order: 3,
    text: 'Расширение браузера с доступом ко всем сайтам всегда безопасно, если у него красивый рейтинг.',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Нет. Сначала нужно понять, действительно ли приложению нужны такие права.',
    points: 1,
    answers: [
      { order: 1, text: 'Верно', isCorrect: false },
      { order: 2, text: 'Неверно', isCorrect: true },
    ],
  },
  {
    quizId: 1006,
    order: 4,
    text: 'Какой файл или формат стоит проверять особенно внимательно перед запуском?',
    type: QuestionType.SINGLE,
    explanation: 'Исполняемые файлы и установщики нужно проверять особенно внимательно.',
    points: 1,
    answers: [
      { order: 1, text: '.exe или .msi', isCorrect: true },
      { order: 2, text: '.txt', isCorrect: false },
      { order: 3, text: '.jpg', isCorrect: false },
    ],
  },
  {
    quizId: 1006,
    order: 5,
    text: 'Какие признаки говорят, что “download mirror” лучше не использовать без проверки?',
    type: QuestionType.MULTIPLE,
    explanation: 'Реклама, непонятный издатель и навязанные загрузчики — заметные красные флаги.',
    points: 1,
    answers: [
      { order: 1, text: 'Много фейковых кнопок скачивания', isCorrect: true },
      { order: 2, text: 'Навязывается собственный загрузчик', isCorrect: true },
      { order: 3, text: 'Домен совпадает с официальным сайтом разработчика', isCorrect: false },
    ],
  },
  {
    quizId: 1007,
    order: 1,
    text: 'Какое приложение меньше всего нуждается в доступе к контактам?',
    type: QuestionType.SINGLE,
    explanation: 'Фонарик обычно не работает с адресной книгой и не должен читать контакты.',
    points: 1,
    answers: [
      { order: 1, text: 'Фонарик', isCorrect: true },
      { order: 2, text: 'Мессенджер для звонков', isCorrect: false },
      { order: 3, text: 'Почтовый клиент', isCorrect: false },
    ],
  },
  {
    quizId: 1007,
    order: 2,
    text: 'Какие разрешения часто стоит выдавать только “во время использования”, если это возможно?',
    type: QuestionType.MULTIPLE,
    explanation: 'Камера, микрофон и геолокация относятся к чувствительным данным и не должны работать лишний раз в фоне.',
    points: 1,
    answers: [
      { order: 1, text: 'Камера', isCorrect: true },
      { order: 2, text: 'Микрофон', isCorrect: true },
      { order: 3, text: 'Геолокация', isCorrect: true },
    ],
  },
  {
    quizId: 1007,
    order: 3,
    text: 'Если приложение давно не использовалось, его разрешения не нужно пересматривать.',
    type: QuestionType.TRUE_FALSE,
    explanation: 'Неверно. Разрешения полезно пересматривать, особенно после обновлений и длительного простоя.',
    points: 1,
    answers: [
      { order: 1, text: 'Верно', isCorrect: false },
      { order: 2, text: 'Неверно', isCorrect: true },
    ],
  },
  {
    quizId: 1007,
    order: 4,
    text: 'Какой набор разрешений выглядит наиболее разумно для приложения погоды?',
    type: QuestionType.SINGLE,
    explanation: 'Погоде часто нужна только геолокация, и то по возможности ограниченная.',
    points: 1,
    answers: [
      { order: 1, text: 'Геолокация', isCorrect: true },
      { order: 2, text: 'Контакты и микрофон', isCorrect: false },
      { order: 3, text: 'Камера и контакты', isCorrect: false },
    ],
  },
  {
    quizId: 1007,
    order: 5,
    text: 'Какие утверждения соответствуют принципу least privilege?',
    type: QuestionType.MULTIPLE,
    explanation: 'Нужно выдавать минимум прав, достаточный для конкретной функции приложения.',
    points: 1,
    answers: [
      { order: 1, text: 'Фоторедактору может понадобиться доступ к фото', isCorrect: true },
      { order: 2, text: 'Навигатору может понадобиться геолокация', isCorrect: true },
      { order: 3, text: 'Любому приложению лучше сразу выдать все разрешения', isCorrect: false },
    ],
  },
];

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

  const topicIdBySlug = new Map<string, number>();

  for (const topic of TOPICS) {
    const record = await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        title: topic.title,
        description: topic.description,
        order: topic.order,
        isPublished: true,
      },
      create: {
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        order: topic.order,
        isPublished: true,
      },
    });

    topicIdBySlug.set(topic.slug, record.id);
  }

  for (const material of MATERIALS) {
    await upsertMaterial({
      topicId: getTopicId(topicIdBySlug, material.topicSlug),
      type: material.type,
      order: material.order,
      content: material.content,
    });
  }

  for (const game of GAMES) {
    await upsertGame({
      topicId: getTopicId(topicIdBySlug, game.topicSlug),
      title: game.title,
      type: game.type,
      order: game.order,
      isPublished: game.isPublished,
      config: game.config,
    });
  }

  for (const quiz of QUIZZES) {
    await prisma.quiz.upsert({
      where: { id: quiz.id },
      update: {
        topicId: getTopicId(topicIdBySlug, quiz.topicSlug),
        name: quiz.name,
        description: quiz.description,
        order: quiz.order,
        passingScore: quiz.passingScore,
        isActive: quiz.isActive,
        isPublished: quiz.isPublished,
      },
      create: {
        id: quiz.id,
        topicId: getTopicId(topicIdBySlug, quiz.topicSlug),
        name: quiz.name,
        description: quiz.description,
        order: quiz.order,
        passingScore: quiz.passingScore,
        isActive: quiz.isActive,
        isPublished: quiz.isPublished,
      },
    });
  }

  for (const question of QUESTIONS) {
    await upsertQuestion(question.quizId, {
      order: question.order,
      text: question.text,
      type: question.type,
      explanation: question.explanation,
      points: question.points,
      answers: question.answers,
    });
  }

  await prisma.achievement.upsert({
    where: { code: 'FIRST_QUIZ' },
    update: {
    name: 'Первый тест',
    title: 'Первый тест',
    description: 'Пройти 1 тест',
    icon: '🎯',
    conditionType: 'quiz_count',
    criteria: { type: 'quiz_count', value: 1 },
    isActive: true,
    },
    create: {
 code: 'FIRST_QUIZ',
    name: 'Первый тест',
    title: 'Первый тест',
    description: 'Пройти 1 тест',
    icon: '🎯',
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
    icon: '🏆',
    conditionType: 'total_points',
    criteria: { type: 'total_points', value: 100 },
    isActive: true,
    },
    create: {
    code: 'POINTS_100',
    name: '100 баллов',
    title: '100 баллов',
    description: 'Набрать всего 100 баллов',
    icon: '🏆',
    conditionType: 'total_points',
    criteria: { type: 'total_points', value: 100 },
    isActive: true,
    },
  });

  console.log('Сидирование успешно завершено');
}

function getTopicId(topicIdBySlug: Map<string, number>, slug: string): number {
  const topicId = topicIdBySlug.get(slug);
  if (!topicId) {
    throw new Error(`Topic with slug "${slug}" was not seeded`);
  }
  return topicId;
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
  const existingGames = await prisma.game.findMany({
    where: {
      topicId: input.topicId,
      order: input.order,
    },
    orderBy: { id: 'asc' },
    select: { id: true },
  });

  const existing = existingGames[0];
  let gameId: number;

  if (existing) {
    const updated = await prisma.game.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        type: input.type,
        order: input.order,
        isPublished: input.isPublished,
        config: input.config as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
    gameId = updated.id;
  } else {
    const created = await prisma.game.create({
      data: {
        topicId: input.topicId,
        title: input.title,
        type: input.type,
        order: input.order,
        isPublished: input.isPublished,
        config: input.config as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
    gameId = created.id;
  }

  const duplicateIds = existingGames
    .slice(1)
    .map((game) => game.id)
    .filter((id) => id !== gameId);

  if (duplicateIds.length === 0) {
    return;
  }

  await prisma.gameAttempt.deleteMany({
    where: {
      gameId: {
        in: duplicateIds,
      },
    },
  });

  await prisma.game.deleteMany({
    where: {
      id: {
        in: duplicateIds,
      },
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
