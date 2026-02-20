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

export const PHISHING_SCENARIOS: PhishingScenario[] = [
  {
    id: 'bank-security-reset',
    channel: 'EMAIL',
    sender: 'Служба безопасности банка',
    senderAddress: 'security@sberbank-secure-login.com',
    subject: 'Срочно: подтвердите вход за 30 минут',
    preview: 'Мы обнаружили попытку входа в ваш аккаунт из нового устройства.',
    body:
      'Мы обнаружили подозрительный вход. Если это не вы, немедленно подтвердите учетную запись. Иначе доступ будет заблокирован.',
    url: 'https://sberbank-secure-login.com/verify',
    label: 'PHISHING',
    hint: 'Проверьте домен отправителя и давление на срочность.',
    suspiciousParts: ['security@sberbank-secure-login.com', 'за 30 минут', 'доступ будет заблокирован'],
    indicators: [
      { key: 'sender', text: 'Поддельный адрес отправителя, похожий на бренд.' },
      { key: 'urgency', text: 'Искусственная срочность: ограничение по времени.' },
      { key: 'credentials', text: 'Требование немедленно подтвердить учетные данные.' },
    ],
    explanation:
      'Это фишинг: домен не принадлежит официальному банку, сообщение давит на срочность и просит пройти верификацию через стороннюю ссылку.',
  },
  {
    id: 'school-platform-announcement',
    channel: 'EMAIL',
    sender: 'Портал школы',
    senderAddress: 'noreply@school.edu',
    subject: 'Расписание вебинара по кибербезопасности',
    preview: 'Новый вебинар состоится в пятницу в 16:00.',
    body:
      'Добрый день. Напоминаем, что в пятницу в 16:00 пройдет вебинар. Подключение доступно из личного кабинета школы.',
    url: 'https://school.edu/courses/security-webinar',
    label: 'SAFE',
    hint: 'Сравните домен и содержание с обычными уведомлениями школы.',
    suspiciousParts: [],
    indicators: [
      { key: 'domain', text: 'Домен соответствует официальному домену школы.' },
      { key: 'url', text: 'Ссылка ведет на основной сайт организации.' },
    ],
    explanation:
      'Сообщение выглядит безопасным: корректный домен, нет запроса паролей или кода подтверждения, нет давления на срочность.',
  },
  {
    id: 'delivery-bot-sms',
    channel: 'SMS',
    sender: 'DOSTAVKA',
    senderAddress: 'DOSTAVKA',
    preview: 'Посылка задержана. Подтвердите адрес, иначе возврат отправителю.',
    body:
      'Ваша посылка задержана на сортировке. Подтвердите адрес и оплатите повторную доставку 49 руб по ссылке ниже.',
    url: 'http://track-packet-fast.ru/confirm',
    label: 'PHISHING',
    hint: 'Оцените протокол ссылки и просьбу о срочной оплате.',
    suspiciousParts: ['оплатите повторную доставку 49 руб', 'http://track-packet-fast.ru/confirm'],
    indicators: [
      { key: 'url', text: 'Небезопасный протокол http и незнакомый домен.' },
      { key: 'payment', text: 'Просьба срочно оплатить мелкую сумму для доверия.' },
      { key: 'urgency', text: 'Угроза возврата отправителю.' },
    ],
    explanation:
      'Фишинг-схема доставки: неизвестный домен, небезопасная ссылка и требование оплаты под давлением времени.',
  },
  {
    id: 'teacher-chat-file',
    channel: 'CHAT',
    sender: 'Классный руководитель',
    senderAddress: 'teacher@school.edu',
    preview: 'Файл с домашним заданием на неделю.',
    body:
      'Проверьте обновленное задание в школьном облаке. Если файл не открывается, напишите мне в личные сообщения.',
    url: 'https://cloud.school.edu/homework/week-7',
    label: 'SAFE',
    hint: 'Посмотрите, есть ли запрос логина/пароля или подозрительное вложение.',
    suspiciousParts: [],
    indicators: [
      { key: 'domain', text: 'Используется инфраструктура школьного домена.' },
      { key: 'credentials', text: 'Нет запроса передать пароль или код.' },
    ],
    explanation:
      'Это безопасный сценарий: ссылка на официальный ресурс школы и отсутствие признаков социальной инженерии.',
  },
  {
    id: 'marketplace-prize',
    channel: 'EMAIL',
    sender: 'Маркетплейс бонусы',
    senderAddress: 'bonus@0zon-gifts.support',
    subject: 'Вы выиграли 50 000 бонусов!',
    preview: 'Подтвердите аккаунт для зачисления приза до конца дня.',
    body:
      'Поздравляем! Для получения подарка подтвердите карту и CVV. Без подтверждения приз аннулируется через 2 часа.',
    url: 'https://0zon-gifts.support/prize',
    label: 'PHISHING',
    hint: 'Проверьте подмену бренда символами и запрос платежных данных.',
    suspiciousParts: ['0zon-gifts.support', 'подтвердите карту и CVV', 'через 2 часа'],
    indicators: [
      { key: 'domain', text: 'Имитация бренда через подмену символов (0zon).' },
      { key: 'credentials', text: 'Запрос конфиденциальных платежных данных.' },
      { key: 'urgency', text: 'Сильное давление сроком действия приза.' },
    ],
    explanation:
      'Фишинг: поддельный бренд в домене и попытка получить данные банковской карты под видом приза.',
  },
  {
    id: 'university-library-reminder',
    channel: 'EMAIL',
    sender: 'Библиотека университета',
    senderAddress: 'library@university.edu',
    subject: 'Напоминание о возврате книги',
    preview: 'Срок возврата книги истекает через 3 дня.',
    body:
      'Пожалуйста, верните книгу до понедельника. Продлить срок можно в вашем личном кабинете библиотеки.',
    url: 'https://library.university.edu/account',
    label: 'SAFE',
    hint: 'Оцените реалистичность запроса и домен отправителя.',
    suspiciousParts: [],
    indicators: [
      { key: 'domain', text: 'Официальный домен университета.' },
      { key: 'urgency', text: 'Обычное уведомление без угроз блокировки аккаунта.' },
    ],
    explanation:
      'Сообщение безопасно: типовой административный текст, корректный домен, нет запроса на пароль или код.',
  },
  {
    id: 'it-support-vpn',
    channel: 'CHAT',
    sender: 'IT Support',
    senderAddress: 'it.support@company-helpdesk.net',
    preview: 'Нужно срочно обновить VPN доступ.',
    body:
      'Для продолжения работы удаленно отправьте текущий пароль и одноразовый код, иначе доступ к почте будет отключен.',
    label: 'PHISHING',
    hint: 'Любой запрос пароля и одноразового кода в чате — критический сигнал.',
    suspiciousParts: ['отправьте текущий пароль и одноразовый код', 'доступ ... будет отключен'],
    indicators: [
      { key: 'credentials', text: 'Запрос пароля и 2FA-кода.' },
      { key: 'urgency', text: 'Угроза отключения доступа.' },
      { key: 'sender', text: 'Нестандартный домен техподдержки.' },
    ],
    explanation:
      'Это фишинг: настоящая поддержка не просит пароль и 2FA-коды, а давление на срочность усиливает риск.',
  },
  {
    id: 'streaming-subscription-update',
    channel: 'EMAIL',
    sender: 'Stream Service',
    senderAddress: 'billing@stream-service.com',
    subject: 'Подтверждение продления подписки',
    preview: 'Списание запланировано на 5 марта.',
    body:
      'Автопродление активировано. Если вы хотите отменить подписку, используйте раздел платежей в личном кабинете.',
    url: 'https://stream-service.com/account/billing',
    label: 'SAFE',
    hint: 'Проверьте, есть ли просьба отправить данные карты в письме.',
    suspiciousParts: [],
    indicators: [
      { key: 'domain', text: 'Соответствие бренду сервиса.' },
      { key: 'payment', text: 'Нет запроса отправить реквизиты в ответ на письмо.' },
    ],
    explanation:
      'Похоже на безопасное сервисное уведомление: корректная ссылка и отсутствие требования передать секретные данные.',
  },
  {
    id: 'crypto-airdrop',
    channel: 'CHAT',
    sender: 'Crypto Promo Bot',
    senderAddress: '@airdrop_support_bot',
    preview: 'Вам начислен эксклюзивный airdrop 500 USDT.',
    body:
      'Подключите кошелек и введите seed-фразу для проверки владельца. Предложение активно 15 минут.',
    url: 'https://crypto-bonus-drop.site/claim',
    label: 'PHISHING',
    hint: 'Seed-фраза никогда не запрашивается в легитимных акциях.',
    suspiciousParts: ['введите seed-фразу', 'активно 15 минут', 'crypto-bonus-drop.site'],
    indicators: [
      { key: 'credentials', text: 'Запрос seed-фразы от кошелька.' },
      { key: 'urgency', text: 'Сильное ограничение по времени.' },
      { key: 'url', text: 'Сторонний домен без доверия.' },
    ],
    explanation:
      'Классический крипто-фишинг: выманивание seed-фразы через обещание быстрой выгоды и срочность.',
  },
  {
    id: 'gov-services-verification',
    channel: 'EMAIL',
    sender: 'Госуслуги уведомления',
    senderAddress: 'security@gosuslugi-verify.ru',
    subject: 'Подтвердите паспортные данные',
    preview: 'Иначе ваша учетная запись будет заморожена.',
    body:
      'Срочно подтвердите паспорт и СНИЛС, чтобы избежать блокировки. Для подтверждения перейдите по ссылке.',
    url: 'https://gosuslugi-verify.ru/confirm',
    label: 'PHISHING',
    hint: 'Проверьте официальный домен государственного сервиса.',
    suspiciousParts: ['gosuslugi-verify.ru', 'учетная запись будет заморожена', 'подтвердите паспорт и СНИЛС'],
    indicators: [
      { key: 'domain', text: 'Поддельный домен, не принадлежащий официальному сервису.' },
      { key: 'credentials', text: 'Запрос персональных документов по ссылке.' },
      { key: 'urgency', text: 'Запугивание блокировкой аккаунта.' },
    ],
    explanation:
      'Фишинговое сообщение: домен отличается от официального и запрашивает чувствительные персональные данные.',
  },
  {
    id: 'team-calendar-invite',
    channel: 'EMAIL',
    sender: 'Командный календарь',
    senderAddress: 'calendar@workspace.com',
    subject: 'Приглашение на встречу проекта',
    preview: 'Встреча назначена на завтра, 11:00.',
    body:
      'Вы приглашены на встречу проекта. Подключение доступно через корпоративный календарь.',
    url: 'https://workspace.com/calendar/events/7821',
    label: 'SAFE',
    hint: 'Оцените, есть ли необычные запросы и внешние формы.',
    suspiciousParts: [],
    indicators: [
      { key: 'domain', text: 'Официальный корпоративный домен.' },
      { key: 'credentials', text: 'Нет требования ввести пароль на стороннем сайте.' },
    ],
    explanation:
      'Безопасный кейс: стандартное приглашение через корпоративный сервис без признаков социальной инженерии.',
  },
  {
    id: 'cloud-storage-shared',
    channel: 'EMAIL',
    sender: 'Cloud Docs',
    senderAddress: 'share@cloud-docs-mail.com',
    subject: 'Вам отправлен важный документ',
    preview: 'Откройте вложение для ознакомления и подпишите сегодня.',
    body:
      'Во вложении счет и акт. Откройте файл .zip и войдите в систему для подтверждения получения.',
    url: 'https://cloud-docs-mail.com/open',
    label: 'PHISHING',
    hint: 'Подозрительные вложения и поддельные домены часто идут вместе.',
    suspiciousParts: ['файл .zip', 'share@cloud-docs-mail.com', 'подтверждения получения'],
    indicators: [
      { key: 'attachment', text: 'Опасный тип вложения (.zip) под видом документа.' },
      { key: 'domain', text: 'Сторонний домен, похожий на облачный сервис.' },
      { key: 'credentials', text: 'Требование авторизации после открытия вложения.' },
    ],
    explanation:
      'Это фишинг: сообщение комбинирует опасное вложение и вход через поддельный домен для кражи данных.',
  },
];
