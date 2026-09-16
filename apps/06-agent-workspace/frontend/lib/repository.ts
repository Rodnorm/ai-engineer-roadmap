import { CosmosClient, type Container } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID } from "node:crypto";
import { getConfig } from "./config";
import type { Conversation } from "./types";

export interface ConversationRepository {
  list(): Promise<Conversation[]>;
  get(id: string): Promise<Conversation | undefined>;
  create(): Promise<Conversation>;
  save(conversation: Conversation): Promise<void>;
  delete(id: string): Promise<void>;
}

function newConversation(): Conversation {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    title: "New conversation",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

class MemoryConversationRepository implements ConversationRepository {
  private readonly conversations = new Map<string, Conversation>();

  async list(): Promise<Conversation[]> {
    return [...this.conversations.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => structuredClone(item));
  }

  async get(id: string): Promise<Conversation | undefined> {
    const item = this.conversations.get(id);
    return item ? structuredClone(item) : undefined;
  }

  async create(): Promise<Conversation> {
    const conversation = newConversation();
    this.conversations.set(conversation.id, conversation);
    return structuredClone(conversation);
  }

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, structuredClone(conversation));
  }

  async delete(id: string): Promise<void> {
    this.conversations.delete(id);
  }
}

class CosmosConversationRepository implements ConversationRepository {
  private containerPromise?: Promise<Container>;

  private async container(): Promise<Container> {
    if (!this.containerPromise) {
      this.containerPromise = this.initialize();
    }
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
      partitionKey: { paths: ["/id"] },
    });
    return container;
  }

  async list(): Promise<Conversation[]> {
    const container = await this.container();
    const { resources } = await container.items
      .query<Conversation>("SELECT * FROM c ORDER BY c.updatedAt DESC")
      .fetchAll();
    return resources;
  }

  async get(id: string): Promise<Conversation | undefined> {
    try {
      const container = await this.container();
      const { resource } = await container.item(id, id).read<Conversation>();
      return resource;
    } catch (error) {
      if ((error as { code?: number }).code === 404) return undefined;
      throw error;
    }
  }

  async create(): Promise<Conversation> {
    const conversation = newConversation();
    await this.save(conversation);
    return conversation;
  }

  async save(conversation: Conversation): Promise<void> {
    const container = await this.container();
    await container.items.upsert(conversation);
  }

  async delete(id: string): Promise<void> {
    const container = await this.container();
    await container.item(id, id).delete();
  }
}

const globalRepository = globalThis as typeof globalThis & {
  app06Repository?: ConversationRepository;
};

export function getConversationRepository(): ConversationRepository {
  if (!globalRepository.app06Repository) {
    globalRepository.app06Repository = getConfig().COSMOS_ENDPOINT
      ? new CosmosConversationRepository()
      : new MemoryConversationRepository();
  }
  return globalRepository.app06Repository;
}
