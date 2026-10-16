import { redirect } from "next/navigation";
import { identityComposition } from "@/composition/identity";

export const instant = false;

export default async function Home() {
  const principal = await identityComposition.sessions.getCurrentPrincipal();
  redirect(principal ? "/dashboard" : "/login");
}
