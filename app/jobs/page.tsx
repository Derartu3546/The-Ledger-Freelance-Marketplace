"use client";

import { useEffect, useState } from "react";
import JobRow from "@/components/JobRow";
import { apiFetch } from "@/lib/apiClient";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    setLoading(true);
    const timeout = setTimeout(() => {
      apiFetch(`/api/jobs?${params.toString()}`)
        .then((data) => setJobs(data.jobs))
        .finally(() => setLoading(false));
    }, 300); // debounce typing
    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="py-12">
      <h1 className="font-display text-3xl font-bold mb-6 fade-in-up">Open work</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-8 fade-in-up fade-in-up-delay-1">
        <input
          placeholder="Search jobs…"
          className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {loading ? (
        <p className="text-[var(--color-text-soft)]">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-[var(--color-text-soft)]">No open jobs match that search yet.</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
