"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/jobs?mine=true")
      .then((data) => setJobs(data.jobs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Your job postings</h1>
        <Link href="/jobs/new" className="btn-primary px-4 py-2">
          Post a job
        </Link>
      </div>

      {loading ? (
        <p className="text-[var(--color-text-soft)]">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-[var(--color-text-soft)]">You haven't posted any jobs yet.</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="app-card block p-5 mb-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-display text-lg">{job.title}</h3>
                  <p className="text-sm text-[var(--color-text-soft)]">
                    {job._count?.applications ?? 0} application(s)
                  </p>
                </div>
                <p className="text-sm text-[var(--color-text-soft)]">{job.status.replace("_", " ")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
