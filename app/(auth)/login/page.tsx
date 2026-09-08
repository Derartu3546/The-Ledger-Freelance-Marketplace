"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/lib/AuthContext";

type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "CLIENT" | "FREELANCER" | "ADMIN";
  };
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      // Update authentication state in the background.
      refresh();

      const next = searchParams.get("next");

      router.push(
        next ??
          (data.user.role === "CLIENT"
            ? "/dashboard/client"
            : "/dashboard/freelancer")
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4 relative">
      <div className="blob w-64 h-64 bg-[var(--color-primary)] -top-10 -left-20" />

      <h1 className="font-display text-3xl font-bold mb-2 fade-in-up">
        Welcome back
      </h1>

      <p className="text-[var(--color-text-soft)] mb-8 fade-in-up fade-in-up-delay-1">
        Log in to manage your jobs or applications.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 fade-in-up fade-in-up-delay-2"
      >
        <div>
          <label className="block text-sm mb-1 font-medium">
            Email
          </label>

          <input
            required
            type="email"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Password
          </label>

          <input
            required
            type="password"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 outline-none focus:border-[var(--color-primary)] transition-colors"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        {error && (
          <p className="text-[var(--color-danger)] text-sm">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="btn-primary w-full py-3 font-medium"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-16 px-4">
          <p className="text-[var(--color-text-soft)]">
            Loading…
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
