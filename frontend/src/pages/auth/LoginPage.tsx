import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { authApi } from '@/api/auth.api';
import { apiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Logo } from '@/components/Logo';
import { AuthCard } from '@/layouts/AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authApi.login({ email, password, rememberMe }),
    onSuccess: (res) => {
      setAccessToken(res.accessToken, res.user);
      const from = (location.state as { from?: { pathname?: string; search?: string } })?.from;
      const target = from?.pathname ? `${from.pathname}${from.search ?? ''}` : '/';
      navigate(target, { replace: true });
    },
  });

  return (
    <AuthCard>
      <Helmet>
        <title>Log in — StudentReview</title>
      </Helmet>
      <div className="mb-5 flex justify-center">
        <Logo className="h-14 w-auto" linkTo={null} />
      </div>
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
        <div className="field">
          <label>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="mb-4 flex items-center justify-between text-[12.5px]">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me
          </label>
          <Link to="/forgot-password" className="text-brand">
            Forgot password?
          </Link>
        </div>
        {mutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(mutation.error)}</p>}
        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full justify-center">
          {mutation.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <div className="mt-4 text-center text-[12.5px] text-sub">
        New here?{' '}
        <Link to="/register" className="font-semibold text-brand">
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
}
