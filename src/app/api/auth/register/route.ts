import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
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
