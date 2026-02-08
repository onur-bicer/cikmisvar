export const metadata = {
    title: "Çıkmış Var | Geçmiş Sınav Arşivi",
    description: "Üniversite çıkmış sorularına hızlıca ulaş.",
};

import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body className="font-sans antialiased min-h-screen bg-background text-foreground">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                    storageKey="theme"
                    disableTransitionOnChange
                >
                    <div className="theme-gradient" />
                    {children}
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
