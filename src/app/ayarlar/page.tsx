"use client";

import { useAuthStore } from "@/store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Shield, User, Monitor, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    const handleSave = () => {
        toast({
            title: "Ayarlar kaydedildi",
            description: "Değişiklikleriniz başarıyla uygulandı.",
        });
    };

    if (!mounted || !user) return null;

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
                        <p className="text-muted-foreground">
                            Hesap tercihlerinizi ve uygulama ayarlarınızı yönetin.
                        </p>
                    </div>

                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                            <TabsTrigger value="general">Genel</TabsTrigger>
                            <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
                            <TabsTrigger value="privacy">Gizlilik</TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Profil Bilgileri</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Görünür isminiz ve iletişim bilgileriniz.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Ad Soyad</Label>
                                        <Input id="name" defaultValue={user.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">E-posta</Label>
                                        <Input id="email" defaultValue={user.email} disabled />
                                        <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez.</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSave}>Değişiklikleri Kaydet</Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Monitor className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Görünüm</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Uygulama temasını özelleştirin.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Karanlık Mod</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Göz yormayan koyu temayı aktif et.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Settings */}
                        <TabsContent value="notifications" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Bildirim Tercihleri</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Hangi durumlarda bildirim almak istediğinizi seçin.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="new-uploads" className="flex flex-col space-y-1">
                                            <span>Yeni Yüklemeler</span>
                                            <span className="font-normal text-xs text-muted-foreground">Takip ettiğin derslere yeni dosya yüklendiğinde</span>
                                        </Label>
                                        <Switch id="new-uploads" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="comments" className="flex flex-col space-y-1">
                                            <span>Yorumlar</span>
                                            <span className="font-normal text-xs text-muted-foreground">Dosyalarına yorum yapıldığında</span>
                                        </Label>
                                        <Switch id="comments" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="updates" className="flex flex-col space-y-1">
                                            <span>Ürün Güncellemeleri</span>
                                            <span className="font-normal text-xs text-muted-foreground">Yeni özellikler ve güncellemeler hakkında</span>
                                        </Label>
                                        <Switch id="updates" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSave}>Tercihleri Kaydet</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Privacy Settings */}
                        <TabsContent value="privacy" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Gizlilik ve Güvenlik</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Hesap güvenliğinizi yönetin.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current-password">Mevcut Şifre</Label>
                                        <Input id="current-password" type="password" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-password">Yeni Şifre</Label>
                                        <Input id="new-password" type="password" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                                        <Input id="confirm-password" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSave}>Şifreyi Güncelle</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
}
