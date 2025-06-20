// app/api/setting/performerlimitation/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // update path as needed

export async function GET() {
  const setting = await prisma.setting.findFirst();
  return NextResponse.json(setting ?? { performLimit: 0 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { performLimit, adminId } = body;

  let setting = await prisma.setting.findFirst();

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
}
