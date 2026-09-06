import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

const ReviewSchema = z.object({
  jobId: z.string().uuid(),
  subjectId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
});

// POST /api/reviews — either party reviews the other after a completed job
export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  if (job.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can only review completed jobs." }, { status: 400 });
  }

  try {
    const review = await prisma.review.create({
      data: { ...parsed.data, authorId: auth.userId },
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "You already reviewed this person for this job." }, { status: 409 });
    }
    throw err;
  }
}

// GET /api/reviews?userId=... — public reviews for a user's profile
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId is required." }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { subjectId: userId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}
