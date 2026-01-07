export interface OrganizationRepository {
  listOrgByUser(
    userId: string,
    isSuperAdmin: boolean | undefined
  ): Promise<Organization[]>;
  listMembers(orgId: string): Promise<Membership[]>;
  getMembership(userId: string, orgId: string): Promise<Membership | null>;
  findById(id: string): Promise<Organization | null>;
  create(data: { name: string, createdById: string }): Promise<Organization>;
  update(id: string, data: { name?: string }): Promise<Organization>;
  delete(id: string): Promise<void>;
  addMember(
    userId: string,
    organizationId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ): Promise<void>;
  removeMember(userId: string, organizationId: string): Promise<void>;
  updateMemberRole(
    userId: string,
    organizationId: string,
    role: "ADMIN" | "MEMBER"
  ): Promise<void>;
}
export type MembershipCheckResult = "MEMBER" | "NOT_MEMBER" | "NOT_FOUND";

export type Membership =
  | { status: "NOT_FOUND" }
  | { status: "NOT_MEMBER" }
  | { status: "MEMBER"; role: "OWNER" | "ADMIN" | "MEMBER" };

export interface Organization {
  id: string;
  name: string;
}
