import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../lib/api/use-api-query';
import { useApiMutation } from '../lib/api/use-api-mutation';
import type { Folder, Document, DocumentFilters, CreateFolderRequest, CreateDocumentRequest, UpdateDocumentRequest } from '../types/document';

export const documentKeys = {
  all: ['documents'] as const,
  folders: () => [...documentKeys.all, 'folders'] as const,
  folderList: (parentId?: number | null) => [...documentKeys.folders(), parentId] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters?: DocumentFilters) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
};

export const useFolders = (parentId?: number | null) => {
  const result = useApiQuery<{ data: Folder[] }>({
    queryKey: documentKeys.folderList(parentId),
    url: '/documents/folders',
    params: parentId != null ? { parentId } : undefined,
  });
  return { ...result, data: result.data?.data };
};

export const useDocuments = (filters?: DocumentFilters) => {
  const result = useApiQuery<{ data: Document[] }>({
    queryKey: documentKeys.list(filters),
    url: '/documents',
    params: filters as Record<string, unknown>,
  });
  return { ...result, data: result.data?.data };
};

export const useFolderCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Folder, CreateFolderRequest>({
    url: '/documents/folders',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.folders() });
    },
  });
};

export const useFolderUpdate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Folder, { id: number; name: string }>({
    url: (vars) => `/documents/folders/${vars.id}`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.folders() });
    },
  });
};

export const useFolderDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/documents/folders/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.folders() });
    },
  });
};

export const useDocumentCreate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Document, CreateDocumentRequest>({
    url: '/documents',
    method: 'POST',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
};

export const useDocumentUpdate = () => {
  const queryClient = useQueryClient();
  return useApiMutation<Document, { id: number } & UpdateDocumentRequest>({
    url: (vars) => `/documents/${vars.id}`,
    method: 'PUT',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.details() });
    },
  });
};

export const useDocumentDelete = () => {
  const queryClient = useQueryClient();
  return useApiMutation<void, number>({
    url: (id) => `/documents/${id}`,
    method: 'DELETE',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
};
