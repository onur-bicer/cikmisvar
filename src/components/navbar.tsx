"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User as UserIcon, LogOut, Upload, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store";
import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const { data: session } = useSession();
    const { openAuthModal, openUploadModal } = useModalStore();
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const user = session?.user;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
    };

    const navLinks = [
        { href: "/", label: "Ana Sayfa" },
        { href: "/icerikler", label: "Sınav Arşivi" },
        { href: "/universiteler", label: "Üniversiteler" }, // Assuming this route exists or will exist, otherwise keep generic
        { href: "/hakkimizda", label: "Hakkımızda" }, // Placeholder
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b" : "bg-white border-b border-transparent"
                }`}
        >
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-blue-700 transition-colors">
                        S
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors">
                        SınavHub
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === link.href ? "text-blue-600" : "text-gray-600"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Side Buttons */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Button
                                onClick={openUploadModal}
                                className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Yükle
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-gray-100">
                                            <AvatarImage src={(user as any).avatar || user.image || undefined} alt={user.name || "User"} />
                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profil" className="cursor-pointer">
                                            <UserIcon className="mr-2 h-4 w-4" /> Profil
                                        </Link>
                                    </DropdownMenuItem>
                                    {(user as any).role === "admin" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="cursor-pointer">
                                                <LayoutDashboard className="mr-2 h-4 w-4" /> Yönetim Paneli
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/ayarlar" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" /> Ayarlar
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link href="#" onClick={(e) => { e.preventDefault(); openAuthModal(); }} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                Giriş Yap
                            </Link>
                            <Button
                                onClick={openAuthModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                Kayıt Ol
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`py-2 text-sm font-medium ${pathname === link.href ? "text-blue-600" : "text-gray-600"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && (
                                <div className="flex flex-col gap-3 mt-2 pb-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                                    >
                                        Giriş Yap
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                                    >
                                        Kayıt Ol
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
