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

      return NextResponse.json({ performLimit: setting?.performLimit ?? 0 });
    }

    return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('GET /performerlimitation error:', error);
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
    const { performLimit } = body;

    if (typeof performLimit !== 'number') {
      return NextResponse.json({ error: true, message: 'Invalid performLimit value' }, { status: 400 });
    }

    let adminId = currentUser.id;

    if (currentUser.role === 'admin' && body.adminId) {
      adminId = body.adminId; // allow specifying adminId in super mode
    }

    let setting = await prisma.setting.findFirst({
      where: { adminId },
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: { performLimit, adminId },
      });
    } else {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: { performLimit },
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('POST /performerlimitation error:', error);
    return NextResponse.json({ error: true, message: 'Internal server error' }, { status: 500 });
  }
}
