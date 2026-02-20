import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../api/endpoints/profile';
import { UserProfile, UpdateProfilePayload } from '../../api/types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.profile(),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => profileApi.stats(),
  });
}

export function useUserAchievements() {
  return useQuery({
    queryKey: ['user-achievements'],
    queryFn: () => profileApi.achievements(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData<UserProfile>(['profile']);

      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(['profile'], {
          ...previousProfile,
          username: payload.username ?? previousProfile.username,
          fullName: payload.fullName ?? previousProfile.fullName,
          profilePicture: payload.avatarUrl ?? previousProfile.profilePicture,
        });
      }

      return { previousProfile };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile);
    },
  });
}


