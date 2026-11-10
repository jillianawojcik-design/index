import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AuthShell from "@/app/components/AuthShell";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Log in — Folioform" };

export default async function LoginPage() {
  // Already signed in? Skip straight to the dashboard.
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in"
      subtitle="Pick up where you left off with your portfolio."
      footer={
        <>
          New to Folioform? <Link href="/signup">Create an account</Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
