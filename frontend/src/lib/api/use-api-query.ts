import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './client';

interface ApiQueryOptions<T> extends Omit<UseQueryOptions<T, Error>, 'queryFn'> {
  url: string;
  params?: Record<string, unknown>;
}

export const useApiQuery = <T>(options: ApiQueryOptions<T>) => {
  const { url, params, ...queryOptions } = options;

  return useQuery<T, Error>({
    queryFn: () => apiClient.get<T>(url, params),
    ...queryOptions,
  });
};
