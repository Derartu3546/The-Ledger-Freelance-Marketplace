import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";
import type { JobStatus } from "@prisma/client";

const JobSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string().min(2),
  budgetMin: z.number().int().positive(),
  budgetMax: z.number().int().positive(),
});

// GET /api/jobs?category=&search=&status=&mine=true
// mine=true returns every status, scoped to the logged-in client's own postings.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const mine = searchParams.get("mine") === "true";

  let clientId: string | undefined;
  if (mine) {
    const auth = await getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    clientId = auth.userId;
  }

  const jobs = await prisma.job.findMany({
    where: {
      ...(clientId ? { clientId } : { status: (status ?? "OPEN") as JobStatus }),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

// POST /api/jobs — client only
export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (auth.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can post jobs." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = JobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.budgetMax < parsed.data.budgetMin) {
    return NextResponse.json({ error: "budgetMax must be >= budgetMin." }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: { ...parsed.data, clientId: auth.userId },
  });

  return NextResponse.json({ job }, { status: 201 });
}
