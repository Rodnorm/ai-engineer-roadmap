"use client";

import { useEffect, useState } from "react";

import { getBackendHealth, type BackendHealth } from "@/lib/api";

type Status =
  | { state: "loading" }
  | { state: "ready"; health: BackendHealth }
  | { state: "error" };

async function loadBackendStatus(): Promise<Status> {
  try {
    const health = await getBackendHealth();
    return { state: "ready", health };
  } catch {
    return { state: "error" };
  }
}

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  const retry = () => {
    setStatus({ state: "loading" });
    void loadBackendStatus().then(setStatus);
  };

  useEffect(() => {
    let ignore = false;

    void loadBackendStatus().then((nextStatus) => {
      if (!ignore) setStatus(nextStatus);
    });

    return () => {
      ignore = true;
    };
  }, []);

  if (status.state === "loading") {
    return <p className="mt-3 text-sm text-muted">Checking connection…</p>;
  }

  if (status.state === "error") {
    return (
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-sm text-error">Backend is unavailable.</p>
        <button
          type="button"
          className="cursor-pointer text-sm font-medium text-accent hover:underline"
          onClick={retry}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <p className="mt-3 flex items-center gap-2 text-sm text-success">
      <span className="size-2 rounded-full bg-success" aria-hidden="true" />
      Backend is reachable ({status.health.app}).
    </p>
  );
}
