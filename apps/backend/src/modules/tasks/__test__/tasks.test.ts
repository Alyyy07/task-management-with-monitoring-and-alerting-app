import { describe, expect, it, vi } from "vitest";
import { TaskService } from "../tasks.service.js";
import { TaskRepository } from "../tasks.types.js";
import { TaskAuthz } from "../task.authz.js";
import { AuthContext } from "../../../libs/authz/authz.type.js";

const mockRepo = {
  findById: vi.fn(),
  findByProject: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  isCreator: vi.fn(),
  isAssignee: vi.fn(),
  assign: vi.fn(),
  createActivity: vi.fn(),
};

const mockAuthz = {
  requireUpdate: vi.fn(),
  requireDelete: vi.fn(),
  requireAssign: vi.fn(),
} as unknown as TaskAuthz;

describe("TaskService", () => {
  const context: AuthContext = { userId: "u1", isSuperAdmin: false };

  it("create should log activity", async () => {
    mockRepo.create.mockResolvedValue({
      id: "1",
      title: "Test",
      projectId: "p1",
      createdById: "u1",
      status: "TODO",
      description: "desc",
      assigneeId: null,
    });

    const service = new TaskService(
      mockRepo as unknown as TaskRepository,
      mockAuthz
    );
    await service.create(context, {
      title: "Test",
      description: "desc",
      projectId: "p1",
    });

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TASK_CREATED",
        entityType: "TASK",
        metadata: { title: "Test" },
      })
    );
  });

  it("update should log activity", async () => {
    mockRepo.update.mockResolvedValue({
      id: "1",
      title: "Updated",
      projectId: "p1",
      createdById: "u1",
      status: "TODO",
      description: "desc",
      assigneeId: null,
    });

    const service = new TaskService(
      mockRepo as unknown as TaskRepository,
      mockAuthz
    );
    await service.update(context, "1", { title: "Updated" });

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TASK_UPDATED",
        entityType: "TASK",
        metadata: { changes: { title: "Updated" } },
      })
    );
  });

  it("delete should log activity", async () => {
    mockRepo.findById.mockResolvedValue({
      id: "1",
      title: "Test",
      projectId: "p1",
      createdById: "u1",
      status: "TODO",
      description: "desc",
      assigneeId: null,
    });

    const service = new TaskService(
      mockRepo as unknown as TaskRepository,
      mockAuthz
    );
    await service.delete(context, "1");

    expect(mockRepo.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "TASK_DELETED",
        entityType: "TASK",
        metadata: { title: "Test", description: "desc" },
      })
    );
  });
});
