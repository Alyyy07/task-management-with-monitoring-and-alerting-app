import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProjectService } from "../project.service.js";
import { ProjectRepository } from "../project.types.js";
import { ProjectAuthz } from "../project.authz.js";
import { AuthContext } from "../../../../libs/authz/authz.type.js";

const mockRepo = {
  findById: vi.fn(),
  findByOrganization: vi.fn(),
  findBySlug: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addMember: vi.fn(),
  createActivity: vi.fn(),
  changeMemberRole: vi.fn(),
  removeMember: vi.fn(),
  listMembers: vi.fn(),
  getOrgMembership: vi.fn(),
  findMembership: vi.fn(),
  userExists: vi.fn(),
  countTasks: vi.fn(),
};

const mockAuthz = {
  requireCreate: vi.fn(),
  requireReadInOrg: vi.fn(),
  requireReadProject: vi.fn(),
  requireUpdate: vi.fn(),
  requireDelete: vi.fn(),
  requireManageMembers: vi.fn(),
} as unknown as ProjectAuthz;

describe("ProjectService", () => {
  const context: AuthContext = { userId: "u1", isSuperAdmin: false };

  it("create should log activity", async () => {
    mockRepo.create.mockResolvedValue({
      id: "p1",
      name: "Project 1",
      slug: "project-1",
      organizationId: "org1",
      createdBy: "u1",
    });

    const service = new ProjectService(
      mockRepo as unknown as ProjectRepository,
      mockAuthz
    );
    await service.create(context, { name: "Project 1" }, "org1");

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        metadata: { name: "Project 1", slug: "project-1" },
      })
    );
  });

  it("update should log activity", async () => {
    mockRepo.update.mockResolvedValue({
      id: "p1",
      name: "Updated Project",
      slug: "updated-project",
      organizationId: "org1",
      createdBy: "u1",
    });

    const service = new ProjectService(
      mockRepo as unknown as ProjectRepository,
      mockAuthz
    );
    await service.update(context, "p1", { name: "Updated Project" });

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "PROJECT_UPDATED",
        entityType: "PROJECT",
        metadata: { changes: { name: "Updated Project" } },
      })
    );
  });

  it("delete should log activity", async () => {
    mockRepo.findById.mockResolvedValue({
      id: "1",
      name: "Project 1",
      organizationId: "org-1",
    });
    mockRepo.countTasks.mockResolvedValue(0);

    const service = new ProjectService(
      mockRepo as unknown as ProjectRepository,
      mockAuthz
    );
    await service.delete(context, "1");

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "PROJECT_DELETED",
        projectId: "1",
      })
    );
  });

  describe("Safe Cascade Deletion", () => {
    let service: ProjectService;

    beforeEach(() => {
      vi.clearAllMocks();
      service = new ProjectService(
        mockRepo as unknown as ProjectRepository,
        mockAuthz
      );
      mockRepo.findById.mockResolvedValue({ id: "p1", organizationId: "org1" });
    });

    it("should throw error if project has tasks and cascade is false", async () => {
      mockRepo.countTasks.mockResolvedValue(5);

      await expect(service.delete(context, "p1", false)).rejects.toThrow(
        "DEPENDENCY_CONFLICT"
      );
    });

    it("should deleted if project has tasks and cascade is true", async () => {
      mockRepo.countTasks.mockResolvedValue(5);
      mockRepo.findById.mockResolvedValue({
        id: "p1",
        name: "P1",
        organizationId: "org1",
      });

      await service.delete(context, "p1", true);
      expect(mockRepo.delete).toHaveBeenCalledWith("p1");
    });
  });

  describe("addMember", () => {
    let service: ProjectService;

    beforeEach(() => {
      vi.clearAllMocks();
      service = new ProjectService(
        mockRepo as unknown as ProjectRepository,
        mockAuthz
      );
    });

    it("should throw error if user is not in organization", async () => {
      mockRepo.findById.mockResolvedValue({ id: "p1", organizationId: "org1" });
      mockRepo.userExists.mockResolvedValue(true);
      mockRepo.getOrgMembership.mockResolvedValue(null);

      await expect(
        service.addMember(context, "p1", "u1", "MEMBER")
      ).rejects.toThrow("INVALID_REFERENCE");
    });

    it("should add member if user is in organization", async () => {
      mockRepo.findById.mockResolvedValue({ id: "p1", organizationId: "org1" });
      mockRepo.userExists.mockResolvedValue(true);
      mockRepo.getOrgMembership.mockResolvedValue({ id: "m1" });
      mockRepo.findMembership.mockResolvedValue(null);

      await service.addMember(context, "p1", "u1", "MEMBER");
      expect(mockRepo.addMember).toHaveBeenCalledWith("u1", "p1", "MEMBER");
    });
  });
});
