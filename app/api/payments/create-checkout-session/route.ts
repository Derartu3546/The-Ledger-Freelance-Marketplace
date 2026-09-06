import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAuthFromRequest } from "@/lib/auth";

const Schema = z.object({ applicationId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (auth.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can pay for a job." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: { job: true, freelancer: true, payment: true },
  });
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (application.job.clientId !== auth.userId) {
    return NextResponse.json({ error: "Not your job." }, { status: 403 });
  }
  if (application.status !== "ACCEPTED") {
    return NextResponse.json({ error: "You can only pay an accepted freelancer." }, { status: 400 });
  }
  if (application.payment?.status === "PAID") {
    return NextResponse.json({ error: "This job has already been paid." }, { status: 400 });
  }

  const amountCents = application.proposedRate * 100;
  const origin = req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: application.job.title,
            description: `Payment to ${application.freelancer.name} for completing this job (test mode).`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/jobs/${application.jobId}?payment=success`,
    cancel_url: `${origin}/jobs/${application.jobId}?payment=cancelled`,
    metadata: {
      jobId: application.jobId,
      applicationId: application.id,
    },
  });

  // Upsert so re-clicking "Pay" after a cancelled checkout reuses one Payment row.
  await prisma.payment.upsert({
    where: { applicationId: application.id },
    update: { stripeSessionId: session.id, amountCents, status: "PENDING" },
    create: {
      jobId: application.jobId,
      applicationId: application.id,
      amountCents,
      stripeSessionId: session.id,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: session.url });
}
