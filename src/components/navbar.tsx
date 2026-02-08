"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, User as UserIcon, LogOut, Upload, Settings, User } from "lucide-react";
import { useTheme } from "next-themes";
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

export function Navbar() {
    const { setTheme, theme } = useTheme();
    const { data: session } = useSession();
    const { openAuthModal, openUploadModal } = useModalStore();
    const pathname = usePathname();
    const router = useRouter();

    const user = session?.user;

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-200">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="font-bold text-xl tracking-tight">
                        Çıkmış Var
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/icerikler?sort=popular"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/icerikler' && pathname.includes('popular') ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            Popüler
                        </Link>
                        <Link
                            href="/icerikler?sort=recent"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/icerikler' && pathname.includes('recent') ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            Son Eklenenler
                        </Link>
                        <Link
                            href="/icerikler"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/icerikler' ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            Tüm İçerikler
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Temayı değiştir"
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Tema Değiştir</span>
                    </Button>

                    {user ? (
                        <>
                            <Button onClick={openUploadModal} variant="default" size="sm" className="hidden sm:flex">
                                <Upload className="mr-2 h-4 w-4" />
                                Yükle
                            </Button>
                            <div className="ml-4 pl-4 border-l flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                            <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-shadow hover:ring-primary/20">
                                                <AvatarImage src={(user as any).avatar || user.image || undefined} alt={user.name || "User"} />
                                                <AvatarFallback className="text-primary font-medium bg-primary/5">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profil" className="flex w-full items-center">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Profil</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        {(user as any).role === "admin" && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="flex w-full items-center">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    <span>Yönetim Paneli</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link href="/ayarlar" className="flex w-full items-center">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Ayarlar</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Çıkış Yap</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    ) : (
                        <Button onClick={openAuthModal} variant="default" size="sm">
                            <UserIcon className="mr-2 h-4 w-4" />
                            Giriş
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
