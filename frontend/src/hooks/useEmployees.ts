import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../lib/api/use-api-query';
import { useApiMutation } from '../lib/api/use-api-mutation';
import type { Employee, EmployeeFilters, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters?: EmployeeFilters) => [...employeeKeys.lists(), filters] as const,
};

export const useEmployees = (filters?: EmployeeFilters) => {
  const result = useApiQuery<{ data: Employee[] }>({
    queryKey: employeeKeys.list(filters),
    url: '/employees',
    params: filters as Record<string, unknown>,
  });
  return { ...result, data: result.data?.data };
};

export const useEmployeeCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Employee, CreateEmployeeRequest>({
    url: '/employees',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

export const useEmployeeUpdate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Employee, { id: number } & UpdateEmployeeRequest>({
    url: (vars) => `/employees/${vars.id}`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};

export const useEmployeeDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/employees/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
};
