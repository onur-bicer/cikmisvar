
import { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, GraduationCap, Building2, BookOpen, FileText, Settings, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Admin Paneli | Çıkmış Var",
    description: "Yönetim Paneli",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-muted/40 font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-background border-r flex flex-col">
                <div className="p-6 border-b flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Yönetim Paneli</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <LayoutDashboard className="h-4 w-4" />
                            Genel Bakış
                        </Button>
                    </Link>
                    <Link href="/admin/universities">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <GraduationCap className="h-4 w-4" />
                            Üniversiteler
                        </Button>
                    </Link>
                    <Link href="/admin/departments">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <Building2 className="h-4 w-4" />
                            Bölümler
                        </Button>
                    </Link>
                    <Link href="/admin/courses">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <BookOpen className="h-4 w-4" />
                            Dersler
                        </Button>
                    </Link>
                    <Link href="/admin/files">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <FileText className="h-4 w-4" />
                            Dosyalar
                        </Button>
                    </Link>
                    <Link href="/admin/reports">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <AlertTriangle className="h-4 w-4" />
                            Raporlar
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <Settings className="h-4 w-4" />
                            Kullanıcılar
                        </Button>
                    </Link>
                    <div className="pt-4 mt-4 border-t">
                        <Link href="/">
                            <Button variant="outline" className="w-full justify-start gap-3">
                                <LogOut className="h-4 w-4" />
                                Siteye Dön
                            </Button>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
