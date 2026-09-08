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

type Application = {
  id: string;
  proposedRate: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  job: {
    id: string;
    title: string;
    budgetMin: number;
    budgetMax: number;
  };
};

type ApplicationsResponse = {
  applications: Application[];
};

export default function FreelancerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);

    apiFetch<ApplicationsResponse>("/api/applications")
      .then((data) => setApplications(data.applications))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function withdraw(id: string) {
    try {
      await apiFetch(`/api/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "WITHDRAWN" }),
      });

      load();
    } catch {
      // Keep the current applications if withdrawing fails.
    }
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
        <p className="text-[var(--color-text-soft)]">
          You haven't applied to any jobs yet.
        </p>
      ) : (
        <div>
          {applications.map((application) => (
            <div
              key={application.id}
              className="app-card p-5 mb-4 flex items-center justify-between"
            >
              <div>
                <Link
                  href={`/jobs/${application.job.id}`}
                  className="font-display text-lg hover:underline"
                >
                  {application.job.title}
                </Link>

                <p className="text-sm text-[var(--color-text-soft)]">
                  Proposed ${application.proposedRate} · Job budget $
                  {application.job.budgetMin}–${application.job.budgetMax}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    STATUS_COLOR[application.status]
                  }`}
                >
                  {application.status}
                </p>

                {application.status === "PENDING" && (
                  <button
                    onClick={() => withdraw(application.id)}
                    className="text-xs underline mt-1"
                  >
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
