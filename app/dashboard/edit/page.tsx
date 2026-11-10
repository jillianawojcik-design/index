import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyPortfolio } from "@/lib/account";
import AppHeader from "@/app/components/AppHeader";
import Editor from "./Editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit portfolio — Folioform" };

export default async function EditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const portfolio = await getMyPortfolio();
  if (!portfolio) redirect("/dashboard");

  return (
    <>
      <AppHeader user={user} />
      <main className="wrap dash ed-page">
        <Link href="/dashboard" className="ed-back">← Workspace</Link>
        <p className="eyebrow">Edit</p>
        <h1>Edit your portfolio</h1>
        <p className="dash-lead">
          Change anything the AI wrote. Keep it accurate: only include results and details you can stand behind in an interview.
        </p>
        <Editor initial={portfolio.content} />
      </main>
    </>
  );
}
