"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, X, ChevronRight, FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthModal } from "@/components/auth-modal";
import { UploadModal } from "@/components/upload-modal";
import { PreviewModal } from "@/components/preview-modal";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore, useModalStore, useSearchStore, useFileStore } from "@/store";
import { universities } from "@/data/universities";
import { formatFileSize, formatExamType } from "@/lib/utils";

export default function ContentsPage() {
    const searchParams = useSearchParams();
    const {
        query, setQuery,
        selectedUniversityId, setUniversity,
        selectedDepartmentId, setDepartment,
        selectedCourseId, setCourse,
        year, setYear,
        examType, setExamType,
        resetFilters
    } = useSearchStore();

    const { files } = useFileStore();

    const { openPreviewModal } = useModalStore();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize from URL params if present
    useEffect(() => {
        setMounted(true);
        const initialQuery = searchParams.get("q");
        if (initialQuery) {
            setQuery(initialQuery);
        }
    }, [searchParams, setQuery]);

    // Simulate loading delay for realistic feel
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [query, selectedUniversityId, selectedDepartmentId, selectedCourseId, year, examType, files]);

    // Derived state for dropdowns
    const selectedUni = universities.find(u => u.id === selectedUniversityId);
    const departments = selectedUni?.departments || [];
    const selectedDep = departments.find(d => d.id === selectedDepartmentId);
    const courses = selectedDep?.courses || [];

    // Filter and Sort logic
    const filteredFiles = useMemo(() => {
        const sortParam = searchParams.get("sort");

        let result = files.filter(file => {
            const matchesQuery = query
                ? file.courseName.toLowerCase().includes(query.toLowerCase()) ||
                file.universityName.toLowerCase().includes(query.toLowerCase())
                : true;

            const matchesUni = selectedUniversityId ? file.universityId === selectedUniversityId : true;
            const matchesDepartment = selectedDepartmentId ? file.departmentId === selectedDepartmentId : true;
            const matchesCourse = selectedCourseId ? file.courseId === selectedCourseId : true;
            const matchesYear = year ? file.year.toString() === year : true;
            const matchesType = examType ? file.examType === examType : true;

            return matchesQuery && matchesUni && matchesDepartment && matchesCourse && matchesYear && matchesType;
        });

        // Sorting
        if (sortParam === "popular") {
            result.sort((a, b) => b.viewCount - a.viewCount);
        } else if (sortParam === "recent") {
            result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        } else {
            // Default to recent
            result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        }

        return result;
    }, [query, selectedUniversityId, selectedDepartmentId, selectedCourseId, year, examType, searchParams, files]);

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto py-8">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Main Content Area */}
                    <div className="flex-1">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">İçerikler</h1>
                            <div className="text-sm text-muted-foreground">
                                {filteredFiles.length} dosya bulundu
                            </div>
                        </div>

                        {/* Mobile Filter Toggle (Visible only on small screens) */}
                        <div className="lg:hidden mb-4">
                            <Card className="p-4">
                                {/* Simplified filters for mobile */}
                                <Input
                                    placeholder="Ara..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="mb-4"
                                />
                                {/* ... other mobile filters ... */}
                            </Card>
                        </div>

                        {/* Desktop Filters Bar */}
                        <Card className="mb-8 p-4 hidden lg:block border-primary/10 shadow-sm bg-muted/40">
                            <div className="flex flex-col gap-6">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Ders veya üniversite ara..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="bg-background pl-10 h-11 w-full text-base shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
                                    <Select value={selectedUniversityId} onValueChange={setUniversity}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Üniversite" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universities.map(u => (
                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedDepartmentId} onValueChange={setDepartment} disabled={!selectedUniversityId}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Bölüm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedCourseId} onValueChange={setCourse} disabled={!selectedDepartmentId}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Ders" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="number"
                                        placeholder="Yıl (2024)"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="bg-background"
                                    />

                                    <Select value={examType} onValueChange={setExamType}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Sınav Türü" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MIDTERM">Vize</SelectItem>
                                            <SelectItem value="FINAL">Final</SelectItem>
                                            <SelectItem value="QUIZ">Quiz</SelectItem>
                                            <SelectItem value="MAKEUP">Bütünleme</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end">
                                    <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground hover:text-foreground px-0 hover:bg-transparent">
                                        <X className="mr-2 h-4 w-4" /> Filtreleri Temizle
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Results Grid */}
                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="flex flex-col p-6 h-[200px]">
                                        <Skeleton className="h-6 w-3/4 mb-4" />
                                        <Skeleton className="h-4 w-1/2 mb-2" />
                                        <Skeleton className="h-4 w-1/3 mb-auto" />
                                        <div className="flex gap-2 mt-4">
                                            <Skeleton className="h-9 w-full rounded-md" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredFiles.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredFiles.map((file) => (
                                    <Card key={file.id} className="flex flex-col p-5 transition-all hover:border-primary/40 hover:shadow-md group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground border px-2 py-0.5 rounded-full">
                                                {file.year}
                                            </span>
                                        </div>

                                        <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                            {file.courseName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
                                            {file.universityName}
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {formatExamType(file.examType)} • {formatFileSize(file.fileSize)}
                                        </p>

                                        <div className="mt-auto pt-4 flex gap-2 border-t border-border/50">
                                            <Button
                                                onClick={() => openPreviewModal(file.id)}
                                                variant="default"
                                                size="sm"
                                                className="w-full bg-primary/90 hover:bg-primary shadow-sm"
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> Önizle
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="rounded-full bg-muted p-8 mb-4">
                                    <Filter className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">Sonuç bulunamadı</h3>
                                <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                    Arama kriterlerinize uygun dosya bulunamadı. Filtreleri temizleyip tekrar deneyin.
                                </p>
                                <Button onClick={resetFilters} variant="outline">
                                    Filtreleri Temizle
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Preview Panel (Desktop Only) */}
                    <div className="hidden xl:block w-[350px] flex-shrink-0">
                        <div className="sticky top-24">
                            <Card className="p-6 border-dashed border-2 flex flex-col items-center justify-center text-center min-h-[400px] bg-muted/20">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Eye className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium mb-2">Hızlı Önizleme</h3>
                                <p className="text-sm text-muted-foreground max-w-[200px]">
                                    Detaylı incelemek için listeden bir dosyanın &quot;Önizle&quot; butonuna tıklayın.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <AuthModal />
            <UploadModal />
            <PreviewModal />
            <Toaster />
        </div>
    );
}
