import { BriefTone, PipelineExecutionResult } from "@/types/agent";
import { randomUUID } from "node:crypto";

export interface StoredBrief {
  id: string;
  ownerId: string;
  createdAt: string;
  topic: string;
  scope: string;
  tone: BriefTone;
  result: PipelineExecutionResult;
}

class InMemoryBriefRepository {
  private briefs: Map<string, StoredBrief[]> = new Map();

  public async save(
    ownerId: string,
    topic: string,
    scope: string,
    tone: BriefTone,
    result: PipelineExecutionResult
  ): Promise<StoredBrief> {
    const brief: StoredBrief = {
      id: randomUUID(),
      ownerId,
      createdAt: new Date().toISOString(),
      topic,
      scope,
      tone,
      result,
    };

    const userBriefs = this.briefs.get(ownerId) || [];
    // Keep max 20 briefs per session to prevent memory leak
    userBriefs.unshift(brief);
    if (userBriefs.length > 20) {
      userBriefs.pop();
    }
    this.briefs.set(ownerId, userBriefs);
    return brief;
  }

  public async listByOwner(ownerId: string): Promise<StoredBrief[]> {
    return this.briefs.get(ownerId) || [];
  }

  public async getById(ownerId: string, briefId: string): Promise<StoredBrief | null> {
    const list = this.briefs.get(ownerId) || [];
    return list.find((b) => b.id === briefId) || null;
  }

  public async deleteByOwner(ownerId: string, briefId?: string): Promise<boolean> {
    if (briefId) {
      const list = this.briefs.get(ownerId) || [];
      const filtered = list.filter((b) => b.id !== briefId);
      this.briefs.set(ownerId, filtered);
      return true;
    }
    this.briefs.delete(ownerId);
    return true;
  }
}

// Global singleton repository
const globalRepoKey = Symbol.for("app07.brief.repository");
type GlobalWithRepo = typeof globalThis & {
  [globalRepoKey]?: InMemoryBriefRepository;
};

const globalObject = globalThis as GlobalWithRepo;
if (!globalObject[globalRepoKey]) {
  globalObject[globalRepoKey] = new InMemoryBriefRepository();
}

export const briefRepository = globalObject[globalRepoKey]!;
