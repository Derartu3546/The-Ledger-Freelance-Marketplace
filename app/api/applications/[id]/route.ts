import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

const StatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "WITHDRAWN"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: { job: true },
  });
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  const { status } = parsed.data;

  if (status === "WITHDRAWN") {
    if (application.freelancerId !== auth.userId) {
      return NextResponse.json({ error: "Only the applicant can withdraw." }, { status: 403 });
    }
  } else {
    // ACCEPTED / REJECTED — only the job's client can decide.
    if (application.job.clientId !== auth.userId) {
      return NextResponse.json({ error: "Only the job owner can decide on applications." }, { status: 403 });
    }
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: { status },
  });

  // Accepting one application moves the job to IN_PROGRESS.
  if (status === "ACCEPTED") {
    await prisma.job.update({
      where: { id: application.jobId },
      data: { status: "IN_PROGRESS" },
    });
  }

  return NextResponse.json({ application: updated });
}
