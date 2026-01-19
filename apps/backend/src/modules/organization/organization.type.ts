export interface OrganizationRepository {
  listAllOrg(): Promise<Organization[]>;
  listOrgByUser(userId: string): Promise<Organization[]>;
  listMembers(orgId: string): Promise<Membership[]>;

  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    createdById: string;
  }): Promise<Organization>;
  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      logoUrl?: string;
    }
  ): Promise<Organization>;
  delete(id: string): Promise<void>;
  addMember(
    userId: string,
    organizationId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ): Promise<void>;
  findMembership(
    userId: string,
    organizationId: string
  ): Promise<{ role: "OWNER" | "ADMIN" | "MEMBER" } | null>;
  removeMember(userId: string, organizationId: string): Promise<void>;
  updateMemberRole(
    userId: string,
    organizationId: string,
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
  countProjects(orgId: string): Promise<number>;
  removeUserFromOrgProjects(userId: string, orgId: string): Promise<void>;
}
export type MembershipCheckResult = "MEMBER" | "NOT_MEMBER" | "NOT_FOUND";

export type Membership =
  | { status: "NOT_FOUND" }
  | { status: "NOT_MEMBER" }
  | { status: "MEMBER"; role: "OWNER" | "ADMIN" | "MEMBER" };

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
