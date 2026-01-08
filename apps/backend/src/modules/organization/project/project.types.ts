export interface ProjectRepository {
  create(data: {
    name: string;
    organizationId: string;
    createdById: string;
  }): Promise<Project>;

  findById(id: string): Promise<Project | null>;
  findByOrganization(orgId: string): Promise<Project[]>;
  update(id: string, data: { name?: string }): Promise<Project>;
  delete(id: string): Promise<void>;

  isCreator(
    projectId: string,
    userId: string
  ): Promise<"CREATOR" | "NOT_CREATOR" | "NOT_FOUND">;
}

export type Project = {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
};
