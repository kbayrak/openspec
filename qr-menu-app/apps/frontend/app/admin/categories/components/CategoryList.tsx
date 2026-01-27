"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CategoryForm, { CategoryFormValues } from "./CategoryForm";
import { useCategories } from "@/hooks/useCategories";

type Category = {
  id: string;
  name: string;
  order: number;
  translations?: Record<string, { name?: string }>;
  _count?: {
    products: number;
  };
};

export default function CategoryList() {
  const {
    categories: remoteCategories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    updateTranslations,
  } = useCategories();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [editingTranslations, setEditingTranslations] = useState<Category | null>(null);
  const [translationRows, setTranslationRows] = useState<Array<{ lang: string; name: string }>>(
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (remoteCategories.length) {
      const sorted = [...remoteCategories].sort((a, b) => a.order - b.order);
      setCategories(sorted);
      return;
    }
    setCategories([]);
  }, [remoteCategories]);

  const handleCreate = async (values: CategoryFormValues) => {
    setSaving(true);
    setFormError(null);
    try {
      await createCategory.mutateAsync(values);
      setShowForm(false);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: CategoryFormValues) => {
    if (!editingCategory) {
      setSaving(false);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await updateCategory.mutateAsync({ id: editingCategory.id, payload: values });
      setEditingCategory(null);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    const hasProducts = (category?._count?.products ?? 0) > 0;
    const shouldDelete = window.confirm(
      hasProducts
        ? `This category has ${category?._count?.products} products. Deleting it will remove all associated products. Continue?`
        : "Delete this category?"
    );
    if (!shouldDelete) return;

    try {
      await deleteCategory.mutateAsync(categoryId);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to delete category.");
    }
  };

  const openTranslationEditor = (category: Category) => {
    const rows = Object.entries(category.translations ?? {}).map(([lang, value]) => ({
      lang,
      name: value?.name ?? "",
    }));
    setTranslationRows(rows.length ? rows : [{ lang: "", name: "" }]);
    setEditingTranslations(category);
    setFormError(null);
  };

  const saveTranslations = async () => {
    setSaving(true);
    setFormError(null);

    const translations = translationRows.reduce<Record<string, { name?: string }>>(
      (acc, row) => {
        const key = row.lang.trim().toLowerCase();
        if (!key) return acc;
        acc[key] = { name: row.name.trim() };
        return acc;
      },
      {}
    );
    try {
      if (!editingTranslations) return;
      await updateTranslations.mutateAsync({ id: editingTranslations.id, translations });
      setEditingTranslations(null);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to update translations.");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (event: { active: { id: string }; over?: { id: string } }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((item) => item.id === active.id);
    const newIndex = categories.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(categories, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setCategories(reordered);
    setReordering(true);
    try {
      await reorderCategories.mutateAsync({
        categories: reordered.map((item) => ({ id: item.id, order: item.order })),
      });
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to reorder categories.");
      const fallback = [...remoteCategories].sort((a, b) => a.order - b.order);
      setCategories(fallback);
    } finally {
      setReordering(false);
    }
  };

  const renderRows = useMemo(() => categories.map((item) => item.id), [categories]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-sm text-slate-500">Manage your menu categories.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormError(null);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add category
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="status" aria-live="polite">
          {error.message}
        </p>
      ) : null}

      {showForm ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <CategoryForm
            submitLabel="Create category"
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            error={formError}
            loading={saving}
          />
        </div>
      ) : null}

      {editingCategory ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <CategoryForm
            submitLabel="Save changes"
            initialValues={{ name: editingCategory.name, order: editingCategory.order }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCategory(null)}
            error={formError}
            loading={saving}
          />
        </div>
      ) : null}

      {editingTranslations ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Translations</h3>
            <p className="text-xs text-slate-500">Add language codes like en, tr, de.</p>
          </div>
          <div className="space-y-3">
            {translationRows.map((row, index) => (
              <div key={`${row.lang}-${index}`} className="grid gap-3 md:grid-cols-[120px_1fr]">
                <input
                  type="text"
                  placeholder="Language code"
                  value={row.lang}
                  onChange={(event) => {
                    const next = [...translationRows];
                    next[index] = { ...next[index], lang: event.target.value };
                    setTranslationRows(next);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Translated name"
                  value={row.name}
                  onChange={(event) => {
                    const next = [...translationRows];
                    next[index] = { ...next[index], name: event.target.value };
                    setTranslationRows(next);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTranslationRows([...translationRows, { lang: "", name: "" }])}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Add language
            </button>
            <button
              type="button"
              onClick={saveTranslations}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {saving ? "Saving..." : "Save translations"}
            </button>
            <button
              type="button"
              onClick={() => setEditingTranslations(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Close
            </button>
          </div>
          {formError ? (
            <p className="mt-3 text-sm text-red-600" role="status" aria-live="polite">
              {formError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-500">No categories yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={renderRows} strategy={verticalListSortingStrategy}>
              {categories.map((category) => (
                <SortableRow
                  key={category.id}
                  category={category}
                  onEdit={() => {
                    setEditingCategory(category);
                    setShowForm(false);
                    setFormError(null);
                  }}
                  onDelete={() => handleDelete(category.id)}
                  onTranslations={() => openTranslationEditor(category)}
                  disabled={reordering}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  );
}

function SortableRow({
  category,
  onEdit,
  onDelete,
  onTranslations,
  disabled,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onTranslations: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:border-slate-400"
          aria-label="Drag to reorder"
        >
          Drag
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">{category.name}</p>
          <p className="text-xs text-slate-500">
            Order: {category.order} · Products: {category._count?.products ?? 0}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={onTranslations} className="text-slate-600 hover:text-slate-900">
          Translations
        </button>
        <button type="button" onClick={onEdit} className="text-slate-600 hover:text-slate-900">
          Edit
        </button>
        <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-700">
          Delete
        </button>
      </div>
    </div>
  );
}
