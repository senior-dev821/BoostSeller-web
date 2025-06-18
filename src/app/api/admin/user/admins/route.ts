import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const now = new Date();

    // Process each admin
    const updatedAdmins = await Promise.all(
      admins.map(async (admin) => {
        const endDate = new Date(admin.endDate);
        const isApproved = admin.user.isApproved;
        const diffInDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        let status = 'success';
				if(isApproved){
					if (endDate < now) {
						// Expired and still approved — update DB
						await prisma.user.update({
							where: { id: admin.userId },
							data: { isApproved: false },
						});
						status = 'error';
						admin.user.isApproved = false; // reflect change in returned data
					} else if (diffInDays < 5) {
						status = 'warning';
					}
				}
				else{
					status = 'error';
				}
        

        return {
          ...admin,
          status,
        };
      })
    );

    return NextResponse.json(updatedAdmins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
