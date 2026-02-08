import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-9xl font-extrabold text-primary/20">404</h1>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Sayfa Bulunamadı</h2>
                <p className="mt-4 text-muted-foreground mb-8 text-lg">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>
                <Button asChild size="lg">
                    <Link href="/">Anasayfaya Dön</Link>
                </Button>
            </main>
            <Footer />
        </div>
    );
}
