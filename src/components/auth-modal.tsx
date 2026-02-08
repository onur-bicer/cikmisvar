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
import { useModalStore } from "@/store";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
    email: z.string().email("Geçerli bir email adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Ad Soyad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir email adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z"
            fill="#EA4335"
        />
        <path d="M1 1h22v22H1z" fill="none" />
    </svg>
);

export function AuthModal() {
    const { authModalOpen, closeAuthModal } = useModalStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        }
    });

    const onLogin = async (data: z.infer<typeof loginSchema>) => {
        setLoading(true);
        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    title: "Giriş başarısız",
                    description: "Email veya şifre hatalı.",
                    variant: "destructive",
                });
            } else {
                closeAuthModal();
                toast({
                    title: "Giriş başarılı",
                    description: "Hoş geldiniz!",
                });
                window.location.reload();
            }
        } catch {
            toast({
                title: "Hata",
                description: "Giriş yapılırken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const onRegister = async (data: z.infer<typeof registerSchema>) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                toast({
                    title: "Kayıt başarısız",
                    description: errorData.message || "Bu email zaten kullanılıyor olabilir.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    title: "Kayıt başarılı",
                    description: "Hesabınız oluşturuldu. Lütfen giriş yapın.",
                });
            } else {
                closeAuthModal();
                toast({
                    title: "Kayıt başarılı",
                    description: "Hesabınız oluşturuldu ve giriş yapıldı.",
                });
                window.location.reload();
            }
        } catch {
            toast({
                title: "Hata",
                description: "Kayıt olurken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const onGoogleAuth = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/" });
        } finally {
            setLoading(false);
        }
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
                        <Button variant="outline" className="w-full h-11 border-border/50 hover:bg-muted/50 transition-all duration-200" type="button" onClick={onGoogleAuth} disabled={loading}>
                            <GoogleIcon />
                            Google ile Giriş Yap
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
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Veya</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full h-11 border-border/50 hover:bg-muted/50 transition-all duration-200" type="button" onClick={onGoogleAuth} disabled={loading}>
                            <GoogleIcon />
                            Google ile Kaydol
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
