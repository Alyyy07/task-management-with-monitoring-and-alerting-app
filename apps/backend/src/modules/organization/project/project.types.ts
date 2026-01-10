import { Membership } from "../organization.type.js";

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
  getMembership(userId: string, projectId: string): Promise<Membership | null>;
  listMembers(projectId: string): Promise<Membership[]>;
  isCreator(
    projectId: string,
    userId: string
  ): Promise<"CREATOR" | "NOT_CREATOR" | "NOT_FOUND">;
  addMember(
    userId: string,
    organizationId: string,
    projectId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ): Promise<void>;
  removeMember(userId: string, orgId: string, projectId: string): Promise<void>;
  changeMemberRole(
    userId: string,
    orgId: string,
    projectId: string,
    role: "ADMIN" | "MEMBER"
  ): Promise<void>;
}

export type Project = {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
};
