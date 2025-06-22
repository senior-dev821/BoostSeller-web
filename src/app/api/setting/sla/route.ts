import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role === 'super') {
      const settings = await prisma.setting.findMany();
      return NextResponse.json(settings);
    }

    if (currentUser.role === 'admin') {
      const setting = await prisma.setting.findFirst({
        where: { adminId: currentUser.id },
      });

      return NextResponse.json({ slaTarget: setting?.slaTarget ?? 0 });
    }

    return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('GET /slaTarget error:', error);
    return NextResponse.json({ error: true, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slaTarget } = body;

    if (typeof slaTarget !== 'number') {
      return NextResponse.json({ error: true, message: 'Invalid slaTarget value' }, { status: 400 });
    }

    let adminId = currentUser.id;

    if (currentUser.role === 'admin' && body.adminId) {
      adminId = body.adminId;
    }

    let setting = await prisma.setting.findFirst({
      where: { adminId },
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: { slaTarget, adminId },
      });
    } else {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: { slaTarget },
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('POST /slaTarget error:', error);
    return NextResponse.json({ error: true, message: 'Internal server error' }, { status: 500 });
  }
}
