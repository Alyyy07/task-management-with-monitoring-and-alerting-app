import { Membership, Organization } from "../organization.type.js";

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
  getOrgMembership(userId: string, organizationId: string): Promise<Membership>;
  findMembership(userId: string, projectId: string): Promise<{role:"OWNER" | "ADMIN" | "MEMBER"}>;
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
}

export type Project = {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
};
