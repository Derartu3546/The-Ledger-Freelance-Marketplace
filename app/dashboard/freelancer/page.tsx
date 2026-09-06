"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-[var(--color-text-soft)]",
  ACCEPTED: "text-[var(--color-success)]",
  REJECTED: "text-[var(--color-danger)]",
  WITHDRAWN: "text-[var(--color-text-soft)]",
};

export default function FreelancerDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch("/api/applications")
      .then((data) => setApplications(data.applications))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function withdraw(id: string) {
    await apiFetch(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "WITHDRAWN" }),
    });
    load();
  }

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Your applications</h1>
        <Link href="/jobs" className="btn-primary px-4 py-2">
          Browse open work
        </Link>
      </div>

      {loading ? (
        <p className="text-[var(--color-text-soft)]">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-[var(--color-text-soft)]">You haven't applied to any jobs yet.</p>
      ) : (
        <div>
          {applications.map((a) => (
            <div key={a.id} className="app-card p-5 mb-4 flex items-center justify-between">
              <div>
                <Link href={`/jobs/${a.job.id}`} className="font-display text-lg hover:underline">
                  {a.job.title}
                </Link>
                <p className="text-sm text-[var(--color-text-soft)]">
                  Proposed ${a.proposedRate} · Job budget ${a.job.budgetMin}–${a.job.budgetMax}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${STATUS_COLOR[a.status]}`}>{a.status}</p>
                {a.status === "PENDING" && (
                  <button onClick={() => withdraw(a.id)} className="text-xs underline mt-1">
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
