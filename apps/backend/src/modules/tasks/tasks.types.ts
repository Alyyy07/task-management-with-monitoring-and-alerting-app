export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByOrganization(orgId: string): Promise<Task[]>;
  isOwner(userId: string, taskId: string): Promise<boolean>;
  create(data: CreateTaskInput): Promise<Task>;
  update(id: string, data: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  organizationId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateTaskInput {
  title: string;
  description?: string;
  organizationId: string;
  ownerId: string;
}
export interface UpdateTaskInput {
  title?: string;
  description?: string;
}
