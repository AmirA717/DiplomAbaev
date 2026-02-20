# Cyber Education Backend

Backend API на NestJS + PostgreSQL + Prisma для платформы мини-игр и викторин по кибербезопасности.

## Стек

- NestJS 11
- Prisma + PostgreSQL
- JWT auth + роли (`USER`, `ADMIN`)
- Swagger: `http://localhost:3000/docs`
- Docker Compose (app + db)

## Модули

- `auth`
- `users`
- `topics`
- `games`
- `quizzes`
- `questions`
- `attempts`
- `rewards`
- `stats`
- `admin`

## Переменные окружения

Создайте `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyber_education_db?schema=public
JWT_SECRET=change_me_super_secret_key
JWT_EXPIRES_IN=1d
```

## Запуск локально

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

## Запуск через Docker

```bash
docker compose up --build
```

Сервисы:
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- PostgreSQL: `localhost:5432`

Остановка:

```bash
docker compose down
```

С удалением данных БД:

```bash
docker compose down -v
```

## Основные эндпоинты

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (JWT)

### Users
- `GET /users/me/profile`
- `PATCH /users/me/profile`
- `GET /users/me/achievements`
- `GET /users/me/stats`

### Public content
- `GET /topics`
- `GET /topics/:id`
- `GET /topics/:id/materials`
- `GET /materials`
- `GET /games`
- `GET /games/:id`
- `GET /quizzes`
- `GET /quizzes/:id`

### User actions
- `POST /games/:id/attempts`
- `PATCH /games/attempts/:attemptId/finish`
- `GET /quizzes/:id/questions`
- `POST /quizzes/:id/attempts`
- `POST /quizzes/attempts/:attemptId/answer`
- `POST /quizzes/attempts/:attemptId/submit`
- `GET /attempts/quizzes/me`
- `GET /attempts/games/me`

### Rewards
- `GET /rewards`

### Admin (`ROLE=ADMIN`)
- CRUD:
  - `/admin/topics`
  - `/admin/materials`
  - `/admin/games`
  - `/admin/quizzes`
  - `/admin/questions`
  - `/admin/achievements`
- `GET /admin/stats/overview`

## Примеры curl

Регистрация:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student1@example.com\",\"password\":\"StrongPass123!\",\"fullName\":\"Student One\",\"username\":\"student1\"}"
```

Логин:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student1@example.com\",\"password\":\"StrongPass123!\"}"
```

Старт попытки викторины:

```bash
curl -X POST http://localhost:3000/quizzes/1001/attempts \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Ответ в попытке:

```bash
curl -X POST http://localhost:3000/quizzes/attempts/<ATTEMPT_ID>/answer \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"questionId\":1,\"answerIds\":[2]}"
```

Сабмит викторины:

```bash
curl -X POST http://localhost:3000/quizzes/attempts/<ATTEMPT_ID>/submit \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Старт/завершение мини-игры:

```bash
curl -X POST http://localhost:3000/games/1/attempts \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

```bash
curl -X PATCH http://localhost:3000/games/attempts/<ATTEMPT_ID>/finish \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"pointsEarned\":20,\"result\":{\"level\":1,\"success\":true}}"
```

## Seed данные

`prisma/seed.ts` создает:
- 1 admin user: `admin@cyber.local` / `Admin12345!`
- 2 темы: `phishing`, `passwords`
- материалы, мини-игры
- 2 викторины по 3 вопроса
- 2 достижения

## Ручные действия (подробно)

1. Установить Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Запустить Docker Desktop и дождаться статуса `Engine running`.
3. Проверить Docker:
   ```bash
   docker --version
   docker compose version
   ```
4. Настроить `.env` или `.env.docker` (`DATABASE_URL`, `JWT_SECRET`).
5. Прогнать миграции и сиды:
   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```
6. Запустить приложение (`npm run start:dev` или `docker compose up --build`).

## Где взять username/password Docker

Это учетные данные Docker Hub (не PostgreSQL):

1. Откройте Docker Desktop.
2. Нажмите `Sign in` (правый верхний угол).
3. Войдите логином/почтой и паролем Docker Hub.
4. Если пароля нет/забыт:
   - зайдите на `https://hub.docker.com`
   - `Sign in` -> `Forgot password`
5. Username виден в профиле на `https://hub.docker.com`.

Важно: Docker Hub credentials не равны `POSTGRES_USER`/`POSTGRES_PASSWORD` в `docker-compose.yml`.
