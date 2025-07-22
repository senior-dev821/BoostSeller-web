// app/api/admin/contents/howitworks/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const section = await prisma.workingStepsSection.findFirst({
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(section);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, title, subtitle, videoUrl, steps } = body;

  const updated = await prisma.workingStepsSection.update({
    where: { id },
    data: {
      title,
      subtitle,
      videoUrl,
      steps: {
        deleteMany: {}, // Remove all old steps
        create: steps.map((step: any) => ({
          title: step.title,
          description: step.description,
          order: step.order,
        })),
      },
    },
    include: { steps: true },
  });

  return NextResponse.json(updated);
}
