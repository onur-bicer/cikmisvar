"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalStore } from "@/store";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

const uploadSchema = z.object({
    universityId: z.string().min(1, "Üniversite seçmelisiniz"),
    departmentId: z.string().min(1, "Bölüm seçmelisiniz"),
    courseId: z.string().min(1, "Ders seçmelisiniz"),
    year: z.string().regex(/^\d{4}$/, "Geçerli bir yıl girin (Örn: 2024)"),
    examType: z.string().min(1, "Sınav türü seçmelisiniz"),
});

interface University {
    id: string;
    name: string;
    city: string;
}

interface Department {
    id: string;
    name: string;
}

interface Course {
    id: string;
    name: string;
}

export function UploadModal() {
    const { uploadModalOpen, closeUploadModal } = useModalStore();
    const { toast } = useToast();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Data from API
    const [universities, setUniversities] = useState<University[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
    });

    const selectedUniId = watch("universityId");
    const selectedDepId = watch("departmentId");

    // Fetch universities on mount
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const res = await fetch("/api/universities");
                const data = await res.json();
                setUniversities(data);
            } catch (error) {
                console.error("Failed to fetch universities:", error);
            }
        };
        fetchUniversities();
    }, []);

    // Fetch departments when university changes
    useEffect(() => {
        if (selectedUniId) {
            setLoadingData(true);
            setDepartments([]);
            setCourses([]);
            setValue("departmentId", "");
            setValue("courseId", "");

            fetch(`/api/universities?universityId=${selectedUniId}`)
                .then(res => res.json())
                .then(data => {
                    setDepartments(data);
                    setLoadingData(false);
                })
                .catch(() => setLoadingData(false));
        }
    }, [selectedUniId, setValue]);

    // Fetch courses when department changes
    useEffect(() => {
        if (selectedDepId) {
            setLoadingData(true);
            setCourses([]);
            setValue("courseId", "");

            fetch(`/api/universities?departmentId=${selectedDepId}`)
                .then(res => res.json())
                .then(data => {
                    setCourses(data);
                    setLoadingData(false);
                })
                .catch(() => setLoadingData(false));
        }
    }, [selectedDepId, setValue]);

    const onSubmit = async (data: z.infer<typeof uploadSchema>) => {
        if (!session?.user) {
            toast({
                title: "Giriş yapmalısınız",
                description: "Dosya yüklemek için giriş yapmanız gerekiyor.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedFile) {
            toast({
                title: "Dosya seçmelisiniz",
                description: "Lütfen bir PDF dosyası seçin.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append("pdf", selectedFile);
            formData.append("universityId", data.universityId);
            formData.append("departmentId", data.departmentId);
            formData.append("courseId", data.courseId);
            formData.append("year", data.year);
            formData.append("examType", data.examType);

            const response = await fetch("/api/files", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            setLoading(false);
            closeUploadModal();
            reset();
            setSelectedFile(null);
            toast({
                title: "Dosya yüklendi",
                description: "Dosyanız başarıyla sisteme eklendi.",
            });
        } catch (error) {
            setLoading(false);
            toast({
                title: "Hata",
                description: "Dosya yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={uploadModalOpen} onOpenChange={(open) => !open && closeUploadModal()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Dosya Yükle</DialogTitle>
                    <DialogDescription>
                        Diğer öğrencilere yardımcı olmak için elindeki çıkmış soruları paylaş.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2 col-span-1 sm:col-span-2">
                            <Label>Üniversite</Label>
                            <Controller
                                control={control}
                                name="universityId"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Üniversite seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universities.map((u) => (
                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.universityId && <p className="text-xs text-destructive">{errors.universityId.message}</p>}
                        </div>

                        <div className="space-y-2 col-span-1 sm:col-span-2">
                            <Label>Bölüm</Label>
                            <Controller
                                control={control}
                                name="departmentId"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!selectedUniId || loadingData}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingData ? "Yükleniyor..." : "Bölüm seçin"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
                        </div>

                        <div className="space-y-2 col-span-1 sm:col-span-2">
                            <Label>Ders</Label>
                            <Controller
                                control={control}
                                name="courseId"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDepId || loadingData}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingData ? "Yükleniyor..." : "Ders seçin"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.courseId && <p className="text-xs text-destructive">{errors.courseId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Yıl</Label>
                            <Input {...control.register("year")} placeholder="2024" type="number" min="1990" max="2100" />
                            {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Sınav Türü</Label>
                            <Controller
                                control={control}
                                name="examType"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tür seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MIDTERM">Vize</SelectItem>
                                            <SelectItem value="FINAL">Final</SelectItem>
                                            <SelectItem value="QUIZ">Quiz</SelectItem>
                                            <SelectItem value="MAKEUP">Bütünleme</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.examType && <p className="text-xs text-destructive">{errors.examType.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>PDF Dosyası</Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            className="cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedFile(file);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">Sadece PDF dosyaları kabul edilir. Maksimum 25MB.</p>
                    </div>

                    <DialogDescription className="text-xs pt-2">
                        Yüklediğiniz dosyalar anında yayınlanacaktır.
                    </DialogDescription>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Yükleniyor..." : "Dosyayı Gönder"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
