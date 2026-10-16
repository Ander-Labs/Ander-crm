import { redirect } from "next/navigation";
import { identityComposition } from "@/composition/identity";

export default async function Home() {
  const principal = await identityComposition.sessions.getCurrentPrincipal();
  redirect(principal ? "/dashboard" : "/login");
}
