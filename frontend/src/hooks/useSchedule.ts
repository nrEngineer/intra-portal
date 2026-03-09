import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../lib/api/use-api-query';
import { useApiMutation } from '../lib/api/use-api-mutation';
import type { Team, ScheduleEvent, EventFilters, CreateEventRequest, UpdateEventRequest, CreateTeamRequest, UpdateTeamRequest } from '../types/schedule';

export const scheduleKeys = {
  all: ['schedule'] as const,
  teams: () => [...scheduleKeys.all, 'teams'] as const,
  events: () => [...scheduleKeys.all, 'events'] as const,
  eventList: (filters?: EventFilters) => [...scheduleKeys.events(), filters] as const,
};

export const useTeams = () => {
  const result = useApiQuery<{ data: Team[] }>({
    queryKey: scheduleKeys.teams(),
    url: '/schedule/teams',
  });
  return { ...result, data: result.data?.data };
};

export const useEvents = (filters?: EventFilters) => {
  const result = useApiQuery<{ data: ScheduleEvent[] }>({
    queryKey: scheduleKeys.eventList(filters),
    url: '/schedule/events',
    params: filters as Record<string, unknown>,
    enabled: !!(filters?.startDate && filters?.endDate),
  });
  return { ...result, data: result.data?.data };
};

export const useEventCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<ScheduleEvent, CreateEventRequest>({
    url: '/schedule/events',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.events() });
    },
  });
};

export const useEventUpdate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<ScheduleEvent, { id: number } & UpdateEventRequest>({
    url: (vars) => `/schedule/events/${vars.id}`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.events() });
    },
  });
};

export const useEventDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/schedule/events/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.events() });
    },
  });
};

export const useTeamCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Team, CreateTeamRequest>({
    url: '/schedule/teams',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.teams() });
    },
  });
};

export const useTeamUpdate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Team, { id: number } & UpdateTeamRequest>({
    url: (vars) => `/schedule/teams/${vars.id}`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.teams() });
    },
  });
};

export const useTeamDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/schedule/teams/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.teams() });
    },
  });
};
