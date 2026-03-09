import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../lib/api/use-api-query';
import { useApiMutation } from '../lib/api/use-api-mutation';
import type { Announcement, AnnouncementDetail, AnnouncementListResponse, AnnouncementFilters, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../types/announcement';

export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (filters?: AnnouncementFilters) => [...announcementKeys.lists(), filters] as const,
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: number) => [...announcementKeys.details(), id] as const,
  unreadCount: () => [...announcementKeys.all, 'unread-count'] as const,
};

export const useAnnouncements = (filters?: AnnouncementFilters) => {
  return useApiQuery<AnnouncementListResponse>({
    queryKey: announcementKeys.list(filters),
    url: '/announcements',
    params: filters as Record<string, unknown>,
  });
};

export const useAnnouncement = (id: number) => {
  return useApiQuery<AnnouncementDetail>({
    queryKey: announcementKeys.detail(id),
    url: `/announcements/${id}`,
    enabled: id > 0,
  });
};

export const useUnreadCount = () => {
  return useApiQuery<{ count: number }>({
    queryKey: announcementKeys.unreadCount(),
    url: '/announcements/unread-count',
  });
};

export const useAnnouncementCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Announcement, CreateAnnouncementRequest>({
    url: '/announcements',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
};

export const useAnnouncementUpdate = (id: number) => {
  const queryClient = useQueryClient();
  return useApiMutation<Announcement, UpdateAnnouncementRequest>({
    url: `/announcements/${id}`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(id) });
    },
  });
};

export const useAnnouncementDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/announcements/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
};
