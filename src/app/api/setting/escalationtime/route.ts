// app/api/setting/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // update path as needed

export async function GET() {
  const setting = await prisma.setting.findFirst();
  return NextResponse.json(setting ?? { assignPeriod: 0 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { assignPeriod } = body;

  let setting = await prisma.setting.findFirst();

  if (!setting) {
    setting = await prisma.setting.create({
      data: { assignPeriod },
    });
  } else {
    setting = await prisma.setting.update({
      where: { id: setting.id },
      data: { assignPeriod },
    });
  }

  return NextResponse.json(setting);
}
