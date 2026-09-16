const state = globalThis as typeof globalThis & { app06ActiveGenerations?: number };

export function tryAcquireGeneration(): boolean {
  const maximum = Number.parseInt(process.env.MAX_CONCURRENT_REQUESTS ?? "2", 10);
  state.app06ActiveGenerations ??= 0;
  if (state.app06ActiveGenerations >= maximum) return false;
  state.app06ActiveGenerations += 1;
  return true;
}

export function releaseGeneration(): void {
  state.app06ActiveGenerations = Math.max(0, (state.app06ActiveGenerations ?? 1) - 1);
}
