import { redirect } from "next/navigation";
import { SignInForm } from "@/modules/identity/presentation/sign-in-form";
import { identityComposition } from "@/composition/identity";
import { isAuthConfigured } from "@/modules/identity/infrastructure/better-auth";

export const instant = false;

export default async function LoginPage() {
  const principal = await identityComposition.sessions.getCurrentPrincipal();
  if (principal) redirect("/dashboard");

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-muted/40 px-4 py-12">
      <section className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Ander CRM</p>
          <h1 className="text-2xl font-semibold tracking-tight">Acceso interno</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión con la cuenta interna que te asignó el administrador.</p>
        </div>
        {isAuthConfigured() ? (
          <SignInForm />
        ) : (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground" role="status">
            El acceso aún no está configurado en este entorno. Completa las variables de entorno del servidor para habilitar el inicio de sesión.
          </p>
        )}
      </section>
    </main>
  );
}
