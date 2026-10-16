import { randomUUID } from "node:crypto";
import { config as loadEnv } from "dotenv";
import { and, eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { authSchema, user } from "@/modules/identity/infrastructure/persistence/schema";
import { createAuditEvent } from "@/modules/audit/domain/audit-event";
import { auditEvent } from "@/modules/audit/infrastructure/persistence/schema";
import { workspace, workspaceMembership } from "@/modules/workspaces/infrastructure/persistence/schema";
import { closeDatabasePool, getDatabase } from "@/shared/infrastructure/database";

loadEnv({ path: ".env.local" });
loadEnv();

function required(name: string, minLength = 1) {
  const value = process.env[name]?.trim();
  if (!value || value.length < minLength) throw new Error("Bootstrap configuration is incomplete.");
  return value;
}

async function bootstrap() {
  const name = required("BOOTSTRAP_ADMIN_NAME", 2);
  const email = required("BOOTSTRAP_ADMIN_EMAIL", 5).toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!password || password.length < 12) throw new Error("Bootstrap configuration is incomplete.");
  const workspaceName = required("BOOTSTRAP_WORKSPACE_NAME", 2);
  const workspaceSlug = required("BOOTSTRAP_WORKSPACE_SLUG", 2).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workspaceSlug) || workspaceSlug.length > 80) {
    throw new Error("Bootstrap configuration is incomplete.");
  }
  const secret = required("BETTER_AUTH_SECRET", 32);
  const baseURL = required("BETTER_AUTH_URL", 8);

  const auth = betterAuth({
    appName: "Ander CRM private provisioning",
    baseURL,
    secret,
    database: drizzleAdapter(getDatabase(), { provider: "pg", schema: authSchema, transaction: true }),
    emailAndPassword: { enabled: true, disableSignUp: true },
    plugins: [admin()],
  });
  const db = getDatabase();
  let [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (!existingUser) {
    await auth.api.createUser({ body: { name, email, password, role: "user" } });
    [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  }
  if (!existingUser) throw new Error("Internal account provisioning did not complete.");

  await db.transaction(async (tx) => {
    await tx.insert(workspace).values({ slug: workspaceSlug, name: workspaceName })
      .onConflictDoNothing({ target: workspace.slug });
    const [targetWorkspace] = await tx.select({ id: workspace.id })
      .from(workspace).where(and(eq(workspace.slug, workspaceSlug), eq(workspace.active, true))).limit(1);
    if (!targetWorkspace) throw new Error("Workspace provisioning did not complete.");

    const [existingMembership] = await tx.select({ id: workspaceMembership.id, role: workspaceMembership.role })
      .from(workspaceMembership)
      .where(and(
        eq(workspaceMembership.workspaceId, targetWorkspace.id),
        eq(workspaceMembership.userId, existingUser.id),
        eq(workspaceMembership.active, true),
      )).limit(1);
    if (existingMembership?.role === "owner") return;

    await tx.insert(workspaceMembership).values({
      workspaceId: targetWorkspace.id,
      userId: existingUser.id,
      role: "owner",
      active: true,
    }).onConflictDoUpdate({
      target: [workspaceMembership.workspaceId, workspaceMembership.userId],
      set: { role: "owner", active: true },
    });
    await tx.insert(auditEvent).values(createAuditEvent({
      actorUserId: existingUser.id,
      credentialKind: "system",
      workspaceId: targetWorkspace.id,
      action: "identity.bootstrap",
      resourceType: "workspace_membership",
      resourceId: existingUser.id,
      outcome: "succeeded",
      correlationId: randomUUID(),
      metadata: { targetRole: "owner", source: "operator_cli" },
    }));
  });
  console.info("Internal owner account and workspace are ready.");
}

bootstrap().catch(() => {
  console.error("Bootstrap failed. Check local configuration, migration state, and uniqueness constraints.");
  process.exitCode = 1;
}).finally(async () => {
  try {
    await closeDatabasePool();
  } catch {
    process.exitCode = 1;
    console.error("Database cleanup failed.");
  }
});
