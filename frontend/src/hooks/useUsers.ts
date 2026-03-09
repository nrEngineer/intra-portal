import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../lib/api/use-api-query';
import { useApiMutation } from '../lib/api/use-api-mutation';
import type { User, CreateUserRequest, UserRole } from '../types/user';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
};

export const useUsers = () => {
  const result = useApiQuery<{ data: User[] }>({
    queryKey: userKeys.lists(),
    url: '/users',
  });
  return { ...result, data: result.data?.data };
};

export const useUserCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<User, CreateUserRequest>({
    url: '/users',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUserRoleChange = () => {
  const queryClient = useQueryClient();
  return useApiMutation<User, { id: number; role: UserRole }>({
    url: (vars) => `/users/${vars.id}/role`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUserDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/users/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
