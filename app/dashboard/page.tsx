// Middleware redirects /dashboard to /dashboard/client or /dashboard/freelancer
// based on the logged-in user's role. This page only renders if that somehow
// doesn't fire (e.g. JS disabled edge cases), so keep it minimal.
export default function DashboardRoot() {
  return <p className="py-12 text-[var(--color-text-soft)]">Redirecting to your dashboard…</p>;
}
