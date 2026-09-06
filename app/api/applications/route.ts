import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

const ApplySchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().min(20),
  proposedRate: z.number().int().positive(),
});

// GET /api/applications — the current user's own applications (freelancer)
// or applications to jobs they posted (client), depending on role.
export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (auth.role === "FREELANCER") {
    const applications = await prisma.application.findMany({
      where: { freelancerId: auth.userId },
      include: { job: { select: { id: true, title: true, status: true, budgetMin: true, budgetMax: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  }

  // CLIENT: applications across all jobs they posted.
  const applications = await prisma.application.findMany({
    where: { job: { clientId: auth.userId } },
    include: {
      job: { select: { id: true, title: true } },
      freelancer: { select: { id: true, name: true, skills: true, hourlyRate: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}

// POST /api/applications — freelancer applies to a job
export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (auth.role !== "FREELANCER") {
    return NextResponse.json({ error: "Only freelancers can apply to jobs." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.status !== "OPEN") {
    return NextResponse.json({ error: "This job is no longer accepting applications." }, { status: 400 });
  }

  try {
    const application = await prisma.application.create({
      data: { ...parsed.data, freelancerId: auth.userId },
    });
    return NextResponse.json({ application }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "You already applied to this job." }, { status: 409 });
    }
    throw err;
  }
}
