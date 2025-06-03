import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        const deletePerformer = await prisma.performer.delete({
            where: {
                id: id,
            },
        });

        if (deletePerformer) {

            await prisma.user.delete({
                where: {
                    id: deletePerformer.userId,
                },

        });

        } else {
            return new Response(JSON.stringify({ error: true, message: 'Not found performer. Please try again and refresh.' }));
        }
        return new Response(JSON.stringify({ error: false, message: 'Delete Performer Successful!'}), {
            status: 201,
        });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: true, message: 'Failed to delete performer. Please try again.' }));
    }
}