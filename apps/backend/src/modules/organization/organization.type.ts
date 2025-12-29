export interface OrganizationRepository {
  findById(id: string): Promise<{ id: string; name: string } | null>;
  isMember(userId: string, organizationId: string): Promise<boolean>;
}
export interface Organization {
  id: string;
  name: string;
}