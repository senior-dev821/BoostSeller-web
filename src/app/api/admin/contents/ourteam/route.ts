// File: /app/api/admin/contents/team/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const section = await prisma.teamSection.findFirst({
      include: {
        members: true,
      },
    })

    if (!section) {
      return NextResponse.json({ error: 'Team section not found' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('GET team section error:', error)
    return NextResponse.json({ error: 'Failed to fetch team section' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, title, subtitle, members } = body

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
    }

    const updatedSection = await prisma.teamSection.update({
      where: { id },
      data: {
        title,
        subtitle,
        members: {
          deleteMany: {}, // Remove all old ones first
          create: members.map((m: any) => ({
            name: m.name,
            role: m.role,
            bio: m.bio,
            avatarUrl: m.avatarUrl,
          })),
        },
      },
      include: {
        members: true,
      },
    })

    return NextResponse.json(updatedSection)
  } catch (error) {
    console.error('PUT team section error:', error)
    return NextResponse.json({ error: 'Failed to update team section' }, { status: 500 })
  }
}
