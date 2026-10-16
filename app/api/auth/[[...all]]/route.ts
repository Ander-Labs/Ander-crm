import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/modules/identity/infrastructure/better-auth";

async function handle(request: Request) {
  const auth = getAuth();
  const pathname = new URL(request.url).pathname.replace(/\/$/, "");

  // Better Auth has no handler for the base path; expose a health response for
  // infrastructure checks that verify BETTER_AUTH_URL directly.
  if (request.method === "GET" && pathname === "/api/auth") {
    return Response.json({ ok: true });
  }

  const handlers = toNextJsHandler(auth);
  const method = request.method.toUpperCase() as "GET" | "POST";
  return handlers[method](request);
}

export const GET = handle;
export const POST = handle;
