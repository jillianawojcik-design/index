import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyPortfolio } from "@/lib/account";
import PreviewBar from "@/app/components/site/PreviewBar";
import SiteHome from "@/app/components/site/SiteHome";

// The owner's private preview of their portfolio (draft or published).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview — Folioform", robots: { index: false } };

export default async function PreviewPage() {
  if (!(await getCurrentUser())) redirect("/login");
  const portfolio = await getMyPortfolio();
  if (!portfolio) redirect("/dashboard");
  return (
    <>
      <PreviewBar portfolio={portfolio} />
      <SiteHome content={portfolio.content} basePath="/preview" />
    </>
  );
}
