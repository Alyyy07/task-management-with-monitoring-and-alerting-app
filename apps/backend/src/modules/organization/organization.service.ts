import { requireOrgMember } from "../authz/authz.guard.js";
import { AuthContext } from "../authz/authz.type.js";
import { OrganizationRepository } from "./organization.type.js";

export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async getOrganization(context: AuthContext, organizationId: string) {
    await requireOrgMember(
      context,
      organizationId,
      this.organizationRepository.isMember.bind(this.organizationRepository)
    );

    return this.organizationRepository.findById(organizationId);
  }
}
