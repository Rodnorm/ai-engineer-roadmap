import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-bg text-text">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted mb-4">Page not found / Página não encontrada</p>
      <Link
        href="/"
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong transition-colors"
      >
        Return to Home / Voltar ao início
      </Link>
    </main>
  );
}
