"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, useModalStore } from "@/store";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
    email: z.string().email("Geçerli bir email adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Ad Soyad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir email adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export function AuthModal() {
    const { authModalOpen, closeAuthModal } = useModalStore();
    const { loginMock } = useAuthStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
    });

    const onLogin = async (data: z.infer<typeof loginSchema>) => {
        setLoading(true);
        // Mock login delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        loginMock(data.email, "Demo User");
        setLoading(false);
        closeAuthModal();
        toast({
            title: "Giriş başarılı",
            description: "Hoş geldiniz!",
        });
    };

    const onRegister = async (data: z.infer<typeof registerSchema>) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        loginMock(data.email, data.name);
        setLoading(false);
        closeAuthModal();
        toast({
            title: "Kayıt başarılı",
            description: "Hesabınız oluşturuldu ve giriş yapıldı.",
        });
    };

    return (
        <Dialog open={authModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Hesap</DialogTitle>
                    <DialogDescription>
                        Dosya yüklemek ve özelliklerden yararlanmak için giriş yapın.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                        <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4 pt-4">
                        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" {...loginForm.register("email")} placeholder="ornek@email.com" />
                                {loginForm.formState.errors.email && (
                                    <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Şifre</Label>
                                <Input id="login-password" type="password" {...loginForm.register("password")} />
                                {loginForm.formState.errors.password && (
                                    <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                            </Button>
                        </form>
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Veya</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" type="button" disabled>
                            Google ile Giriş Yap (Demo)
                        </Button>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4 pt-4">
                        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="register-name">Ad Soyad</Label>
                                <Input id="register-name" {...registerForm.register("name")} placeholder="Adınız Soyadınız" />
                                {registerForm.formState.errors.name && (
                                    <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <Input id="register-email" type="email" {...registerForm.register("email")} placeholder="ornek@email.com" />
                                {registerForm.formState.errors.email && (
                                    <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-password">Şifre</Label>
                                <Input id="register-password" type="password" {...registerForm.register("password")} />
                                {registerForm.formState.errors.password && (
                                    <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
