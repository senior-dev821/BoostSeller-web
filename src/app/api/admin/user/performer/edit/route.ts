import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { id, name, phoneNumber, email, isApproved, isAvailable } = await req.json();
        const updatePerformer = await prisma.performer.update({
            where: {
                id: id,
            },
            data: {
              available: isAvailable
            },
        });

        if (updatePerformer) {

            await prisma.user.update({
                where: {
                    id: updatePerformer.userId,
                },
                data: {
                    name,
                    phoneNumber,
                    email,
                    isApproved,
                },

        });

        } else {
            return new Response(JSON.stringify({ error: true, message: 'Not found performer. Please try again and refresh.' }));
        }
        return new Response(JSON.stringify({ error: false, message: 'Edit Performer Successful!'}), {
            status: 201,
        });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: true, message: 'Failed to edit performer. Please try again.' }));
    }
}
