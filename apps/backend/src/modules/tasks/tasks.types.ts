export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByOrganization(orgId: string): Promise<Task[]>;
  isOwner(
    userId: string,
    taskId: string
  ): Promise<"OWNER" | "NOT_OWNER" | "NOT_FOUND">;

  create(data: CreateTaskInput): Promise<Task>;
  update(id: string, data: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;
  assignTask(taskId: string, assigneeId: string): Promise<void>;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  
  description?: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateTaskInput {
  title: string;
  projectId: string;
  description?: string;
  organizationId: string;
  createdBy: string;
}
export interface UpdateTaskInput {
  title?: string;
  description?: string;
}
