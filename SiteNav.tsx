"use client";

import { useState } from "react";

// Sticky top navigation. The only interactive part is the mobile menu,
// which used to be toggled by a DOM script in the original index.html.
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a href="#top" className="logo">
          Folio<span>form</span>
        </a>
        <button
          className="menu-btn"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
        <ul className={open ? "nav-links open" : "nav-links"}>
          <li><a href="#how" onClick={close}>How it works</a></li>
          <li><a href="#example" onClick={close}>Example</a></li>
          <li><a href="#pricing" onClick={close}>Pricing</a></li>
          <li><a href="#addons" onClick={close}>Career tools</a></li>
          <li><a href="#faq" onClick={close}>Policies</a></li>
          <li>
            <a
              href="#pricing"
              onClick={close}
              className="btn btn-primary"
              style={{ color: "#fff", padding: "9px 18px" }}
            >
              Get started
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
