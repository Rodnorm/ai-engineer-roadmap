import AppInfo from "@/components/AppInfo";
import BackendStatus from "@/components/BackendStatus";
import { appInfo } from "@/lib/app-info";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-6 py-16">
      <section className="w-full max-w-2xl">
        <header className="flex justify-end">
          <AppInfo config={appInfo} />
        </header>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Agentic AI Application
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
          Backend connection status
        </p>

        <div className="card mt-10">
          <h2 className="text-sm font-medium text-text">Backend status</h2>
          <BackendStatus />
        </div>
      </section>
    </main>
  );
}
