"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Web Development",
    budgetMin: 100,
    budgetMax: 500,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          budgetMin: Number(form.budgetMin),
          budgetMax: Number(form.budgetMax),
        }),
      });
      router.push(`/jobs/${data.job.id}`);
    } catch (err: any) {
      setError("Couldn't post the job — check the fields and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="font-display text-3xl mb-8">Post a job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            required
            minLength={5}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            required
            minLength={20}
            rows={5}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option>Web Development</option>
            <option>Design</option>
            <option>Writing</option>
            <option>Marketing</option>
            <option>Other</option>
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Budget min ($)</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
              value={form.budgetMin}
              onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Budget max ($)</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
              value={form.budgetMax}
              onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })}
            />
          </div>
        </div>

        {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}

        <button disabled={loading} className="btn-primary w-full py-3 font-medium">
          {loading ? "Posting…" : "Post job"}
        </button>
      </form>
    </div>
  );
}
