import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch the first TeamSection with members
    let section = await prisma.teamSection.findFirst({
      include: { members: true },
    });

    // If no TeamSection exists, create one
    if (!section) {
      section = await prisma.teamSection.create({
        data: {
          title: 'Our Team',
          subtitle: 'Meet our talented team members',
        },
        include: { members: true },
      });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('GET /api/admin/contents/team error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team section.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, subtitle, members } = body;

    // If no ID, create a section first
    let sectionId = id;
    if (!sectionId) {
      const newSection = await prisma.teamSection.create({
        data: {
          title: title?.trim() || 'Our Team',
          subtitle: subtitle?.trim() || '',
        },
      });
      sectionId = newSection.id;
    }

    // Clean members array
    const cleanedMembers = (Array.isArray(members) ? members : []).map((m: any) => ({
      name: (m.name ?? '').trim(),
      role: (m.role ?? '').trim(),
      bio: (m.bio ?? '').trim(),
      avatarUrl: (m.avatarUrl ?? '').trim(),
    })).filter(m => m.name && m.role); // Filter out incomplete entries

    // Detect duplicate names (case-insensitive)
    const nameSet = new Set<string>();
    const duplicates = cleanedMembers.filter(m => {
      const lowerName = m.name.toLowerCase();
      if (nameSet.has(lowerName)) return true;
      nameSet.add(lowerName);
      return false;
    });

    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: `Duplicate member names: ${duplicates.map(d => d.name).join(', ')}` },
        { status: 400 }
      );
    }

    // Update TeamSection basic info
    await prisma.teamSection.update({
      where: { id: sectionId },
      data: {
        title: title?.trim() || 'Our Team',
        subtitle: subtitle?.trim() || '',
      },
    });

    // Remove existing members (safe even if empty)
    await prisma.teamMember.deleteMany({
      where: { sectionId },
    });

    // Add cleaned members
    if (cleanedMembers.length > 0) {
      await prisma.teamMember.createMany({
        data: cleanedMembers.map(m => ({
          ...m,
          sectionId,
        })),
      });
    }

    // Return updated TeamSection
    const updatedSection = await prisma.teamSection.findUnique({
      where: { id: sectionId },
      include: { members: true },
    });

    return NextResponse.json(updatedSection);
  } catch (error: any) {
    console.error('PUT /api/admin/contents/team error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Team section not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update team section.' },
      { status: 500 }
    );
  }
}
