import Link from 'next/link';

const links = [
  { href: '/admin', label: 'Admin Login' },
  { href: '/auth/register', label: 'Create Account' },
  { href: '/auth/reset-password', label: 'Reset Password' },
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/qr-code', label: 'QR Code' },
  { href: '/menu/demo', label: 'Public Menu (demo slug)' },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold">QR Menu App</h1>
        <p className="mt-4 text-lg text-gray-600">
          Digital menu solution for businesses
        </p>
      </div>
      <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        The demo menu link uses the slug <span className="font-semibold">demo</span>.
      </p>
    </main>
  );
}
