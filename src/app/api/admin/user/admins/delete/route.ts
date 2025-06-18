import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        const deleteAdmin = await prisma.admin.delete({
            where: {
                id: id,
            },
        });

        if (deleteAdmin) {

            await prisma.user.delete({
                where: {
                    id: deleteAdmin.userId,
                },

        });

        } else {
            return new Response(JSON.stringify({ error: true, message: 'Not found Admin. Please try again and refresh.' }));
        }
        return new Response(JSON.stringify({ error: false, message: 'Delete Admin Successful!'}), {
            status: 201,
        });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: true, message: 'Failed to delete Admin. Please try again.' }));
    }
}