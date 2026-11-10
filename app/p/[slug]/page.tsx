import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPortfolio } from "@/lib/account";
import SiteHome from "@/app/components/site/SiteHome";

// Public portfolio. No login needed; shows nothing unless the owner published it.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPublishedPortfolio(slug);
  if (!portfolio) return { title: "Portfolio not found" };
  const c = portfolio.content;
  return { title: [c.name, c.headline].filter(Boolean).join(" — "), description: c.intro || undefined };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { slug } = await params;
  const portfolio = await getPublishedPortfolio(slug);
  if (!portfolio) notFound();
  return <SiteHome content={portfolio.content} basePath={`/p/${portfolio.slug}`} />;
}
