import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { User } from "@/lib/session";

// Top bar for signed-in pages. Same sticky bar and logo as the homepage.
export default function AppHeader({ user }: { user: User }) {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="logo">
          Folio<span>form</span>
        </Link>
        <div className="app-nav">
          <span className="app-user">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
