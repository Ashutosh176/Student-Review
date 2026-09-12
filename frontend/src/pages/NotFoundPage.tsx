import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-3 text-4xl">🔍</div>
      <h1 className="mb-2 text-xl">Page not found</h1>
      <p className="mb-5 max-w-sm text-sm text-sub">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
