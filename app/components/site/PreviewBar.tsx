import Link from "next/link";
import { publishPortfolio, unpublishPortfolio } from "@/app/actions/portfolio";
import type { Portfolio } from "@/lib/account";

// Thin Folioform bar shown above the owner's private preview.
export default function PreviewBar({ portfolio }: { portfolio: Portfolio }) {
  return (
    <div className="pv-bar" role="region" aria-label="Preview controls">
      <div className="pv-inner">
        <p className="pv-status">
          <span className={portfolio.published ? "pv-dot pv-dot--live" : "pv-dot"} aria-hidden="true" />
          {portfolio.published ? (
            <>
              <b>Published</b> <span className="pv-hide-sm">· anyone with the link can view it</span>
            </>
          ) : (
            <>
              <b>Draft preview</b> <span className="pv-hide-sm">· only you can see this</span>
            </>
          )}
        </p>
        <div className="pv-actions">
          <Link href="/dashboard" className="pv-link">
            Dashboard
          </Link>
          <Link href="/dashboard/edit" className="pv-link">
            Edit
          </Link>
          {portfolio.published ? (
            <>
              <a href={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer" className="pv-link">
                View live ↗
              </a>
              <form action={unpublishPortfolio}>
                <button type="submit" className="pv-btn">
                  Unpublish
                </button>
              </form>
            </>
          ) : (
            <form action={publishPortfolio}>
              <button type="submit" className="pv-btn pv-btn--primary">
                Publish
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
