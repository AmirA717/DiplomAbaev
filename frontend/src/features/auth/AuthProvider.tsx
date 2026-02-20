import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../api/endpoints/auth';
import { LoginPayload, RegisterPayload, User } from '../../api/types';
import { configureApiClient } from '../../api/client';
import { clearStoredToken, getStoredToken, setStoredToken } from '../../utils/tokenStorage';
import { AuthContext, AuthContextValue, AuthStatus } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const queryClient = useQueryClient();

  const clearAuthState = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setStatus('guest');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => token,
      onUnauthorized: clearAuthState,
    });
  }, [token, clearAuthState]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setStatus('guest');
      return;
    }

    const me = await authApi.me();
    setUser(me);
    setStatus('authenticated');
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('guest');
        }
        return;
      }

      try {
        const me = await authApi.me();
        if (!isMounted) {
          return;
        }

        setUser(me);
        setStatus('authenticated');
      } catch {
        if (!isMounted) {
          return;
        }

        clearStoredToken();
        setToken(null);
        setUser(null);
        setStatus('guest');
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    setStoredToken(response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    setStoredToken(response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, status, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


