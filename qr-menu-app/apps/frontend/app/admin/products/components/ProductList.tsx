"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import ProductForm, { ProductFormValues } from "./ProductForm";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useApiClient } from "@/lib/api";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: {
    id: string;
    name: string;
  };
  imageUrl?: string | null;
  image?: {
    id: string;
  } | null;
  isActive: boolean;
  translations?: Record<string, { name?: string; description?: string }>;
};

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="20" fill="#e2e8f0"/>
      <path d="M36 78h48l-10-16-12 10-8-12-18 18z" fill="#94a3b8"/>
      <circle cx="74" cy="48" r="8" fill="#94a3b8"/>
    </svg>`
  );

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

export default function ProductList() {
  const { baseUrl, accessToken } = useApiClient();
  const { categories } = useCategories();
  const {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDelete,
    bulkStatus,
    updateTranslations,
  } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [translationEditor, setTranslationEditor] = useState<Product | null>(null);
  const [translationRows, setTranslationRows] = useState<
    Array<{ lang: string; name: string; description: string }>
  >([]);

  const uploadImage = async (file: File) => {
    if (!accessToken) {
      throw new Error("Not authenticated");
    }
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${baseUrl}/images/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message ?? "Image upload failed.");
    }

    return response.json() as Promise<{ id: string; url: string }>;
  };

  const deleteImage = async (imageId: string) => {
    if (!accessToken) return;
    await fetch(`${baseUrl}/images/${imageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const handleCreate = async (values: ProductFormValues) => {
    setSaving(true);
    setFormError(null);
    try {
      let payload = { ...values } as any;
      if (values.imageFile) {
        const uploaded = await uploadImage(values.imageFile);
        payload = {
          ...payload,
          imageId: uploaded.id,
          imageUrl: `${baseUrl}${uploaded.url}`,
        };
      }
      delete payload.imageFile;
      delete payload.removeImage;

      await createProduct.mutateAsync(payload);
      setShowForm(false);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: ProductFormValues) => {
    if (!editingProduct) {
      setSaving(false);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      let payload = { ...values } as any;
      if (!values.removeImage && values.imageFile) {
        const uploaded = await uploadImage(values.imageFile);
        payload = {
          ...payload,
          imageId: uploaded.id,
          imageUrl: `${baseUrl}${uploaded.url}`,
        };
      }
      if (values.removeImage) {
        payload = {
          ...payload,
          imageId: null,
          imageUrl: null,
        };
      }
      delete payload.imageFile;
      delete payload.removeImage;

      await updateProduct.mutateAsync({ id: editingProduct.id, payload });
      if (values.removeImage && editingProduct.image?.id) {
        await deleteImage(editingProduct.image.id);
      }
      setEditingProduct(null);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    const shouldDelete = window.confirm("Delete this product?");
    if (!shouldDelete) return;
    try {
      await deleteProduct.mutateAsync(productId);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to delete product.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    const shouldDelete = window.confirm("Delete selected products?");
    if (!shouldDelete) return;
    try {
      await bulkDelete.mutateAsync(selectedProducts);
      setSelectedProducts([]);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to delete products.");
    }
  };

  const handleBulkStatus = async (isActive: boolean) => {
    if (selectedProducts.length === 0) return;
    try {
      await bulkStatus.mutateAsync({ productIds: selectedProducts, isActive });
      setSelectedProducts([]);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to update product status.");
    }
  };

  const openTranslationEditor = (product: Product) => {
    const rows = Object.entries(product.translations ?? {}).map(([lang, value]) => ({
      lang,
      name: value?.name ?? "",
      description: value?.description ?? "",
    }));
    setTranslationRows(rows.length ? rows : [{ lang: "", name: "", description: "" }]);
    setTranslationEditor(product);
    setFormError(null);
  };

  const saveTranslations = async () => {
    if (!translationEditor) return;
    setSaving(true);
    setFormError(null);

    const translations = translationRows.reduce<
      Record<string, { name?: string; description?: string }>
    >((acc, row) => {
      const key = row.lang.trim().toLowerCase();
      if (!key) return acc;
      acc[key] = { name: row.name.trim(), description: row.description.trim() || undefined };
      return acc;
    }, {});

    try {
      await updateTranslations.mutateAsync({ id: translationEditor.id, translations });
      setTranslationEditor(null);
    } catch (err) {
      setFormError((err as Error)?.message ?? "Failed to update translations.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((product) => product.category.id === selectedCategory);
  }, [products, selectedCategory]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const toggleProduct = (productId: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const categoryOptions = useMemo(
    () => categories.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-slate-500">Manage your products.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            setFormError(null);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add product
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="status" aria-live="polite">
          {error.message}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <label className="text-slate-600" htmlFor="productFilter">
          Filter by category
        </label>
        <select
          id="productFilter"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {showForm ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <ProductForm
            categories={categoryOptions}
            submitLabel="Create product"
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            error={formError}
            loading={saving}
          />
        </div>
      ) : null}

      {editingProduct ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <ProductForm
            categories={categoryOptions}
            submitLabel="Save changes"
            initialValues={{
              name: editingProduct.name,
              description: editingProduct.description ?? "",
              price: editingProduct.price,
              categoryId: editingProduct.category.id,
              isActive: editingProduct.isActive,
            }}
            currentImageUrl={editingProduct.imageUrl ?? undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(null)}
            error={formError}
            loading={saving}
          />
        </div>
      ) : null}

      {translationEditor ? (
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
                <textarea
                  placeholder="Translated description"
                  value={row.description}
                  onChange={(event) => {
                    const next = [...translationRows];
                    next[index] = { ...next[index], description: event.target.value };
                    setTranslationRows(next);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none md:col-span-2"
                  rows={2}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setTranslationRows([...translationRows, { lang: "", name: "", description: "" }])
              }
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
              onClick={() => setTranslationEditor(null)}
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

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
              onChange={(event) => toggleSelectAll(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Select all
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedProducts.length === 0}
              className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 transition hover:border-red-400 disabled:opacity-50"
            >
              Delete selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus(true)}
              disabled={selectedProducts.length === 0}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
            >
              Mark active
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus(false)}
              disabled={selectedProducts.length === 0}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
            >
              Mark inactive
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-sm text-slate-500">No products yet.</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={(event) => toggleProduct(product.id, event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={product.imageUrl || placeholderImage}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.category.name} · {formatPrice(product.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  onClick={() => openTranslationEditor(product)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Translations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(product);
                    setShowForm(false);
                    setFormError(null);
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
