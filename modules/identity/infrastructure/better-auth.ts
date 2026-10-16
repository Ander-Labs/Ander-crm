import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { authSchema } from "@/modules/identity/infrastructure/persistence/schema";
import { getDatabase } from "@/shared/infrastructure/database";

export function isAuthConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_URL && process.env.BETTER_AUTH_SECRET?.length && process.env.BETTER_AUTH_SECRET.length >= 32);
}

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || secret.length < 32 || !baseURL || !process.env.DATABASE_URL) {
    throw new Error("Authentication is not configured. Set BETTER_AUTH_SECRET and BETTER_AUTH_URL.");
  }
  const secureCookies = new URL(baseURL).protocol === "https:";
  return betterAuth({
    appName: "Ander CRM",
    baseURL,
    secret,
    trustedOrigins: [new URL(baseURL).origin],
    database: drizzleAdapter(getDatabase(), {
      provider: "pg",
      schema: authSchema,
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
    },
    advanced: {
      useSecureCookies: secureCookies,
    },
    session: {
      expiresIn: 60 * 60 * 12,
      updateAge: 60 * 60,
      cookieCache: { enabled: false },
    },
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth(): ReturnType<typeof createAuth> {
  if (authInstance) return authInstance;
  authInstance = createAuth();
  return authInstance;
}
