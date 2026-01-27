'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      setStatus('loading');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus('error');
        setMessage(data?.message ?? 'Verification failed.');
        return;
      }

      setStatus('success');
      setMessage('Email verified successfully. You can now sign in.');
    };

    void verify();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Verify your email</h1>
        <div className="mt-4 text-sm text-slate-700">
          {status === 'loading' ? 'Verifying...' : message}
        </div>
        <div className="mt-6 text-sm text-slate-600">
          <Link className="font-medium text-slate-900" href="/admin">
            Go to login
          </Link>
        </div>
      </div>
    </main>
  );
}
