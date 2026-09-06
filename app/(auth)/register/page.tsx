"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/lib/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">("FREELANCER");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, role }),
      });
      // Don't block navigation on this — it updates the navbar in the
      // background while the dashboard page is already loading.
      refresh();
      router.push(data.user.role === "CLIENT" ? "/dashboard/client" : "/dashboard/freelancer");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 relative">
      <div className="blob w-64 h-64 bg-[var(--color-accent)] -top-10 -right-20" />
      <h1 className="font-display text-3xl font-bold mb-2 fade-in-up">Create an account</h1>
      <p className="text-[var(--color-text-soft)] mb-8 fade-in-up fade-in-up-delay-1">
        Choose how you'll use The Ledger.
      </p>

      <div className="flex gap-3 mb-8 fade-in-up fade-in-up-delay-1">
        {(["FREELANCER", "CLIENT"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-3 rounded-xl border transition-all ${
              role === r
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] scale-[1.02]"
                : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            {r === "FREELANCER" ? "I do the work" : "I need work done"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 fade-in-up fade-in-up-delay-2">
        <div>
          <label className="block text-sm mb-1 font-medium">Name</label>
          <input
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Email</label>
          <input
            required
            type="email"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Password</label>
          <input
            required
            type="password"
            minLength={6}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}

        <button disabled={loading} className="btn-primary w-full py-3 font-medium">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}