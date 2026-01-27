'use client';

import Link from 'next/link';
import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';

export default function RegisterPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start building your digital menu in minutes.
        </p>
        <div className="mt-6">
          {submittedEmail ? (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>Thanks! We sent a verification email to:</p>
              <p className="font-semibold text-slate-900">{submittedEmail}</p>
              <p>Verify your email before signing in.</p>
            </div>
          ) : (
            <RegistrationForm onSuccess={setSubmittedEmail} />
          )}
        </div>
        <div className="mt-6 text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-medium text-slate-900" href="/admin">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
