"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type QrCodeActionsProps = {
  apiBaseUrl: string;
  slug: string;
};

export default function QrCodeActions({ apiBaseUrl, slug }: QrCodeActionsProps) {
  const { data: session } = useSession();
  const [customization, setCustomization] = useState({
    fgColor: "#000000",
    bgColor: "#ffffff",
    logoEnabled: false,
  });
  const [status, setStatus] = useState<string | null>(null);

  const accessToken = session?.accessToken;

  const downloadFile = async (path: string, filename: string) => {
    if (!accessToken) return;
    const response = await fetch(`${apiBaseUrl}/qr-code/${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      setStatus("Download failed.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCustomize = async () => {
    if (!accessToken) return;
    setStatus(null);
    const response = await fetch(`${apiBaseUrl}/qr-code/customize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(customization),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus(data?.message ?? "Customization failed.");
      return;
    }

    const data = await response.json().catch(() => null);
    setStatus(data?.scannability?.message ?? "QR code updated.");
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => downloadFile("svg", "qr-code.svg")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Download SVG
        </button>
        <button
          type="button"
          onClick={() => downloadFile("png", "qr-code.png")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={() => downloadFile("pdf", "qr-code.pdf")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => window.open(`${window.location.origin}/menu/${slug}`, "_blank")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Test QR Code
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-700">Customize</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-600" htmlFor="fgColor">
              Foreground
            </label>
            <input
              id="fgColor"
              type="color"
              value={customization.fgColor}
              onChange={(event) =>
                setCustomization((prev) => ({ ...prev, fgColor: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600" htmlFor="bgColor">
              Background
            </label>
            <input
              id="bgColor"
              type="color"
              value={customization.bgColor}
              onChange={(event) =>
                setCustomization((prev) => ({ ...prev, bgColor: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <input
              id="logoEnabled"
              type="checkbox"
              checked={customization.logoEnabled}
              onChange={(event) =>
                setCustomization((prev) => ({ ...prev, logoEnabled: event.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="logoEnabled">Embed logo</label>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCustomize}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Update QR Code
        </button>
        {status ? <p className="mt-2 text-sm text-slate-600">{status}</p> : null}
      </div>
    </section>
  );
}
