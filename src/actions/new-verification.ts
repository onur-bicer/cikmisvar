"use server";

import { prisma } from "@/lib/prisma";

export const newVerification = async (token: string) => {
    const existingToken = await prisma.verificationToken.findFirst({
        where: { token },
    });

    if (!existingToken) {
        return { error: "Token bulunamadı!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Linkin süresi dolmuş!" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.identifier },
    });

    if (!existingUser) {
        return { error: "Email bulunamadı!" };
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.identifier,
        },
    });

    try {
        await prisma.verificationToken.delete({
            where: { token: existingToken.token }
        });
    } catch {
        // If delete fails (e.g. concurrent), try deleteMany as fallback or ignore
        await prisma.verificationToken.deleteMany({
            where: { token: existingToken.token }
        });
    }

    return { success: "Email başarıyla doğrulandı!" };
};
