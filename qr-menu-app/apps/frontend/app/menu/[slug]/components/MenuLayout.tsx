import React from 'react';

type MenuLayoutProps = {
  business: {
    name: string;
    logo?: string | null;
  };
  children: React.ReactNode;
};

export default function MenuLayout({ business, children }: MenuLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-6">
          {business.logo ? (
            <img
              src={business.logo}
              alt={`${business.name} logo`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold">
              {business.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold">{business.name}</h1>
            <p className="text-sm text-slate-500">Digital menu</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
