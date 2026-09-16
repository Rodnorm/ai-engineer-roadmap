"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-text">
      <div className="max-w-md rounded-3xl border border-border bg-panel p-8 text-center shadow-2xl">
        <p className="eyebrow">Agent Workspace</p>
        <h1 className="mt-3 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted">The workspace could not be loaded. Your stored conversations were not changed.</p>
        <button className="primary-button mt-6" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
