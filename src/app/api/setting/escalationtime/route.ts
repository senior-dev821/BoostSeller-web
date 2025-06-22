// app/api/setting/route.ts
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
        where: {
          adminId: currentUser.id,
        },
      });

      return NextResponse.json({ assignPeriod: setting?.assignPeriod ?? 0 });
    }

    return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching setting:', error);
    return NextResponse.json({ error: true, message: 'Internal server error' }, { status: 500 });
  }
}


// export async function POST(req: Request) {
//   const body = await req.json();
//   const { assignPeriod, adminId } = body;

//   let setting = await prisma.setting.findFirst();

//   if (!setting) {
//     setting = await prisma.setting.create({
//       data: { 
//         assignPeriod: assignPeriod,
//         adminId: adminId,
//        },
//     });
//   } else {
//     setting = await prisma.setting.update({
//       where: { id: setting.id },
//       data: { assignPeriod },
//     });
//   }

//   return NextResponse.json(setting);
// }

export async function POST(req: Request) {
  try {
    const currentUser = await getUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'super') {
      return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { assignPeriod } = body;

    let setting = await prisma.setting.findFirst({
      where: { adminId: currentUser.id },
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          assignPeriod,
          adminId: currentUser.id,
        },
      });
    } else {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: { assignPeriod },
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: true, message: 'Internal server error' }, { status: 500 });
  }
}