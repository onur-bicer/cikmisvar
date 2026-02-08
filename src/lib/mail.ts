import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : { emails: { send: async () => console.warn("Resend API key missing") } } as any;

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`;

    try {
        const data = await resend.emails.send({
            from: "Çıkmış Var <onboarding@resend.dev>", // Replace with verified domain in production
            to: email,
            subject: "Emailinizi Doğrulayın",
            html: `<p>Merhaba,</p><p>Çıkmış Var hesabınızı doğrulamak için lütfen aşağıdaki linke tıklayın:</p><p><a href="${confirmLink}">Emailimi Doğrula</a></p>`,
        });
        console.log("Email sent:", data);
    } catch (error) {
        console.error("Email send error:", error);
    }
};
