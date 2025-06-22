import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

type LeadInputField = {
  id?: number;
  label: string;
  type: string;
  sequence: number;
  items?: string[];
  required: boolean;
  adminId?: number;
};

export async function POST(req: Request) {
  try {
    const currentUser = await getUserFromToken();
    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const fields = body as LeadInputField[];

    const operations = fields.map(async (field) => {
      const { id, label, type, sequence, items = [], required } = field;

      const adminId = currentUser.role === 'admin' ? currentUser.id : field.adminId ?? currentUser.id;

      if (id) {
        const existing = await prisma.leadInputSetting.findUnique({ where: { id } });

        if (!existing) {
          console.warn(`Field with id ${id} not found. Skipping update.`);
          return null;
        }

        // Check ownership for admin
        if (currentUser.role === 'admin' && existing.adminId !== currentUser.id) {
          console.warn(`Admin ${currentUser.id} not allowed to update field ${id}`);
          return null;
        }

        if (existing.label !== label) {
          const duplicate = await prisma.leadInputSetting.findUnique({ where: { label } });
          if (duplicate) {
            console.warn(`Duplicate label "${label}" found. Skipping update for id ${id}.`);
            return null;
          }
        }

        return await prisma.leadInputSetting.update({
          where: { id },
          data: { label, type, sequence, required, items },
        });
      } else {
        const duplicate = await prisma.leadInputSetting.findUnique({ where: { label } });

        if (duplicate) {
          console.warn(`Label "${label}" already exists. Skipping create.`);
          return null;
        }

        return await prisma.leadInputSetting.create({
          data: { label, type, sequence, required, items, adminId },
        });
      }
    });

    const results = await Promise.all(operations);

    return NextResponse.json({
      error: false,
      message: 'Fields saved',
      updated: results.filter(Boolean),
    });
  } catch (err) {
    console.error('fetching error:', err);
    return NextResponse.json(
      { error: true, message: 'Failed to create/update field settings. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentUser = await getUserFromToken();
    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    let whereCondition = {};

    if (currentUser.role === 'admin') {
      whereCondition = { adminId: currentUser.id };
    }

    const fields = await prisma.leadInputSetting.findMany({
      where: whereCondition,
      orderBy: {
        sequence: 'asc',
      },
    });

    if (fields.length === 0) {
      return NextResponse.json({
        error: true,
        empty: true,
        message: 'Not found LeadAdditional Fields.',
      });
    }

    return NextResponse.json({ error: false, fields });
  } catch (error) {
    console.error('fetching error:', error);
    return NextResponse.json({
      error: true,
      message: 'Failed to fetch data. \n Please try again.',
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getUserFromToken();
    if (!currentUser) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const field = await prisma.leadInputSetting.findUnique({
      where: { id: Number(id) },
    });

    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    if (currentUser.role === 'admin' && field.adminId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.leadInputSetting.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Field deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete field' }, { status: 500 });
  }
}
