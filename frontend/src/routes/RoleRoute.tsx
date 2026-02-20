import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Role } from '../api/types';
import { useAuth } from '../features/auth/useAuth';

interface RoleRouteProps {
  role: Role;
  children: ReactNode;
}

export function RoleRoute({ role, children }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


