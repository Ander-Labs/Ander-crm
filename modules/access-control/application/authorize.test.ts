import { describe, expect, it } from "vitest";
import { authorize } from "@/modules/access-control/application/authorize";
import { resolveAccessContext } from "@/modules/access-control/application/resolve-access-context";
import type { MembershipReader } from "@/modules/access-control/application/ports/membership-reader";
import type { Principal } from "@/modules/identity/domain/principal";

const principal: Principal = { userId: "user-1", credentialKind: "session", scopes: null };

describe("authorization policy", () => {
  it("denies when context is missing", () => {
    expect(authorize(null, "workspace.read").allowed).toBe(false);
  });

  it("requires project membership even for a workspace owner", () => {
    expect(authorize({ principal, workspaceId: "w1", workspaceRole: "owner", projectId: "p1" }, "project.read"))
      .toMatchObject({ allowed: false, reason: "project_membership_required" });
  });

  it("intersects credential scopes with role grants", () => {
    expect(authorize({
      principal: { ...principal, credentialKind: "oauth", scopes: new Set(["workspace.read"]) },
      workspaceId: "w1",
      workspaceRole: "owner",
    }, "credential.manage")).toMatchObject({ allowed: false, reason: "credential_scope_denied" });
  });

  it("does not let a non-session credential omit its scopes", () => {
    expect(authorize({
      principal: { ...principal, credentialKind: "api_key", scopes: null },
      workspaceId: "w1",
      workspaceRole: "owner",
    }, "workspace.read")).toMatchObject({ allowed: false, reason: "credential_scope_denied" });
  });

  it("allows a project administrator to manage project members only after project membership is verified", () => {
    expect(authorize({
      principal,
      workspaceId: "w1",
      workspaceRole: "member",
      projectId: "p1",
      projectRole: "admin",
    }, "project.members.manage").allowed).toBe(true);
  });

  it("denies access to an unverified workspace or project membership", async () => {
    const memberships: MembershipReader = {
      findActiveWorkspaceRole: async () => null,
      findActiveProjectRole: async () => null,
    };
    await expect(resolveAccessContext(principal, "foreign-workspace", undefined, memberships))
      .resolves.toMatchObject({ ok: false, reason: "workspace_access_denied" });
  });

  it("lets workspace administrators provision the first project membership without granting project data access", async () => {
    const memberships: MembershipReader = {
      findActiveWorkspaceRole: async () => "owner",
      findActiveProjectRole: async () => null,
    };
    const resolved = await resolveAccessContext(principal, "w1", "p1", memberships, { allowWorkspaceAdminForProjectMembership: true });
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(authorize(resolved.context, "project.members.manage").allowed).toBe(true);
      expect(authorize(resolved.context, "project.read").allowed).toBe(false);
    }
  });
});
