import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const registerSchema = z.object({
    username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir"),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, email, password } = registerSchema.parse(body);

        // Check if email exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { message: "Bu e-posta adresi zaten kullanımda" },
                { status: 400 }
            );
        }

        // Check if username exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "Bu kullanıcı adı zaten alınmış" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: "user",
                emailVerified: new Date(), // Auto-verify on registration
            },
        });

        // Generate verification token and send email
        // const verificationToken = await generateVerificationToken(email);
        // await sendVerificationEmail(email, verificationToken.token);

        return NextResponse.json({ success: "Registration successful!", user }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid data", errors: error.errors }, { status: 400 });
        }
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong", error: String(error) }, // Return detailed error for debugging
            { status: 500 }
        );
    }
}
