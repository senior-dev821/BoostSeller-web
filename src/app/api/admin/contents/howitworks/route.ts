import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface StepInput {
  title: string;
  description: string;
  order: number;
}

interface BodyInput {
  id: number;
  title: string;
  subtitle: string;
  videoUrl: string;
  steps: StepInput[];
}

export async function GET() {
  const section = await prisma.workingStepsSection.findFirst({
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return NextResponse.json(section);
}

export async function PUT(req: Request) {
  const body: BodyInput = await req.json();
  const { id, title, subtitle, videoUrl, steps } = body;

  // Prepare step data for Prisma
  const stepsData = steps.map((step) => ({
    title: step.title,
    description: step.description,
    order: step.order,
  }));

  // Check if section exists
  const existingSection = await prisma.workingStepsSection.findUnique({
    where: { id },
  });

  if (!existingSection) {
    // Create new section with steps if it does not exist
    await prisma.workingStepsSection.create({
      data: {
        title,
        subtitle,
        videoUrl,
        steps: {
          create: stepsData,
        },
      },
    });
  } else {
    // Delete old steps first
    await prisma.workingStep.deleteMany({
      where: { sectionId: id },
    });

    // Update section data (without nested steps)
    await prisma.workingStepsSection.update({
      where: { id },
      data: {
        title,
        subtitle,
        videoUrl,
      },
    });

    // Create new steps with the sectionId
    await prisma.workingStep.createMany({
      data: stepsData.map(step => ({ ...step, sectionId: id })),
    });
  }

  // Return updated section with steps ordered
  const updated = await prisma.workingStepsSection.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return NextResponse.json(updated);
}
