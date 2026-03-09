import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api/client";
import { useAnnouncementCreate, useAnnouncementDelete, announcementKeys } from "../../../hooks/useAnnouncements";

export const CATEGORIES = ["全社", "総務", "IT", "人事", "イベント"];

export interface AnnouncementFormState {
  title: string;
  body: string;
  category: string;
  status: string;
  pinned: boolean;
}

const DEFAULT_FORM: AnnouncementFormState = {
  title: "",
  body: "",
  category: "全社",
  status: "published",
  pinned: false,
};

// ─── useAnnouncementList ─────────────────────────────────────────────────────
// Search, filter, and pagination state tied to URL search params.

export function useAnnouncementList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const page = Number(searchParams.get("page") || "1");

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    setSearchParams(params);
  };

  const handleSearch = () => updateParams({ search, page: "1" });

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateParams({ category: value, page: "1" });
  };

  const handlePageChange = (p: number) => updateParams({ page: String(p) });

  return {
    search,
    setSearch,
    category,
    page,
    handleSearch,
    handleCategoryChange,
    handlePageChange,
    filters: {
      page,
      search: search || undefined,
      category: category || undefined,
    },
  };
}

// ─── useAnnouncementForm ─────────────────────────────────────────────────────
// Form state, editing state, and submit/cancel handlers.

export function useAnnouncementForm() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AnnouncementFormState>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const createMutation = useAnnouncementCreate();
  const deleteMutation = useAnnouncementDelete();

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const startEdit = async (
    a: { id: number; title: string; category: string; createdAt: string; isPinned: boolean },
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const detail = await apiClient.get<{
        title: string;
        content: string;
        category: string;
        status: string;
        isPinned: boolean;
      }>(`/announcements/${a.id}`);
      setForm({
        title: detail.title,
        body: detail.content,
        category: detail.category,
        status: detail.status || "published",
        pinned: detail.isPinned,
      });
      setEditingId(a.id);
      setError("");
      setShowForm(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "取得に失敗しました");
    }
  };

  const handleDelete = async (a: { id: number; title: string }, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`「${a.title}」を削除しますか？`)) return;
    try {
      await deleteMutation.mutateAsync(a.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const body = {
        title: form.title,
        content: form.body,
        category: form.category,
        status: form.status,
        isPinned: form.pinned,
      };
      if (editingId !== null) {
        await apiClient.put(`/announcements/${editingId}`, body);
        queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        queryClient.invalidateQueries({ queryKey: announcementKeys.detail(editingId) });
      } else {
        await createMutation.mutateAsync(body);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(DEFAULT_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
    setForm(DEFAULT_FORM);
  };

  return {
    showForm,
    form,
    setForm,
    editingId,
    error,
    openCreate,
    startEdit,
    handleDelete,
    handleSubmit,
    handleCancel,
  };
}
