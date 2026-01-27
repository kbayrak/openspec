import Link from 'next/link';
import LoginForm from './components/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to manage your menu and QR code.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <Link className="hover:text-slate-900" href="/auth/reset-password">
            Forgot password?
          </Link>
          <Link className="hover:text-slate-900" href="/auth/register">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
