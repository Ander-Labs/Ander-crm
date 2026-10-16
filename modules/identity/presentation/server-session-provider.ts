import { headers } from "next/headers";
import type { Principal } from "@/modules/identity/domain/principal";
import type { SessionProvider } from "@/modules/identity/application/ports/session-provider";
import { getAuth, isAuthConfigured } from "@/modules/identity/infrastructure/better-auth";

export const serverSessionProvider: SessionProvider = {
  async getCurrentPrincipal(): Promise<Principal | null> {
    if (!isAuthConfigured()) return null;
    const session = await getAuth().api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    return { userId: session.user.id, credentialKind: "session", scopes: null };
  },
};
