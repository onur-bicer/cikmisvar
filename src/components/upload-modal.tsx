"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalStore, useFileStore } from "@/store";
import { useToast } from "@/components/ui/use-toast";
import { universities } from "@/data/universities";

const uploadSchema = z.object({
    universityId: z.string().min(1, "Üniversite seçmelisiniz"),
    departmentId: z.string().min(1, "Bölüm seçmelisiniz"),
    courseId: z.string().min(1, "Ders seçmelisiniz"),
    year: z.string().regex(/^\d{4}$/, "Geçerli bir yıl girin (Örn: 2024)"),
    examType: z.string().min(1, "Sınav türü seçmelisiniz"),
});

export function UploadModal() {
    const { uploadModalOpen, closeUploadModal } = useModalStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
    });

    const selectedUniId = watch("universityId");
    const selectedDepId = watch("departmentId");

    const selectedUni = universities.find(u => u.id === selectedUniId);
    const departments = selectedUni?.departments || [];

    const selectedDep = departments.find(d => d.id === selectedDepId);
    const courses = selectedDep?.courses || [];

    const { addFile } = useFileStore();

    const onSubmit = async (data: z.infer<typeof uploadSchema>) => {
        setLoading(true);
        // Mock upload delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Create blob URL for preview
        let previewUrl = undefined;
        if (selectedFile) {
            previewUrl = URL.createObjectURL(selectedFile);
        }

        const newFile: any = {
            id: `file-${Date.now()}`,
            universityId: data.universityId,
            universityName: selectedUni?.name || "",
            departmentId: data.departmentId,
            departmentName: selectedDep?.name || "",
            courseId: data.courseId,
            courseName: courses.find(c => c.id === data.courseId)?.name || "",
            year: parseInt(data.year),
            examType: data.examType as any,
            fileSize: selectedFile ? selectedFile.size : Math.floor(Math.random() * 5000000) + 100000,
            uploadedAt: new Date().toISOString(),
            viewCount: 0,
            previewUrl: previewUrl
        };

        addFile(newFile);

        setLoading(false);
        closeUploadModal();
        reset();
        setSelectedFile(null); // Reset file selection
        toast({
            title: "Dosya yüklendi",
            description: "Dosyanız başarıyla sisteme eklendi.",
        });
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
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue("departmentId", "");
                                            setValue("courseId", "");
                                        }}
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
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue("courseId", "");
                                        }}
                                        value={field.value}
                                        disabled={!selectedUniId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Bölüm seçin" />
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
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDepId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Ders seçin" />
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
