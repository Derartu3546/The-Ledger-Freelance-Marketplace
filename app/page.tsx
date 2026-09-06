import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="blob w-96 h-96 bg-[var(--color-primary)] top-0 -left-32" />
      <div className="blob w-80 h-80 bg-[var(--color-accent)] top-20 right-0" style={{ animationDelay: "2s" }} />
      <div className="blob w-72 h-72 bg-[var(--color-accent2)] top-96 left-1/3" style={{ animationDelay: "4s" }} />

      <section className="py-20 sm:py-28 text-center max-w-3xl mx-auto">
        <span className="badge fade-in-up">Now open — no waitlist</span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mt-5 fade-in-up fade-in-up-delay-1">
          Where real work meets <span className="gradient-text">real people</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--color-text-soft)] max-w-2xl mx-auto fade-in-up fade-in-up-delay-2">
          The Ledger is a straightforward two-sided marketplace built for people who want to get
          things done without the bloat. Clients post a job with a clear budget range. Freelancers
          browse, pitch their rate, and get to work. No algorithmic feeds, no hidden fees, no
          endless onboarding — just a clean ledger of who's doing what, for how much, and when
          it's done. Whether you're hiring for a one-off landing page or looking for your next
          short-term gig, everything happens in one focused place: post, apply, get hired, get paid.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4 fade-in-up fade-in-up-delay-3">
          <Link href="/jobs" className="btn-primary px-6 py-3.5 font-medium">
            Browse open work
          </Link>
          <Link href="/register" className="btn-secondary px-6 py-3.5 font-medium">
            Create a free account
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-6 py-16">
        <div className="app-card p-7">
          <div className="h-11 w-11 rounded-xl grid place-items-center bg-[var(--color-primary-soft)] mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">For clients</h2>
          <p className="text-[var(--color-text-soft)]">
            Post a job with a budget range in under a minute. Review every application side by
            side, accept the freelancer who fits, and pay securely through Stripe once you're
            happy with the work.
          </p>
        </div>
        <div className="app-card p-7">
          <div className="h-11 w-11 rounded-xl grid place-items-center bg-[var(--color-primary-soft)] mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">For freelancers</h2>
          <p className="text-[var(--color-text-soft)]">
            Search open jobs by category or keyword, submit a proposed rate and cover letter, and
            track every application's status from a single dashboard — no spreadsheets required.
          </p>
        </div>
      </section>
    </div>
  );
}
