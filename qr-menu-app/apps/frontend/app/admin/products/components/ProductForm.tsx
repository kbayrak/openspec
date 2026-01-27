"use client";

import { useMemo, useState } from "react";

export type ProductFormValues = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageFile?: File | null;
  removeImage?: boolean;
  isActive: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];
  initialValues?: ProductFormValues;
  currentImageUrl?: string | null;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  loading?: boolean;
};

export default function ProductForm({
  categories,
  initialValues,
  currentImageUrl,
  submitLabel,
  onSubmit,
  onCancel,
  error,
  loading,
}: ProductFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [price, setPrice] = useState(
    initialValues?.price !== undefined ? initialValues.price.toString() : ""
  );
  const [categoryId, setCategoryId] = useState(
    initialValues?.categoryId ?? categories[0]?.id ?? ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [localError, setLocalError] = useState<string | null>(null);

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("Name is required.");
      return;
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setLocalError("Price must be a non-negative number.");
      return;
    }

    if (!categoryId) {
      setLocalError("Please select a category.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      price: parsedPrice,
      categoryId,
      imageFile,
      removeImage,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="productName">
          Product name
        </label>
        <input
          id="productName"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="productDescription">
          Description
        </label>
        <textarea
          id="productDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          rows={3}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="productPrice">
            Price
          </label>
          <input
            id="productPrice"
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="productCategory">
            Category
          </label>
          <select
            id="productCategory"
            required
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="" disabled>
              Select a category
            </option>
            {orderedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="productImage">
          Upload image (optional)
        </label>
        <input
          id="productImage"
          type="file"
          accept="image/*"
          onChange={(event) => {
            setImageFile(event.target.files?.[0] ?? null);
            if (event.target.files?.length) {
              setRemoveImage(false);
            }
          }}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          {currentImageUrl ? "Leave empty to keep the current image." : "You can upload a new image."}
        </p>
        {currentImageUrl ? (
          <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={removeImage}
              onChange={(event) => setRemoveImage(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Remove current image
          </label>
        ) : null}
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <input
          id="productActive"
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="productActive">Active</label>
      </div>
      {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
