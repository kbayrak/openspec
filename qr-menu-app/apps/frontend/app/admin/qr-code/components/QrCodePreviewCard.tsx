"use client";

import { useState } from "react";
import QrCodePreview from "./QrCodePreview";
import SlugUpdateForm from "./SlugUpdateForm";

type QrCodePreviewCardProps = {
  apiBaseUrl: string;
  initialSlug: string;
};

export default function QrCodePreviewCard({ apiBaseUrl, initialSlug }: QrCodePreviewCardProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">QR Code</h2>
          <p className="text-sm text-slate-500">Preview and manage your QR code.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <QrCodePreview apiBaseUrl={apiBaseUrl} slug={slug} />
        <div className="space-y-4">
          <SlugUpdateForm
            apiBaseUrl={apiBaseUrl}
            initialSlug={slug}
            onUpdated={(nextSlug) => {
              setSlug(nextSlug);
              setNotice("Slug updated and QR code regenerated.");
            }}
          />
          {notice ? <p className="text-xs text-slate-500">{notice}</p> : null}
        </div>
      </div>
    </section>
  );
}
