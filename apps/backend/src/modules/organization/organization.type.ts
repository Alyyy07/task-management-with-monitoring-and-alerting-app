export interface OrganizationRepository {
  findById(id: string): Promise<{ id: string; name: string } | null>;
  isMember(
    userId: string,
    organizationId: string
  ): Promise<MembershipCheckResult>;
  getMembership(userId: string, organizationId: string): Promise<Membership>;
}
export type MembershipCheckResult = "MEMBER" | "NOT_MEMBER" | "NOT_FOUND";

export type Membership =
  | { status: "NOT_FOUND" }
  | { status: "NOT_MEMBER" }
  | { status: "MEMBER"; role: "OWNER" | "ADMIN" | "MEMBER" };
