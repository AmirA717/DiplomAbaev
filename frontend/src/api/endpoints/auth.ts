import { request } from '../client';
import { AuthResponse, LoginPayload, User, RegisterPayload } from '../types';

export const authApi = {
  register(payload: RegisterPayload) {
    return request<AuthResponse, RegisterPayload>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  login(payload: LoginPayload) {
    return request<AuthResponse, LoginPayload>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  me() {
    return request<User>('/auth/me');
  },
};


