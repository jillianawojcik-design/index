"use client";

import { useEffect, useState } from "react";

// Shows the full public URL (built from the current site address) with a copy button.
export default function ShareLink({ slug }: { slug: string }) {
  const path = `/p/${slug}`;
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(`${window.location.origin}${path}`), [path]);

  return (
    <div className="share">
      <a href={path} target="_blank" rel="noopener noreferrer" className="share-url">
        {url}
      </a>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Copy your portfolio link:", url);
          }
        }}
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
