"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <form action={formAction} className="auth-form">
      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.fields.email}
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
