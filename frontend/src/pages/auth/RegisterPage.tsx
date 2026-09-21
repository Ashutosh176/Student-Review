import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { authApi } from '@/api/auth.api';
import { apiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Logo } from '@/components/Logo';
import { AuthCard } from '@/layouts/AuthLayout';

const STRONG_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);

  const mutation = useMutation({
    mutationFn: () => authApi.register({ username, email, password, agreedToTerms: true }),
    onSuccess: (res) => {
      setAccessToken(res.accessToken, res.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const isStrong = STRONG_RE.test(password);

  return (
    <AuthCard>
      <Helmet>
        <title>Sign up — StudentReview</title>
      </Helmet>
      <div className="mb-5 flex justify-center">
        <Logo className="h-14 w-auto" linkTo={null} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (agreed) mutation.mutate();
        }}
      >
        <div className="field">
          <label>Username</label>
          <input required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]+" title="Letters, numbers and underscores only" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />
          <span className="text-[11.5px] text-sub">3–24 characters: letters, numbers and underscores only.</span>
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {password && (
            <span className={isStrong ? 'text-[11.5px] text-success' : 'text-[11.5px] text-warning'}>
              {isStrong ? 'Strong password ✓' : 'Needs upper, lower, number, 8+ characters'}
            </span>
          )}
        </div>
        <label className="mb-4 flex items-start gap-2 text-xs text-sub">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />I agree to the{' '}
          <Link to="/terms" className="text-brand">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/community-guidelines" className="text-brand">
            Community Guidelines
          </Link>
        </label>
        {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
        <button type="submit" disabled={mutation.isPending || !agreed} className="btn btn-primary w-full justify-center">
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <div className="mt-4 text-center text-[12.5px] text-sub">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand">
          Log in
        </Link>
      </div>
    </AuthCard>
  );
}
