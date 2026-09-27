import { InvocationTelemetry, TrafficPolicy } from "@/types/deployment";
import { DeploymentMetrics, SLOMeta } from "@/types/metrics";
import { DEFAULT_SLO, SLAMonitor } from "@/lib/metrics/sla-monitor";
import { CircuitBreaker } from "@/lib/resilience/circuit-breaker";
import { RollbackIncidentEvent } from "@/lib/resilience/rollback-trigger";
import { DEFAULT_TRAFFIC_POLICY } from "@/lib/router/traffic-router";

export interface SessionDeploymentState {
  ownerId: string;
  policy: TrafficPolicy;
  telemetry: InvocationTelemetry[];
  incidents: RollbackIncidentEvent[];
  circuitBreaker: CircuitBreaker;
  slo: SLOMeta;
  createdAt: string;
  lastActive: string;
}

class InMemoryDeploymentRepository {
  private sessions: Map<string, SessionDeploymentState> = new Map();

  public getOrCreate(ownerId: string): SessionDeploymentState {
    let state = this.sessions.get(ownerId);
    if (!state) {
      state = {
        ownerId,
        policy: { ...DEFAULT_TRAFFIC_POLICY },
        telemetry: [],
        incidents: [],
        circuitBreaker: new CircuitBreaker({
          failureThresholdPercentage: 30,
          consecutiveFailureThreshold: 3,
          cooldownPeriodMs: 8000,
        }),
        slo: { ...DEFAULT_SLO },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      this.sessions.set(ownerId, state);
    }
    state.lastActive = new Date().toISOString();
    return state;
  }

  public updatePolicy(ownerId: string, newPolicy: Partial<TrafficPolicy>): TrafficPolicy {
    const state = this.getOrCreate(ownerId);
    state.policy = {
      ...state.policy,
      ...newPolicy,
      lastUpdated: new Date().toISOString(),
    };
    return state.policy;
  }

  public addTelemetry(ownerId: string, record: InvocationTelemetry): void {
    const state = this.getOrCreate(ownerId);
    state.telemetry.unshift(record);
    // Keep max 50 records in sliding memory
    if (state.telemetry.length > 50) {
      state.telemetry.pop();
    }

    // Update circuit breaker
    if (record.success && record.statusCode < 400) {
      state.circuitBreaker.recordSuccess();
    } else {
      state.circuitBreaker.recordFailure();
    }
  }

  public addIncident(ownerId: string, incident: RollbackIncidentEvent): void {
    const state = this.getOrCreate(ownerId);
    state.incidents.unshift(incident);
    if (state.incidents.length > 20) {
      state.incidents.pop();
    }
  }

  public getMetrics(ownerId: string): DeploymentMetrics {
    const state = this.getOrCreate(ownerId);
    return SLAMonitor.evaluateMetrics(
      state.telemetry,
      state.circuitBreaker.getState(),
      state.slo
    );
  }

  public reset(ownerId: string): void {
    const state = this.getOrCreate(ownerId);
    state.telemetry = [];
    state.incidents = [];
    state.circuitBreaker.reset();
    state.policy = {
      ...DEFAULT_TRAFFIC_POLICY,
      isRollbackActive: false,
      rollbackReason: undefined,
      rollbackTimestamp: undefined,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Global singleton for Next.js
const globalRepoKey = Symbol.for("app08.deployment.repository");
type GlobalWithRepo = typeof globalThis & {
  [globalRepoKey]?: InMemoryDeploymentRepository;
};

const globalObject = globalThis as GlobalWithRepo;
if (!globalObject[globalRepoKey]) {
  globalObject[globalRepoKey] = new InMemoryDeploymentRepository();
}

export const deploymentRepository = globalObject[globalRepoKey]!;
