import Link from "next/link";
import { identityComposition } from "@/composition/identity";
import { listMyWorkspaces } from "@/modules/workspaces/application/workspace-directory";

export default async function DashboardPage() {
  const principal = await identityComposition.sessions.getCurrentPrincipal();
  if (!principal) return null;
  const workspaces = await listMyWorkspaces(principal, identityComposition.workspaces);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Espacio de trabajo</p>
        <h1 className="text-3xl font-semibold tracking-tight">Tus workspaces</h1>
        <p className="max-w-2xl text-muted-foreground">Selecciona un workspace al que tienes acceso. Los permisos se verifican en el servidor.</p>
      </div>
      {workspaces.length === 0 ? (
        <section className="rounded-xl border border-dashed bg-background p-8" aria-labelledby="empty-workspaces">
          <h2 id="empty-workspaces" className="font-semibold">Aún no tienes workspaces asignados</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Solicita al administrador interno que te asigne una membresía. No se crean datos de ejemplo.</p>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link className="block h-full rounded-xl border bg-background p-6 transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/workspaces/${workspace.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{workspace.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{workspace.slug}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground">{workspace.role}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
