import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPortfolio } from "@/lib/account";
import SiteProject from "@/app/components/site/SiteProject";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; project: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, project } = await params;
  const portfolio = await getPublishedPortfolio(slug);
  const p = portfolio?.content.projects.find((x) => x.slug === project);
  if (!portfolio || !p) return { title: "Project not found" };
  return { title: `${p.title} — ${portfolio.content.name}`, description: p.summary || undefined };
}

export default async function PublicProjectPage({ params }: Props) {
  const { slug, project } = await params;
  const portfolio = await getPublishedPortfolio(slug);
  const p = portfolio?.content.projects.find((x) => x.slug === project);
  if (!portfolio || !p) notFound();
  return <SiteProject content={portfolio.content} project={p} basePath={`/p/${portfolio.slug}`} />;
}
