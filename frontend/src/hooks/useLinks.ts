import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../lib/api/use-api-query';
import { useApiMutation } from '../lib/api/use-api-mutation';
import type { InternalLink, LinkFilters, CreateLinkRequest, UpdateLinkRequest } from '../types/link';

export const linkKeys = {
  all: ['links'] as const,
  lists: () => [...linkKeys.all, 'list'] as const,
  list: (filters?: LinkFilters) => [...linkKeys.lists(), filters] as const,
  categories: () => [...linkKeys.all, 'categories'] as const,
};

export const useLinks = (filters?: LinkFilters) => {
  const result = useApiQuery<{ data: InternalLink[] }>({
    queryKey: linkKeys.list(filters),
    url: '/links',
    params: filters as Record<string, unknown>,
  });
  return { ...result, data: result.data?.data };
};

export const useLinkCategories = () => {
  const result = useApiQuery<{ data: string[] }>({
    queryKey: linkKeys.categories(),
    url: '/links/categories',
  });
  return { ...result, data: result.data?.data };
};

export const useLinkCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<InternalLink, CreateLinkRequest>({
    url: '/links',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
      queryClient.invalidateQueries({ queryKey: linkKeys.categories() });
    },
  });
};

export const useLinkUpdate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<InternalLink, { id: number } & UpdateLinkRequest>({
    url: (vars) => `/links/${vars.id}`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
      queryClient.invalidateQueries({ queryKey: linkKeys.categories() });
    },
  });
};

export const useLinkDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/links/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() });
    },
  });
};
