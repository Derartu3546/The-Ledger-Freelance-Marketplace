"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, loaded, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    await logout();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="h-8 w-8" />
          <span className="font-display text-lg font-semibold gradient-text">The Ledger</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/jobs" className="hover:text-[var(--color-primary)] transition-colors">
            Browse work
          </Link>
          {loaded && user?.role === "CLIENT" && (
            <Link href="/jobs/new" className="hover:text-[var(--color-primary)] transition-colors">
              Post a job
            </Link>
          )}
          {loaded && user && (
            <Link
              href={user.role === "CLIENT" ? "/dashboard/client" : "/dashboard/freelancer"}
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {loaded && user ? (
            <button onClick={handleLogout} className="btn-secondary px-4 py-2 text-sm font-medium">
              Log out
            </button>
          ) : (
            loaded && (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-[var(--color-primary)]">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary px-4 py-2 text-sm font-medium">
                  Sign up
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="h-9 w-9 grid place-items-center rounded-full border border-[var(--color-border)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu md:hidden border-t border-[var(--color-border)] px-4 py-4 space-y-3 bg-[var(--color-bg)]">
          <Link href="/jobs" onClick={() => setMenuOpen(false)} className="block py-1">
            Browse work
          </Link>
          {loaded && user?.role === "CLIENT" && (
            <Link href="/jobs/new" onClick={() => setMenuOpen(false)} className="block py-1">
              Post a job
            </Link>
          )}
          {loaded && user && (
            <Link
              href={user.role === "CLIENT" ? "/dashboard/client" : "/dashboard/freelancer"}
              onClick={() => setMenuOpen(false)}
              className="block py-1"
            >
              Dashboard
            </Link>
          )}
          <div className="pt-2 flex flex-col gap-2">
            {loaded && user ? (
              <button onClick={handleLogout} className="btn-secondary py-2 text-sm font-medium">
                Log out
              </button>
            ) : (
              loaded && (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary py-2 text-sm font-medium text-center">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary py-2 text-sm font-medium text-center">
                    Sign up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}