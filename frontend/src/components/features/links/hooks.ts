import { useState } from "react";
import { useLinks, useLinkCategories, useLinkCreate, useLinkUpdate, useLinkDelete } from "../../../hooks/useLinks";
import type { InternalLink } from "../../../types/link";

type FormState = {
  title: string;
  url: string;
  description: string;
  category: string;
};

const EMPTY_FORM: FormState = { title: "", url: "", description: "", category: "" };

export function useLinkFilter() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: categories = [] } = useLinkCategories();
  const { data: links = [], isLoading } = useLinks({ category: selectedCategory || undefined });

  const groupedLinks = links.reduce<Record<string, InternalLink[]>>((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    groupedLinks,
    links,
    isLoading,
  };
}

export function useLinkForm() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const createMutation = useLinkCreate();
  const updateMutation = useLinkUpdate();
  const deleteMutation = useLinkDelete();

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (link: InternalLink) => {
    setForm({
      title: link.title,
      url: link.url,
      description: link.description ?? "",
      category: link.category,
    });
    setEditingId(link.id);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleForm = () => {
    if (showForm && !editingId) {
      resetForm();
    } else {
      resetForm();
      setShowForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
      } else {
        await createMutation.mutateAsync(form);
      }
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  const handleDelete = async (link: InternalLink) => {
    if (!confirm(`「${link.title}」を削除しますか？`)) return;
    try {
      await deleteMutation.mutateAsync(link.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return {
    showForm,
    form,
    setForm,
    editingId,
    error,
    resetForm,
    startEdit,
    toggleForm,
    handleSubmit,
    handleDelete,
  };
}
