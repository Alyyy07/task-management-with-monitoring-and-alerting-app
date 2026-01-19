import { Membership, Organization } from "../organization.type.js";

export interface ProjectRepository {
  create(data: {
    name: string;
    slug: string;
    description?: string;
    organizationId: string;
    createdById: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Project>;

  findById(id: string): Promise<Project | null>;
  findBySlug(organizationId: string, slug: string): Promise<Project | null>;
  findByOrganization(orgId: string): Promise<Project[]>;
  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      status?: ProjectStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Project>;
  delete(id: string): Promise<void>;
  userExists(userId: string): Promise<boolean>;
  getOrgMembership(userId: string, organizationId: string): Promise<Membership>;
  findMembership(
    userId: string,
    projectId: string
  ): Promise<{ role: "OWNER" | "ADMIN" | "MEMBER" }>;
  listMembers(projectId: string): Promise<Membership[]>;
  addMember(
    userId: string,
    projectId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ): Promise<void>;
  removeMember(userId: string, projectId: string): Promise<void>;
  changeMemberRole(
    userId: string,
    projectId: string,
    role: "ADMIN" | "MEMBER"
  ): Promise<void>;
  createActivity(data: {
    taskId?: string;
    userId: string;
    action: string;
    projectId?: string;
    organizationId?: string;
    metadata?: any;
    entityId: string;
    entityType: string;
  }): Promise<void>;
  countTasks(projectId: string): Promise<number>;
}

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  organizationId: string;
  createdById: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED";
