interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="pill-filter mb-6">
      <button
        className={`pill${!selectedCategory ? " active" : ""}`}
        onClick={() => onSelect("")}
      >
        すべて
      </button>
      {categories.map((c) => (
        <button
          key={c}
          className={`pill${selectedCategory === c ? " active" : ""}`}
          onClick={() => onSelect(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
