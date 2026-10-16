import type { Principal } from "@/modules/identity/domain/principal";

export interface SessionProvider {
  getCurrentPrincipal(): Promise<Principal | null>;
}
