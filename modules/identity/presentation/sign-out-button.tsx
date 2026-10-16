"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/modules/identity/presentation/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }
  return <Button type="button" variant="outline" disabled={pending} onClick={signOut}>{pending ? "Cerrando…" : "Cerrar sesión"}</Button>;
}
