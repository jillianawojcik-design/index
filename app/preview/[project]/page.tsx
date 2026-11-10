import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyPortfolio } from "@/lib/account";
import PreviewBar from "@/app/components/site/PreviewBar";
import SiteProject from "@/app/components/site/SiteProject";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview — Folioform", robots: { index: false } };

export default async function PreviewProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project } = await params;
  if (!(await getCurrentUser())) redirect("/login");
  const portfolio = await getMyPortfolio();
  if (!portfolio) redirect("/dashboard");
  const p = portfolio.content.projects.find((x) => x.slug === project);
  if (!p) notFound();
  return (
    <>
      <PreviewBar portfolio={portfolio} />
      <SiteProject content={portfolio.content} project={p} basePath="/preview" />
    </>
  );
}
