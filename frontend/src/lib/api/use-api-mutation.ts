import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from './client';

interface ApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  url: string | ((variables: TVariables) => string);
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export const useApiMutation = <TData, TVariables = void>(
  options: ApiMutationOptions<TData, TVariables>,
) => {
  const { url, method, ...mutationOptions } = options;

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const resolvedUrl = typeof url === 'function' ? url(variables) : url;

      switch (method) {
        case 'POST':
          return apiClient.post<TData>(resolvedUrl, variables);
        case 'PUT':
          return apiClient.put<TData>(resolvedUrl, variables);
        case 'PATCH':
          return apiClient.patch<TData>(resolvedUrl, variables);
        case 'DELETE':
          return apiClient.delete<TData>(resolvedUrl);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    ...mutationOptions,
  });
};
