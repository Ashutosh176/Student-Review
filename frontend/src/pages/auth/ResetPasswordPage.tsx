import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { apiErrorMessage } from '@/api/client';
import { AuthCard } from '@/layouts/AuthLayout';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(token, password),
    onSuccess: () => navigate('/login'),
  });

  if (!token) {
    return (
      <AuthCard>
        <p className="text-center text-sm text-danger">This reset link is missing a token. Please request a new one.</p>
        <Link to="/forgot-password" className="mt-4 block text-center text-brand">
          Request new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h2 className="mb-4 text-lg">Choose a new password</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="field">
          <label>New password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full justify-center">
          {mutation.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthCard>
  );
}
