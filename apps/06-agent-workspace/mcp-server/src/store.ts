import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { sampleWorkspace } from "./sample-data.js";
import type { TaskStatus, WorkspaceData, WorkspaceNote, WorkspaceTask } from "./types.js";

function cloneSample(): WorkspaceData {
  return structuredClone(sampleWorkspace);
}

export class WorkspaceStore {
  private data: WorkspaceData;

  constructor(
    private readonly filePath?: string,
    initialData: WorkspaceData = cloneSample(),
  ) {
    this.data = structuredClone(initialData);
  }

  async initialize(): Promise<void> {
    if (!this.filePath) return;

    try {
      this.data = JSON.parse(await readFile(this.filePath, "utf8")) as WorkspaceData;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await this.persist();
    }
  }

  listTasks(status?: TaskStatus): WorkspaceTask[] {
    return this.data.tasks.filter((task) => !status || task.status === status);
  }

  searchNotes(query: string): WorkspaceNote[] {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];

    return this.data.notes.filter((note) =>
      [note.title, note.content, ...note.tags]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized),
    );
  }

  async createTask(title: string, description = ""): Promise<WorkspaceTask> {
    const task: WorkspaceTask = {
      id: randomUUID(),
      title: title.trim(),
      description: description.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.data.tasks.unshift(task);
    await this.persist();
    return task;
  }

  async updateTask(
    id: string,
    updates: { title?: string; description?: string; status?: TaskStatus },
  ): Promise<WorkspaceTask | null> {
    const task = this.data.tasks.find((item) => item.id === id);
    if (!task) return null;
    if (updates.title !== undefined) task.title = updates.title.trim();
    if (updates.description !== undefined) task.description = updates.description.trim();
    if (updates.status !== undefined) task.status = updates.status;
    await this.persist();
    return task;
  }

  private async persist(): Promise<void> {
    if (!this.filePath) return;
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`, "utf8");
  }
}

export const workspaceStore = new WorkspaceStore(process.env.WORKSPACE_DATA_FILE);
