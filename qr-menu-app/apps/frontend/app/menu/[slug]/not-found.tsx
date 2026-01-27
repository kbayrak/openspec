export default function MenuNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Menu not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The menu you are looking for does not exist or is no longer available.
        </p>
      </div>
    </main>
  );
}
