import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { id, name, phoneNumber, email, isApproved } = await req.json();
        const hostess = await prisma.hostess.findUnique({
            where: {
                id: id,
            },
        });

        if (hostess) {

            await prisma.user.update({
                where: {
                    id: hostess.userId,
                },
                data: {
                    name,
                    phoneNumber,
                    email,
                    isApproved,
                },

        });

        } else {
            return new Response(JSON.stringify({ error: true, message: 'Not found hostess. Please try again and refresh.' }));
        }
        return new Response(JSON.stringify({ error: false, message: 'Edit Hostess Successful!'}), {
            status: 201,
        });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: true, message: 'Failed to edit hostess. Please try again.' }));
    }
}