import { CosmosClient, type Container } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID } from "node:crypto";
import { getConfig } from "./config";
import type { Conversation } from "./types";

export interface ConversationRepository {
  list(ownerId: string): Promise<Conversation[]>;
  get(ownerId: string, id: string): Promise<Conversation | undefined>;
  create(ownerId: string): Promise<Conversation>;
  save(ownerId: string, conversation: Conversation): Promise<void>;
  delete(ownerId: string, id: string): Promise<void>;
}

function newConversation(ownerId: string): Conversation {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    ownerId,
    title: "New conversation",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

class MemoryConversationRepository implements ConversationRepository {
  private readonly conversations = new Map<string, Conversation>();

  async list(ownerId: string): Promise<Conversation[]> {
    return [...this.conversations.values()]
      .filter((item) => item.ownerId === ownerId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => structuredClone(item));
  }

  async get(ownerId: string, id: string): Promise<Conversation | undefined> {
    const item = this.conversations.get(id);
    return item?.ownerId === ownerId ? structuredClone(item) : undefined;
  }

  async create(ownerId: string): Promise<Conversation> {
    const conversation = newConversation(ownerId);
    this.conversations.set(conversation.id, conversation);
    return structuredClone(conversation);
  }

  async save(ownerId: string, conversation: Conversation): Promise<void> {
    if (conversation.ownerId !== ownerId) throw new Error("Conversation owner mismatch");
    const existing = this.conversations.get(conversation.id);
    if (existing && existing.ownerId !== ownerId) throw new Error("Conversation owner mismatch");
    this.conversations.set(conversation.id, structuredClone(conversation));
  }

  async delete(ownerId: string, id: string): Promise<void> {
    const existing = this.conversations.get(id);
    if (existing?.ownerId === ownerId) this.conversations.delete(id);
  }
}

class CosmosConversationRepository implements ConversationRepository {
  private containerPromise?: Promise<Container>;

  private async container(): Promise<Container> {
    if (!this.containerPromise) this.containerPromise = this.initialize();
    return this.containerPromise;
  }

  private async initialize(): Promise<Container> {
    const config = getConfig();
    if (!config.COSMOS_ENDPOINT) throw new Error("COSMOS_ENDPOINT is required");

    const client = config.COSMOS_KEY
      ? new CosmosClient({ endpoint: config.COSMOS_ENDPOINT, key: config.COSMOS_KEY })
      : new CosmosClient({ endpoint: config.COSMOS_ENDPOINT, aadCredentials: new DefaultAzureCredential() });
    const { database } = await client.databases.createIfNotExists({ id: config.COSMOS_DATABASE_NAME });
    const { container } = await database.containers.createIfNotExists({
      id: config.COSMOS_CONTAINER_NAME,
      partitionKey: { paths: ["/ownerId"] },
    });
    return container;
  }

  async list(ownerId: string): Promise<Conversation[]> {
    const container = await this.container();
    const { resources } = await container.items
      .query<Conversation>({
        query: "SELECT * FROM c WHERE c.ownerId = @ownerId ORDER BY c.updatedAt DESC",
        parameters: [{ name: "@ownerId", value: ownerId }],
      }, { partitionKey: ownerId })
      .fetchAll();
    return resources;
  }

  async get(ownerId: string, id: string): Promise<Conversation | undefined> {
    try {
      const container = await this.container();
      const { resource } = await container.item(id, ownerId).read<Conversation>();
      return resource?.ownerId === ownerId ? resource : undefined;
    } catch (error) {
      if ((error as { code?: number }).code === 404) return undefined;
      throw error;
    }
  }

  async create(ownerId: string): Promise<Conversation> {
    const conversation = newConversation(ownerId);
    await this.save(ownerId, conversation);
    return conversation;
  }

  async save(ownerId: string, conversation: Conversation): Promise<void> {
    if (conversation.ownerId !== ownerId) throw new Error("Conversation owner mismatch");
    const container = await this.container();
    await container.items.upsert(conversation);
  }

  async delete(ownerId: string, id: string): Promise<void> {
    const container = await this.container();
    try {
      await container.item(id, ownerId).delete();
    } catch (error) {
      if ((error as { code?: number }).code !== 404) throw error;
    }
  }
}

const globalRepository = globalThis as typeof globalThis & {
  app06Repository?: ConversationRepository;
};

export function createMemoryConversationRepository(): ConversationRepository {
  return new MemoryConversationRepository();
}

export function getConversationRepository(): ConversationRepository {
  if (!globalRepository.app06Repository) {
    globalRepository.app06Repository = getConfig().COSMOS_ENDPOINT
      ? new CosmosConversationRepository()
      : createMemoryConversationRepository();
  }
  return globalRepository.app06Repository;
}
