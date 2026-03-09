import { useAuth } from "../../../hooks/useAuth";
import { PageHeader, EmptyState } from "../../ui";
import { useLinkFilter, useLinkForm } from "./hooks";
import { LinkCard } from "./components/LinkCard";
import { LinkForm } from "./components/LinkForm";
import { CategoryFilter } from "./components/CategoryFilter";

export function LinksContainer() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "editor";

  const { categories, selectedCategory, setSelectedCategory, groupedLinks, links, isLoading } =
    useLinkFilter();

  const {
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
  } = useLinkForm();

  return (
    <div>
      <PageHeader
        title="リンク集"
        action={
          canEdit
            ? {
                label: showForm && !editingId ? "キャンセル" : "新規リンク",
                onClick: toggleForm,
              }
            : undefined
        }
      />

      {canEdit && showForm && (
        <LinkForm
          form={form}
          editingId={editingId}
          error={error}
          categories={categories}
          onChangeForm={setForm}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <EmptyState
        isLoading={isLoading}
        isEmpty={links.length === 0}
        loadingText="読み込み中..."
        emptyText="リンクはありません"
      >
        {Object.entries(groupedLinks).map(([cat, items], groupIdx) => (
          <div key={cat} className="mb-6">
            <h2 className="section-title">{cat}</h2>
            <div className="grid-auto">
              {items.map((link, idx) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  animationDelay={(groupIdx * items.length + idx) * 60}
                  canEdit={canEdit}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </EmptyState>
    </div>
  );
}
