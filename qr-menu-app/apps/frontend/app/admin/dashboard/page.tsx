import { auth } from "@/auth";
import DashboardLayout from "../components/DashboardLayout";

type Business = {
  id: string;
  name: string;
  slug: string;
  qrCodeSvg?: string | null;
};

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
};

async function fetchWithAuth<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.accessToken) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          You are not authenticated.
        </div>
      </DashboardLayout>
    );
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const [business, categories, products] = await Promise.all([
    fetchWithAuth<Business>(`${apiBase}/business`, session.accessToken),
    fetchWithAuth<Category[]>(`${apiBase}/categories`, session.accessToken),
    fetchWithAuth<Product[]>(`${apiBase}/products`, session.accessToken),
  ]);

  return (
    <DashboardLayout businessName={business.name} userEmail={session.user?.email}>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Categories</p>
          <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Products</p>
          <p className="mt-2 text-3xl font-semibold">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Business Slug</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{business.slug}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">QR Code Preview</h2>
        {business.qrCodeSvg ? (
          <div
            className="mt-4 inline-flex h-48 w-48 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50"
            dangerouslySetInnerHTML={{ __html: business.qrCodeSvg }}
          />
        ) : (
          <p className="mt-4 text-sm text-slate-500">No QR code generated yet.</p>
        )}
      </section>
    </DashboardLayout>
  );
}
