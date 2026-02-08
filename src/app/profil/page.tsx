"use client";

import { useAuthStore } from "@/store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Heart, Clock, Settings, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-card border shadow-sm">
                        <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center md:text-left flex-1 space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                                    Aktif Öğrenci
                                </span>
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400">
                                    Pro Üye
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => router.push("/ayarlar")}>
                                <Settings className="mr-2 h-4 w-4" />
                                Ayarlar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => { logout(); router.push("/"); }}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Çıkış
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Toplam Yükleme</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">+2 geçen ay</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Favoriler</CardTitle>
                                <Heart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">4</div>
                                <p className="text-xs text-muted-foreground">Kayıtlı dersler</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Görüntüleme</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">145</div>
                                <p className="text-xs text-muted-foreground">Toplam indirme</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content Tabs */}
                    <Tabs defaultValue="uploads" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="uploads">Yüklemelerim</TabsTrigger>
                            <TabsTrigger value="favorites">Favorilerim</TabsTrigger>
                            <TabsTrigger value="history">Geçmiş</TabsTrigger>
                        </TabsList>

                        <TabsContent value="uploads" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Yüklemelerim</CardTitle>
                                    <CardDescription>
                                        Sisteme yüklediğin tüm ders notları ve sınav soruları.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-lg m-6">
                                    <div className="text-center">
                                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        <p>Henüz yüklenmiş dosya yok</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="favorites">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Favorilerim</CardTitle>
                                    <CardDescription>
                                        Hızlı erişim için kaydettiğin dersler.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-lg m-6">
                                    <div className="text-center">
                                        <Heart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        <p>Favori listesi boş</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
}
