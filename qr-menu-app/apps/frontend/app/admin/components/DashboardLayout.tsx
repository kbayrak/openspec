import Link from "next/link";
import LogoutButton from "./LogoutButton";

type DashboardLayoutProps = {
  businessName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
};

export default function DashboardLayout({ businessName, userEmail, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">{businessName ?? "Dashboard"}</h1>
            {userEmail ? <p className="text-sm text-slate-500">{userEmail}</p> : null}
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <nav className="space-y-2 text-sm">
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/admin/dashboard">
              Overview
            </Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/admin/categories">
              Categories
            </Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/admin/products">
              Products
            </Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/admin/qr-code">
              QR Code
            </Link>
          </nav>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
