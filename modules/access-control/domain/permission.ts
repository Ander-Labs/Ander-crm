export const permissions = [
  "workspace.read",
  "workspace.members.manage",
  "project.read",
  "project.create",
  "project.members.manage",
  "audit.read",
  "credential.manage",
] as const;

export type Permission = (typeof permissions)[number];
