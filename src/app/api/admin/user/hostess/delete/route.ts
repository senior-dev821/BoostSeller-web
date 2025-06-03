import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        const deleteHostess = await prisma.hostess.delete({
            where: {
                id: id,
            },
        });

        if (deleteHostess) {

            await prisma.user.delete({
                where: {
                    id: deleteHostess.userId,
                },

        });

        } else {
            return new Response(JSON.stringify({ error: true, message: 'Not found hostess. Please try again and refresh.' }));
        }
        return new Response(JSON.stringify({ error: false, message: 'Delete Hostess Successful!'}), {
            status: 201,
        });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: true, message: 'Failed to delete hostess. Please try again.' }));
    }
}