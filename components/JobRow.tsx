import Link from "next/link";

type Job = {
  id: string;
  title: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  status: string;
  createdAt: string;
  client: { name: string };
  _count?: { applications: number };
};

export default function JobRow({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="app-card block p-5 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="badge">{job.category}</span>
          <h3 className="font-display text-lg font-semibold mt-2">{job.title}</h3>
          <p className="text-sm text-[var(--color-text-soft)] mt-1">
            Posted by {job.client.name}
            {job._count ? ` · ${job._count.applications} application${job._count.applications === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-lg font-semibold gradient-text">
            ${job.budgetMin}–${job.budgetMax}
          </p>
          <p className="text-xs text-[var(--color-text-soft)] mt-1">{job.status.replace("_", " ")}</p>
        </div>
      </div>
    </Link>
  );
}
