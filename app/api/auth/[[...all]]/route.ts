import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/modules/identity/infrastructure/better-auth";

async function handle(request: Request) {
  const handlers = toNextJsHandler(getAuth());
  const method = request.method.toUpperCase() as "GET" | "POST";
  return handlers[method](request);
}

export const GET = handle;
export const POST = handle;
