"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type SlugUpdateFormProps = {
  apiBaseUrl: string;
  initialSlug: string;
  onUpdated: (slug: string) => void;
};

export default function SlugUpdateForm({ apiBaseUrl, initialSlug, onUpdated }: SlugUpdateFormProps) {
  const { data: session } = useSession();
  const [slug, setSlug] = useState(initialSlug);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const accessToken = session?.accessToken;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setStatus(null);

    const response = await fetch(`${apiBaseUrl}/business`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ slug }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus(data?.message ?? "Failed to update slug.");
      setLoading(false);
      return;
    }

    setStatus("Slug updated. QR code regenerated.");
    setLoading(false);
    onUpdated(slug);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="slug">
          Business slug
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update slug"}
      </button>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
