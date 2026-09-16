import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-text">
      <div className="text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Workspace not found</h1>
        <Link className="primary-button mt-6 inline-flex" href="/">Return to Agent Workspace</Link>
      </div>
    </main>
  );
}
