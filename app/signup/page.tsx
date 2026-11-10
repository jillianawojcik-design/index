import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AuthShell from "@/app/components/AuthShell";
import SignupForm from "./SignupForm";

export const metadata: Metadata = { title: "Create your account — Folioform" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="Save your work and come back to your portfolio anytime."
      footer={
        <>
          Already have an account? <Link href="/login">Log in</Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
