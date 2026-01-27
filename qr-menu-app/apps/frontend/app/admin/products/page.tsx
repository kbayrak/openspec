import { auth } from "@/auth";
import DashboardLayout from "../components/DashboardLayout";
import ProductList from "./components/ProductList";

type Business = {
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

export default async function ProductsPage() {
  const session = await auth();
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  if (!session?.accessToken) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          You are not authenticated.
        </div>
      </DashboardLayout>
    );
  }

  const business = await fetchWithAuth<Business>(`${apiBase}/business`, session.accessToken);

  return (
    <DashboardLayout businessName={business.name} userEmail={session.user?.email}>
      <ProductList />
    </DashboardLayout>
  );
}
