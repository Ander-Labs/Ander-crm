"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/modules/identity/presentation/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
        callbackURL: "/",
      });
      if (result.error) {
        setError("No se pudo iniciar sesión. Revisa tus datos o contacta al administrador.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Revisa tus datos o contacta al administrador.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-medium" htmlFor="email">
        Correo electrónico
        <Input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
      </label>
      <label className="grid gap-2 text-sm font-medium" htmlFor="password">
        Contraseña
        <Input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128} />
      </label>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Validando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
