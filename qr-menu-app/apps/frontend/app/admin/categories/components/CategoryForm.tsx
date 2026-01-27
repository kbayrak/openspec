"use client";

import { useState } from "react";

export type CategoryFormValues = {
  name: string;
  order?: number;
};

type CategoryFormProps = {
  initialValues?: CategoryFormValues;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  loading?: boolean;
};

export default function CategoryForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  error,
  loading,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [order, setOrder] = useState(initialValues?.order?.toString() ?? "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      order: order ? Number(order) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="categoryName">
          Category name
        </label>
        <input
          id="categoryName"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="categoryOrder">
          Display order (optional)
        </label>
        <input
          id="categoryOrder"
          type="number"
          min="0"
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>
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
