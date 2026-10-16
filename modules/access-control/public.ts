export { authorize } from "@/modules/access-control/application/authorize";
export { authorizeRequest } from "@/modules/access-control/application/authorize-request";
export { resolveAccessContext } from "@/modules/access-control/application/resolve-access-context";
export { setProjectMemberRole, setWorkspaceMemberRole } from "@/modules/access-control/application/manage-membership";
export type { AccessContext } from "@/modules/access-control/domain/access-context";
export type { Permission } from "@/modules/access-control/domain/permission";
export type { MembershipReader } from "@/modules/access-control/application/ports/membership-reader";
export type { MembershipAdministrator } from "@/modules/access-control/application/ports/membership-administrator";
