import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      name: "Amanuel Client",
      email: "client@example.com",
      passwordHash,
      role: "CLIENT",
      bio: "Small business owner looking for web development help.",
    },
  });

  const freelancer = await prisma.user.upsert({
    where: { email: "freelancer@example.com" },
    update: {},
    create: {
      name: "Sara Freelancer",
      email: "freelancer@example.com",
      passwordHash,
      role: "FREELANCER",
      bio: "Full-stack developer specializing in React and Node.js.",
      skills: ["React", "Node.js", "PostgreSQL"],
      hourlyRate: 25,
    },
  });

  const job = await prisma.job.upsert({
    where: { id: "seed-job-1" },
    update: {},
    create: {
      id: "seed-job-1",
      title: "Build a landing page for a coffee shop",
      description:
        "Need a responsive one-page site with a menu, location map, and contact form.",
      category: "Web Development",
      budgetMin: 150,
      budgetMax: 400,
      clientId: client.id,
    },
  });

  await prisma.application.upsert({
    where: { jobId_freelancerId: { jobId: job.id, freelancerId: freelancer.id } },
    update: {},
    create: {
      jobId: job.id,
      freelancerId: freelancer.id,
      coverLetter: "I've built several similar landing pages, happy to share examples.",
      proposedRate: 300,
    },
  });

  console.log("Seed complete:", { client: client.email, freelancer: freelancer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
