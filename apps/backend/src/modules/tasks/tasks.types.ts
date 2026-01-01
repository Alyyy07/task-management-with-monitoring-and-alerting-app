export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByProject(projectId: string): Promise<Task[]>;
  create(data: CreateTaskInput): Promise<Task>;
  update(id: string, data: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;

  isCreator(taskId: string, userId: string): Promise<boolean>;
  isAssignee(taskId: string, userId: string): Promise<boolean>;
  assign(taskId: string, assigneeId: string): Promise<Task>;
}

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string;
  description: string;
  assigneeId: string | null;
  createdById: string;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  projectId: string;
  createdById: string;
  status: TaskStatus;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
};

export type TaskStatus =
  | "TODO"
  | "PAUSED"
  | "IN_PROGRESS"
  | "DONE";
