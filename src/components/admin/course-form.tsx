
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
        message: "Ders adı en az 2 karakter olmalıdır.",
    }),
    departmentId: z.string().min(1, {
        message: "Lütfen bir bölüm seçin.",
    }),
});

interface CourseFormProps {
    initialData?: {
        id: string;
        name: string;
        departmentId: string;
    } | null;
    onSuccess: () => void;
}

export function CourseForm({ initialData, onSuccess }: CourseFormProps) {
    const [departments, setDepartments] = useState<{ id: string; name: string; university: { name: string } }[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            departmentId: initialData?.departmentId || "",
        },
    });

    useEffect(() => {
        fetch("/api/admin/departments")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setDepartments(data);
            })
            .catch((err) => console.error(err));
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const url = initialData
                ? `/api/admin/courses/${initialData.id}`
                : "/api/admin/courses";
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
                title: initialData ? "Ders güncellendi" : "Ders oluşturuldu",
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

    // Group departments by University for better UX in Select? 
    // Shadcn Select doesn't support groups natively easily without custom structure, 
    // but displaying "University Name - Department Name" is a good alternative.

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bölüm</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Bölüm seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[300px]">
                                    {departments.map((dep) => (
                                        <SelectItem key={dep.id} value={dep.id}>
                                            {dep.university.name} - {dep.name}
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
                            <FormLabel>Ders Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Algoritma ve Programlama I" {...field} />
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
