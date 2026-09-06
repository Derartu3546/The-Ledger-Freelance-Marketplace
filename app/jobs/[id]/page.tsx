"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const paymentRedirect = searchParams.get("payment"); // "success" | "cancelled" | null
  const [job, setJob] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [form, setForm] = useState({ coverLetter: "", proposedRate: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function load() {
    const [jobData, meData] = await Promise.all([
      apiFetch(`/api/jobs/${id}`),
      apiFetch("/api/auth/me"),
    ]);
    setJob(jobData.job);
    setMe(meData.user);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await apiFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          jobId: id,
          coverLetter: form.coverLetter,
          proposedRate: Number(form.proposedRate),
        }),
      });
      setMessage("Application submitted.");
      load();
    } catch (err: any) {
      setMessage("Couldn't submit application — you may have already applied.");
    }
  }

  async function decide(applicationId: string, status: "ACCEPTED" | "REJECTED") {
    await apiFetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function payFreelancer(applicationId: string) {
    setPayingId(applicationId);
    try {
      const data = await apiFetch("/api/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ applicationId }),
      });
      window.location.href = data.url; // hand off to Stripe Checkout (test mode)
    } catch (err: any) {
      setMessage(err.message || "Couldn't start checkout.");
      setPayingId(null);
    }
  }

  async function markComplete() {
    await apiFetch(`/api/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    load();
  }

  if (loading) return <p className="py-12 text-[var(--color-text-soft)]">Loading…</p>;
  if (!job) return <p className="py-12">Job not found.</p>;

  const isOwner = me?.id === job.client.id;
  const isFreelancer = me?.role === "FREELANCER";
  const alreadyApplied = job.applications?.some((a: any) => a.freelancer.id === me?.id);

  return (
    <div className="py-12 max-w-2xl">
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-soft)]">{job.category}</p>
      <h1 className="font-display text-3xl mt-1">{job.title}</h1>
      <p className="text-[var(--color-text-soft)] mt-1">
        Posted by {job.client.name} · Budget ${job.budgetMin}–${job.budgetMax} · {job.status.replace("_", " ")}
      </p>
      <p className="mt-6 whitespace-pre-wrap">{job.description}</p>

      {paymentRedirect === "success" && (
        <div className="mt-6 app-card p-4 border-[var(--color-success)]">
          <p className="text-[var(--color-success)] font-medium">
            Payment successful (test mode) — no real money was charged.
          </p>
        </div>
      )}
      {paymentRedirect === "cancelled" && (
        <div className="mt-6 app-card p-4">
          <p className="text-[var(--color-text-soft)]">Checkout was cancelled. You can try again below.</p>
        </div>
      )}

      {isOwner && job.status === "IN_PROGRESS" && job.payment?.status === "PAID" && (
        <div className="mt-6 app-card p-4 border-[var(--color-success)]">
          <p className="text-[var(--color-success)] font-medium">Paid — ${(job.payment.amountCents / 100).toFixed(2)}</p>
        </div>
      )}

      {isOwner && job.status === "IN_PROGRESS" && job.payment?.status !== "PAID" && (
        <button
          onClick={() => payFreelancer(job.applications.find((a: any) => a.status === "ACCEPTED")?.id)}
          disabled={payingId !== null}
          className="btn-primary mt-6 px-5 py-2.5 font-medium"
        >
          {payingId ? "Redirecting to Stripe…" : "Pay freelancer (Stripe test mode)"}
        </button>
      )}

      {isOwner && job.status === "IN_PROGRESS" && job.payment?.status === "PAID" && (
        <button onClick={markComplete} className="btn-secondary mt-4 px-4 py-2 block">
          Mark job as completed
        </button>
      )}

      {isOwner && (
        <div className="mt-10">
          <h2 className="font-display text-xl mb-4">
            Applications ({job.applications.length})
          </h2>
          {job.applications.length === 0 && (
            <p className="text-[var(--color-text-soft)]">No applications yet.</p>
          )}
          {job.applications.map((a: any) => (
            <div key={a.id} className="app-card p-5 mb-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium">{a.freelancer.name}</p>
                  <p className="text-sm text-[var(--color-text-soft)]">
                    Proposed rate: ${a.proposedRate} · Status: {a.status}
                  </p>
                  <p className="text-sm mt-2">{a.coverLetter}</p>
                </div>
                {a.status === "PENDING" && job.status === "OPEN" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => decide(a.id, "ACCEPTED")} className="btn-primary px-3 py-1.5 text-sm">
                      Accept
                    </button>
                    <button onClick={() => decide(a.id, "REJECTED")} className="btn-secondary px-3 py-1.5 text-sm">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isFreelancer && job.status === "OPEN" && !alreadyApplied && (
        <form onSubmit={handleApply} className="mt-10 space-y-4">
          <h2 className="font-display text-xl">Apply to this job</h2>
          <div>
            <label className="block text-sm mb-1">Cover letter</label>
            <textarea
              required
              minLength={20}
              rows={4}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
              value={form.coverLetter}
              onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Your proposed rate ($)</label>
            <input
              required
              type="number"
              min={1}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
              value={form.proposedRate}
              onChange={(e) => setForm({ ...form, proposedRate: e.target.value })}
            />
          </div>
          <button className="btn-primary px-5 py-2.5 font-medium">Submit application</button>
        </form>
      )}

      {isFreelancer && alreadyApplied && (
        <p className="mt-10 text-[var(--color-text-soft)]">You've already applied to this job.</p>
      )}

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
