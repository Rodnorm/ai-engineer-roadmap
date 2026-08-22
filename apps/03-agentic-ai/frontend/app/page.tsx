import BackendStatus from "@/components/BackendStatus";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-6 py-16">
      <section className="w-full max-w-2xl">
        <p className="label">AI Engineer Roadmap</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          App 03
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
          Agentic AI Application
        </p>

        <div className="card mt-10">
          <h2 className="text-sm font-medium text-text">Backend status</h2>
          <BackendStatus />
        </div>
      </section>
    </main>
  );
}
