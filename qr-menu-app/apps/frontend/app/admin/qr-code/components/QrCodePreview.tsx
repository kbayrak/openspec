"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type QrCodePreviewProps = {
  apiBaseUrl: string;
  slug: string;
};

export default function QrCodePreview({ apiBaseUrl, slug }: QrCodePreviewProps) {
  const { data: session } = useSession();
  const [svg, setSvg] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!session?.accessToken) return;
    const fetchPreview = async () => {
      setStatus("loading");
      const response = await fetch(`${apiBaseUrl}/qr-code/preview`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      const data = await response.json();
      setSvg(data?.svg ?? null);
      setStatus("idle");
    };

    void fetchPreview();
  }, [apiBaseUrl, session?.accessToken, slug]);

  if (status === "error") {
    return <p className="text-sm text-red-600">Failed to load QR code preview.</p>;
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="inline-flex h-48 w-48 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        {status === "loading" ? (
          <span className="text-sm text-slate-500">Loading...</span>
        ) : svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <span className="text-sm text-slate-500">No preview yet.</span>
        )}
      </div>
      <div className="text-sm text-slate-600">
        Menu URL:{" "}
        <span className="font-medium text-slate-900">{`/menu/${slug}`}</span>
      </div>
    </div>
  );
}
