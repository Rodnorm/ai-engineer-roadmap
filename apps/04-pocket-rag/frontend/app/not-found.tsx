import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-4">Página não encontrada</p>
      <Link
        href="/"
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
