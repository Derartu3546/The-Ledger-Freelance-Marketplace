import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true } },
      payment: true,
      applications: {
        include: {
          freelancer: { select: { id: true, name: true, skills: true, hourlyRate: true } },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  return NextResponse.json({ job });
}

// PATCH /api/jobs/:id — client owner only (e.g. change status)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.clientId !== auth.userId) {
    return NextResponse.json({ error: "Not your job posting." }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ["title", "description", "category", "budgetMin", "budgetMax", "status"];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const updated = await prisma.job.update({ where: { id: params.id }, data });
  return NextResponse.json({ job: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.clientId !== auth.userId) {
    return NextResponse.json({ error: "Not your job posting." }, { status: 403 });
  }

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
