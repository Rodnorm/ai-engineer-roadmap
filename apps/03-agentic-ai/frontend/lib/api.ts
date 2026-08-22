const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api/backend";

export type BackendHealth = {
  status: "ok";
  app: "app-03";
};

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Backend health check failed with status ${response.status}.`);
  }

  const data = (await response.json()) as Partial<BackendHealth>;

  if (data.status !== "ok" || data.app !== "app-03") {
    throw new Error("Backend health check returned an unexpected response.");
  }

  return data as BackendHealth;
}
