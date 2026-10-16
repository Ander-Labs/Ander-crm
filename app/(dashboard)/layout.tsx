import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/modules/identity/presentation/sign-out-button";
import { identityComposition } from "@/composition/identity";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const principal = await identityComposition.sessions.getCurrentPrincipal();
  if (!principal) redirect("/login");

  return (
    <div className="min-h-full flex-1 bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/dashboard" className="font-semibold tracking-tight">Ander CRM</a>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">Plataforma interna</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
