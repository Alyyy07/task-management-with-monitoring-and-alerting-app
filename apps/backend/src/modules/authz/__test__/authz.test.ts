import { describe, expect, it, vi } from "vitest";
import { requireOrgMember, requireSelf } from "../authz.guard.js";

describe("requireSelf", () => {
  it("allows same user", () => {
    expect(() => requireSelf({ userId: "u1" }, "u1")).not.toThrow();
  });

  it("throws if different user", () => {
    expect(() => requireSelf({ userId: "u1" }, "u2")).toThrow("NOT_OWNER");
  });
  it("throws if not member", async () => {
    const isMember = vi.fn().mockResolvedValue(false);

    await expect(
      requireOrgMember({ userId: "u1" }, "org1", isMember)
    ).rejects.toThrow("NOT_MEMBER");
  });
});
