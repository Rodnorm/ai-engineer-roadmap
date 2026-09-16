export type TaskStatus = "open" | "done";

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

export interface WorkspaceNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface WorkspaceData {
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
}
