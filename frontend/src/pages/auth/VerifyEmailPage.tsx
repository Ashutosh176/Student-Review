import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { apiErrorMessage } from '@/api/client';
import { AuthCard } from '@/layouts/AuthLayout';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setError(apiErrorMessage(err));
        setState('error');
      });
  }, [token]);

  if (!token) {
    return (
      <AuthCard>
        <p className="text-center text-sm text-danger">This verification link is missing a token.</p>
        <Link to="/login" className="mt-4 block text-center text-brand">
          Back to login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      {state === 'pending' && <p className="text-center text-sm text-sub">Verifying your email…</p>}
      {state === 'success' && (
        <>
          <h2 className="mb-2 text-lg">Email verified</h2>
          <p className="text-sm text-sub">Your email address has been confirmed.</p>
          <Link to="/dashboard" className="btn btn-primary mt-4 w-full justify-center">
            Go to dashboard
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <h2 className="mb-2 text-lg">Verification failed</h2>
          <p className="text-sm text-danger">{error || 'This link is invalid or has expired.'}</p>
          <Link to="/login" className="mt-4 block text-center text-brand">
            Back to login
          </Link>
        </>
      )}
    </AuthCard>
  );
}
