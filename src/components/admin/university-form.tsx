
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Üniversite adı en az 2 karakter olmalıdır.",
    }),
    city: z.string().optional(),
});

interface UniversityFormProps {
    initialData?: {
        id: string;
        name: string;
        city?: string | null;
    } | null;
    onSuccess: () => void;
}

export function UniversityForm({ initialData, onSuccess }: UniversityFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            city: initialData?.city || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const url = initialData
                ? `/api/admin/universities/${initialData.id}`
                : "/api/admin/universities";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Something went wrong");
            }

            toast({
                title: initialData ? "Üniversite güncellendi" : "Üniversite oluşturuldu",
                description: "İşlem başarıyla tamamlandı.",
            });
            onSuccess();
            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Üniversite Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Karadeniz Teknik Üniversitesi" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Şehir (Opsiyonel)</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Trabzon" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
                </Button>
            </form>
        </Form>
    );
}
