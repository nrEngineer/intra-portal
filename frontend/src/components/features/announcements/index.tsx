import { useAuth } from "../../../hooks/useAuth";
import { useAnnouncements } from "../../../hooks/useAnnouncements";
import { PageHeader, EmptyState } from "../../ui";
import { AnnouncementList } from "./components/AnnouncementList";
import { AnnouncementForm } from "./components/AnnouncementForm";
import { useAnnouncementList, useAnnouncementForm } from "./hooks";

export function AnnouncementsContainer() {
  const { isAdmin } = useAuth();

  const {
    search,
    setSearch,
    category,
    page,
    handleSearch,
    handleCategoryChange,
    handlePageChange,
    filters,
  } = useAnnouncementList();

  const {
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
  } = useAnnouncementForm();

  const { data, isLoading } = useAnnouncements(filters);
  const announcements = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / 10);

  return (
    <div>
      <PageHeader
        title="お知らせ"
        action={isAdmin ? { label: "新規お知らせ", onClick: openCreate } : undefined}
      />

      {isAdmin && showForm && (
        <AnnouncementForm
          form={form}
          editingId={editingId}
          error={error}
          onFormChange={setForm}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <div className="toolbar animate-in stagger-2">
        <input
          type="text"
          className="input flex-1"
          placeholder="検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <select
          className="select"
          style={{ width: "auto" }}
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">全カテゴリ</option>
          <option value="general">一般</option>
          <option value="hr">人事</option>
          <option value="it">IT</option>
          <option value="event">イベント</option>
        </select>
        <button className="btn btn-primary" onClick={handleSearch}>
          検索
        </button>
      </div>

      <EmptyState
        isLoading={isLoading}
        isEmpty={announcements.length === 0}
        loadingText="読み込み中..."
        emptyText="お知らせはありません"
        className="animate-in stagger-3"
      >
        <AnnouncementList
          announcements={announcements}
          isAdmin={isAdmin}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      </EmptyState>

      {totalPages > 1 && (
        <div className="pagination animate-in stagger-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn${p === page ? " active" : ""}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
