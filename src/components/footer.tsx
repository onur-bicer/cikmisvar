import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6 text-sm text-muted-foreground mt-auto">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
                <p>&copy; 2026 Çıkmış Var. Tüm hakları saklıdır.</p>
                <div className="flex gap-6">
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Kullanım Koşulları
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Gizlilik Politikası
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Çerez Politikası
                    </Link>
                </div>
            </div>
        </footer>
    );
}
