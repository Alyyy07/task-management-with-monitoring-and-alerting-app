import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationService } from "../organization.service.js";
import { OrganizationRepository } from "../organization.type.js";
import { OrganizationAuthz } from "../organization.authz.js";
import { AuthContext } from "../../../libs/authz/authz.type.js";

const mockRepo = {
  findById: vi.fn(),
  listAllOrg: vi.fn(),
  listOrgByUser: vi.fn(),
  create: vi.fn(),
  findBySlug: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addMember: vi.fn(),
  createActivity: vi.fn(),
  listMembers: vi.fn(),
  findMembership: vi.fn(),
  removeMember: vi.fn(),
  updateMemberRole: vi.fn(),
  countProjects: vi.fn(),
  removeUserFromOrgProjects: vi.fn(),
};

const mockAuthz = {
  requireRead: vi.fn(),
  requireUpdate: vi.fn(),
  requireDelete: vi.fn(),
  requireManageMembers: vi.fn(),
} as unknown as OrganizationAuthz;

describe("OrganizationService", () => {
  const context: AuthContext = { userId: "u1", isSuperAdmin: false };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create should log activity", async () => {
    mockRepo.create.mockResolvedValue({
      id: "org1",
      name: "Org 1",
      slug: "org-1",
      createdById: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = new OrganizationService(
      mockRepo as unknown as OrganizationRepository,
      mockAuthz
    );
    await service.create(context, { name: "Org 1" });

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ORG_CREATED",
        entityType: "ORGANIZATION",
        metadata: { name: "Org 1", slug: "org-1" },
      })
    );
  });

  it("update should log activity", async () => {
    mockRepo.update.mockResolvedValue({
      id: "org1",
      name: "Updated Org",
      slug: "updated-org",
      createdById: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = new OrganizationService(
      mockRepo as unknown as OrganizationRepository,
      mockAuthz
    );
    await service.update(context, "org1", { name: "Updated Org" });

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ORG_UPDATED",
        entityType: "ORGANIZATION",
        metadata: { changes: { name: "Updated Org" } },
      })
    );
  });

  it("delete should log activity", async () => {
    mockRepo.findById.mockResolvedValue({
      id: "org1",
      name: "Org 1",
      createdById: "u1",
    });

    const service = new OrganizationService(
      mockRepo as unknown as OrganizationRepository,
      mockAuthz
    );
    await service.delete(context, "org1");

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ORG_DELETED",
        entityType: "ORGANIZATION",
        metadata: { name: "Org 1", cascade: false },
      })
    );
  });

  it("removeMember should cleanup project memberships", async () => {
    const service = new OrganizationService(
      mockRepo as unknown as OrganizationRepository,
      mockAuthz
    );
    await service.removeMember(context, "org1", "u2");

    expect(mockRepo.removeUserFromOrgProjects).toHaveBeenCalledWith(
      "u2",
      "org1"
    );
    expect(mockRepo.removeMember).toHaveBeenCalledWith("u2", "org1");
  });
});
