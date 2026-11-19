"use client";

import { useActionState } from "react";
import { TextField } from "@/components/register/Fields";
import { buttonClass, Spinner } from "@/components/ui/Button";
import { login } from "../actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 space-y-6">
      <TextField id="password" name="password" type="password" label="Password" autoComplete="current-password" required error={error ?? undefined} />
      <button type="submit" disabled={pending} className={buttonClass("gold", "w-full")}>
        {pending ? (
          <>
            <Spinner /> Checking…
          </>
        ) : (
          "Log in"
        )}
      </button>
    </form>
  );
}
