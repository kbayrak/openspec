'use client';

type Category = {
  id: string;
  name: string;
};

type CategoryListProps = {
  categories: Category[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
};

export default function CategoryList({ categories, activeCategoryId, onSelect }: CategoryListProps) {
  return (
    <nav className="sticky top-0 z-10 mb-8 border-b border-slate-200 bg-white/90 py-3 backdrop-blur">
      <ul className="flex flex-wrap gap-3">
        <li>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeCategoryId === null
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            All
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onSelect(category.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeCategoryId === category.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
