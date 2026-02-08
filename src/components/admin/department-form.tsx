
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Bölüm adı en az 2 karakter olmalıdır.",
    }),
    universityId: z.string().min(1, {
        message: "Lütfen bir üniversite seçin.",
    }),
});

interface DepartmentFormProps {
    initialData?: {
        id: string;
        name: string;
        universityId: string;
    } | null;
    onSuccess: () => void;
}

export function DepartmentForm({ initialData, onSuccess }: DepartmentFormProps) {
    const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            universityId: initialData?.universityId || "",
        },
    });

    useEffect(() => {
        // Fetch universities for dropdown
        fetch("/api/admin/universities")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setUniversities(data);
            })
            .catch((err) => console.error(err));
    }, []);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const url = initialData
                ? `/api/admin/departments/${initialData.id}`
                : "/api/admin/departments";
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
                title: initialData ? "Bölüm güncellendi" : "Bölüm oluşturuldu",
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
                    name="universityId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Üniversite</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Üniversite seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {universities.map((uni) => (
                                        <SelectItem key={uni.id} value={uni.id}>
                                            {uni.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bölüm Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Bilgisayar Mühendisliği" {...field} />
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
