import Link from "next/link";
import { notFound } from "next/navigation";
import { identityComposition } from "@/composition/identity";
import { authorize } from "@/modules/access-control/application/authorize";
import { resolveAccessContext } from "@/modules/access-control/application/resolve-access-context";
import { listMyProjects } from "@/modules/projects/application/project-directory";

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const principal = await identityComposition.sessions.getCurrentPrincipal();
  if (!principal) return null;
  const { workspaceId } = await params;
  const resolved = await resolveAccessContext(principal, workspaceId, undefined, identityComposition.memberships);
  if (!resolved.ok || !authorize(resolved.context, "workspace.read").allowed) notFound();

  const projects = await listMyProjects(principal, workspaceId, identityComposition.projects, identityComposition.memberships);
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/dashboard">← Workspaces</Link>
        <h1 className="text-3xl font-semibold tracking-tight">Proyectos</h1>
        <p className="text-muted-foreground">Solo se muestran los proyectos con membresía activa dentro de este workspace.</p>
      </div>
      {projects.length === 0 ? (
        <section className="rounded-xl border border-dashed bg-background p-8">
          <h2 className="font-semibold">No tienes proyectos asignados</h2>
          <p className="mt-2 text-sm text-muted-foreground">Pide al administrador del workspace que revise tus membresías.</p>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id} className="rounded-xl border bg-background p-6">
              <h2 className="font-semibold">{project.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{project.slug}</p>
              <p className="mt-4 text-xs capitalize text-muted-foreground">Rol: {project.role}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
