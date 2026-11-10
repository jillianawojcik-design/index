"use client";

import { useActionState } from "react";
import { signup, type AuthState } from "@/app/actions/auth";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signup, undefined);

  return (
    <form action={formAction} className="auth-form">
      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <label className="field">
        <span>Full name</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={state?.fields.name}
        />
      </label>
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
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={200}
        />
        <span className="field-hint">At least 8 characters.</span>
      </label>
      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
