import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { AuthCard } from '@/layouts/AuthLayout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const mutation = useMutation({ mutationFn: () => authApi.forgotPassword(email) });

  if (mutation.isSuccess) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</div>
          <h2 className="mb-2 text-lg">Check your email</h2>
          <p className="text-[13px] text-sub">If that email is registered, we've sent a password reset link.</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h2 className="mb-1.5 text-lg">Forgot your password?</h2>
      <p className="mb-5 text-[12.5px] text-sub">We'll email you a link to reset it.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full justify-center">
          {mutation.isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <div className="mt-4 text-center text-[12.5px] text-sub">
        <Link to="/login" className="text-brand">
          Back to log in
        </Link>
      </div>
    </AuthCard>
  );
}
