# 📋 Гайд по развертыванию Cyber Education Platform

## Оглавление
1. [Предварительные требования](#предварительные-требования)
2. [Развертывание с Docker](#развертывание-с-docker)
3. [Развертывание без Docker](#развертывание-без-docker)
4. [Инициализация БД](#инициализация-бд)
5. [Запуск приложения](#запуск-приложения)
6. [Используемые порты](#используемые-порты)
7. [Отладка проблем](#отладка-проблем)

---

## Предварительные требования

### Обязательно:
- **Git** - для клонирования репозитория
- **Node.js** (v18+) - для запуска приложения
- **npm** (v8+) - пакетный менеджер

### Опционально (для Docker способа):
- **Docker** (v20+) - контейнеризация
- **Docker Compose** (v2+) - оркестрация контейнеров

### БД:
- **PostgreSQL** (v14+) - или через Docker

---

## Развертывание с Docker (Рекомендуется)

### Шаг 1: Клонируйте репозиторий
```bash
git clone <ваш-репозиторий>
cd Diplom_project
```

### Шаг 2: Создайте файл .env.docker
```bash
# В директории cyber-education-backend создайте .env.docker
cd cyber-education-backend
```

Содержимое **cyber-education-backend/.env.docker**:
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/cyber_education_db?schema=public

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=production
```

### Шаг 3: Запустите Docker Compose
```bash
cd ..
docker compose up -d
```

Это запустит:
- **PostgreSQL** на порте 5432
- **Backend (NestJS)** на порте 3000
- **Frontend (Vite)** доступный через backend

### Шаг 4: Проверьте статус
```bash
docker compose ps
```

Оба сервиса должны быть в статусе `Up`:
```
NAME                  STATUS
cyber-education-db   Up (healthy)
cyber-education-app  Up
```

### Шаг 5: Инициализируйте БД (seed)
```bash
docker compose exec -T app npm run prisma:seed
```

### Шаг 6: Откройте приложение
- **Frontend**: http://localhost:3000
- **API Swagger**: http://localhost:3000/api

---

## Развертывание без Docker

### Шаг 1: Клонируйте репозиторий
```bash
git clone <ваш-репозиторий>
cd Diplom_project
```

### Шаг 2: Установите PostgreSQL локально

**Windows:**
- Скачайте с [postgresql.org](https://www.postgresql.org/download/windows/)
- Установите с параметрами по умолчанию
- Запомните пароль для пользователя `postgres`

**macOS:**
```bash
brew install postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
```

### Шаг 3: Запустите PostgreSQL

**Windows (через Services):**
```powershell
# PostgreSQL должен запуститься автоматически
```

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### Шаг 4: Создайте БД и пользователя

```bash
psql -U postgres

# Внутри psql:
CREATE DATABASE cyber_education_db;
```

### Шаг 5: Настройте Backend

```bash
cd cyber-education-backend

# Создайте .env файл
# Содержимое:
```
```env
PORT=3000
DATABASE_URL=postgresql://postgres:ваш-пароль@127.0.0.1:5432/cyber_education_db?schema=public
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash

# Установите зависимости
npm install

# Примените миграции
npm run prisma:migrate

# Запустите seed (инициализация данных)
npm run prisma:seed

# Запустите backend
npm run start:dev
```

Backend запустится на **http://localhost:3000**

### Шаг 6: Настройте Frontend

В новом терминале:

```bash
cd frontend

# Установите зависимости
npm install

# Запустите dev server
npm run dev
```

Frontend обычно запускается на **http://localhost:5173**

---

## Инициализация БД

### Выполнение миграций (создание таблиц)

**С Docker:**
```bash
docker compose exec -T app npx prisma migrate deploy
```

**Локально:**
```bash
cd cyber-education-backend
npm run prisma:migrate
```

### Заполнение тестовыми данными (seed)

**С Docker:**
```bash
docker compose exec -T app npm run prisma:seed
```

**Локально:**
```bash
cd cyber-education-backend
npm run prisma:seed
```

**Что создается при seed:**
- Администратор: `admin@cyber-ed.com` / `Admin12345!`
- Тестовые пользователи
- Курсы и темы
- Вопросы для тестирования
- Минигейм данные

---

## Запуск приложения

### Вариант 1: Docker Compose (Все в одном)
```bash
docker compose up -d
docker compose exec -T app npm run prisma:seed
```

Готово! Приложение доступно на http://localhost:3000

### Вариант 2: Локальная разработка
```bash
# Терминал 1 - Backend
cd cyber-education-backend
npm install
npm run prisma:seed  # первый раз
npm run start:dev

# Терминал 2 - Frontend
cd frontend
npm install
npm run dev
```

### Вариант 3: Production Build
```bash
# Backend
cd cyber-education-backend
npm run build
npm start

# Frontend (отдельно или через backend)
cd frontend
npm run build
```

---

## Используемые порты

| Сервис | Порт | URL |
|--------|------|-----|
| PostgreSQL | 5432 | `postgresql://postgres:postgres@127.0.0.1:5432/cyber_education_db` |
| Backend (NestJS) | 3000 | http://localhost:3000 |
| Frontend (dev) | 5173 | http://localhost:5173 |
| API Swagger | 3000/api | http://localhost:3000/api |

**Если порты заняты:**

```bash
# Найти процесс на порту 3000 (Windows)
netstat -ano | findstr :3000

# Найти процесс на порту 3000 (macOS/Linux)
lsof -i :3000

# Убить процесс (Windows)
taskkill /PID <PID> /F

# Убить процесс (macOS/Linux)
kill -9 <PID>
```

---

## Отладка проблем

### Проблема: "Cannot connect to database"

**Решение:**
1. Проверьте, запущен ли PostgreSQL:
   ```bash
   docker compose ps  # Для Docker
   pg_isready -U postgres  # Для локального PostgreSQL
   ```

2. Проверьте `DATABASE_URL` в `.env` или `.env.docker`

3. Убедитесь, что БД существует:
   ```bash
   psql -U postgres -l | grep cyber_education_db
   ```

### Проблема: "Port already in use"

```bash
# Освободите порт
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Или используйте другой порт в .env
PORT=3001
```

### Проблема: "ts-node command not found"

**Решение:**
```bash
cd cyber-education-backend
npm install ts-node --save-dev
npm run prisma:seed
```

### Проблема: "Module not found"

**Решение:**
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Миграции не применены

**Решение:**
```bash
cd cyber-education-backend
npm run prisma:migrate
```

### Просмотр логов Docker

```bash
# Все логи
docker compose logs -f

# Только backend
docker compose logs -f app

# Только БД
docker compose logs -f db
```

---

## Структура проекта

```
Diplom_project/
├── cyber-education-backend/       # Backend (NestJS + Prisma)
│   ├── src/
│   │   ├── auth/                 # Аутентификация
│   │   ├── users/                # Управление пользователями
│   │   ├── games/                # Игры
│   │   ├── minigames/            # Минигейм фичи
│   │   ├── quizzes/              # Тесты
│   │   ├── topics/               # Учебные материалы
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma         # Схема БД
│   │   ├── seed.ts               # Инициализация данных
│   │   └── migrations/           # История миграций
│   ├── docker-compose.yml        # Конфиг Docker
│   └── package.json
├── frontend/                       # Frontend (Vue 3 + Vite)
│   ├── src/
│   │   ├── pages/                # Страницы
│   │   ├── components/           # Компоненты
│   │   ├── features/             # Фичи (игры, минигейм)
│   │   ├── api/                  # API клиент
│   │   └── ...
│   └── package.json
└── docs/                          # Документация
```

---

## Команды для разработки

### Backend
```bash
cd cyber-education-backend

# Установка
npm install

# Разработка с hot-reload
npm run start:dev

# Production build
npm run build

# Запуск production
npm start

# Тестирование
npm test

# Линтинг
npm run lint

# Prisma
npm run prisma:generate    # Генерация типов
npm run prisma:migrate     # Миграции
npm run prisma:seed        # Инициализация
```

### Frontend
```bash
cd frontend

# Установка
npm install

# Разработка
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Линтинг
npm run lint
```

---

## Первый запуск - Пошаговая инструкция

### С Docker:
```bash
# 1. Клонируй
git clone <repo>
cd Diplom_project

# 2. Запусти все
docker compose up -d

# 3. Инициализируй БД
docker compose exec -T app npm run prisma:seed

# 4. Открой http://localhost:3000
```

### Без Docker:
```bash
# 1. Клонируй
git clone <repo>
cd Diplom_project

# 2. Backend
cd cyber-education-backend
npm install
npm run prisma:seed
npm run start:dev

# 3. Frontend (новый терминал)
cd frontend
npm install
npm run dev

# 4. Открой http://localhost:5173
```

---

## Учетные данные для входа (после seed)

```
Email: admin@cyber-ed.com
Пароль: Admin12345!
```

---

## Дополнительные ссылки

- [NestJS Документация](https://docs.nestjs.com/)
- [Prisma Документация](https://www.prisma.io/docs/)
- [Docker Документация](https://docs.docker.com/)
- [Vue 3 Документация](https://vuejs.org/)

---

## Поддержка и вопросы

Если возникли проблемы:
1. Проверьте логи: `docker compose logs -f`
2. Убедитесь, что все порты свободны
3. Переустановите зависимости: `npm install`
4. Проверьте `.env` файл
5. Посмотрите [TESTING_COMPLETE.md](./docs/TESTING_COMPLETE.md) для информации о тестировании
