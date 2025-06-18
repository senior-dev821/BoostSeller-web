import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { id, name, phoneNumber, email, isApproved, endDate } = await req.json();
				const end_Date = new Date(endDate || "")
        const updateAdmin = await prisma.admin.update({
            where: {
                id: id,
            },
            data: {
              endDate: end_Date,
            },
        });
 
        if (updateAdmin) {
            await prisma.user.update({
                where: {
                    id: updateAdmin.userId,
                },
                data: {
                    name,
                    phoneNumber,
                    email,
                    isApproved,
                },

        });

        } else {
            return new Response(JSON.stringify({ error: true, message: 'Not found Admin. Please try again and refresh.' }));
        }
        return new Response(JSON.stringify({ error: false, message: 'Edit Admin Successful!'}), {
            status: 201,
        });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: true, message: 'Failed to edit admin. Please try again.' }));
    }
}
