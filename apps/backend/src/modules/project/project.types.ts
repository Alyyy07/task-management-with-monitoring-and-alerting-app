export interface ProjectRepository {
  getProjectWithOrg(projectId: string): Promise<{
    id: string;
    organizationId: string;
  } | null>;
}
