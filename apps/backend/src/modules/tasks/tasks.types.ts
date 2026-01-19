export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByProject(projectId: string): Promise<Task[]>;
  create(data: CreateTaskInput): Promise<Task>;
  update(id: string, data: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;

  isCreator(taskId: string, userId: string): Promise<boolean>;
  isAssignee(taskId: string, userId: string): Promise<boolean>;
  assign(taskId: string, assigneeId: string): Promise<Task>;
  createActivity(data: {
    taskId: string;
    userId: string;
    action: string;
    projectId?: string;
    organizationId?: string;
    metadata?: any;
    entityId: string;
    entityType: string;
  }): Promise<void>;
}

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  description: string;
  assigneeId: string | null;
  createdById: string;
  dueDate: Date | null;
  position: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  projectId: string;
  createdById: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  position?: number;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  position?: number;
};

export type TaskStatus = "TODO" | "PAUSED" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
