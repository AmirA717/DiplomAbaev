import { request } from '../client';
import { Achievement, UpdateProfilePayload, UserProfile, UserStats } from '../types';

export const profileApi = {
  profile() {
    return request<UserProfile>('/users/me/profile');
  },

  updateProfile(payload: UpdateProfilePayload) {
    return request<UserProfile, UpdateProfilePayload>('/users/me/profile', {
      method: 'PATCH',
      body: payload,
    });
  },

  stats() {
    return request<UserStats>('/users/me/stats');
  },

  achievements() {
    return request<Achievement[]>('/users/me/achievements');
  },
};


