import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { TopicPage } from '../pages/topics/TopicPage';
import { QuizPlayPage } from '../pages/quizzes/QuizPlayPage';
import { GamePlayPage } from '../pages/games/GamePlayPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { StatsPage } from '../pages/profile/StatsPage';
import { AdminPage } from '../pages/admin/AdminPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PhishingGamePage } from '../pages/minigames/PhishingGamePage';
import { PasswordStrengthGamePage } from '../pages/minigames/PasswordStrengthGamePage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'topics/:topicId',
        element: <TopicPage />,
      },
      {
        path: 'games/:gameId/play',
        element: <GamePlayPage />,
      },
      {
        path: 'quiz/:quizId/play',
        element: <QuizPlayPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'mini-games/phishing',
        element: <PhishingGamePage />,
      },
      {
        path: 'mini-games/password',
        element: <PasswordStrengthGamePage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: 'admin',
        element: (
          <RoleRoute role="ADMIN">
            <AdminPage />
          </RoleRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);


