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
import { useSession } from "next-auth/react";
import { useModalStore, useSearchStore, useFileStore } from "@/store";
import { formatFileSize, formatExamType } from "@/lib/utils";
import { SearchableSelect } from "@/components/searchable-select";

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

export default function ContentsPage() {
    const { data: session } = useSession();
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

    const { files, loading: filesLoading, fetchFiles } = useFileStore();
    const { openPreviewModal } = useModalStore();
    const [mounted, setMounted] = useState(false);

    // Data from API
    const [universities, setUniversities] = useState<University[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingData, setLoadingData] = useState(false);

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

    // Fetch departments
    useEffect(() => {
        setLoadingData(true);
        const url = selectedUniversityId
            ? `/api/departments?universityId=${selectedUniversityId}`
            : "/api/departments";

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setDepartments(data);
                setLoadingData(false);
            })
            .catch(() => setLoadingData(false));
    }, [selectedUniversityId]);

    // Fetch courses
    useEffect(() => {
        setLoadingData(true);
        const url = selectedDepartmentId
            ? `/api/courses?departmentId=${selectedDepartmentId}`
            : "/api/courses";

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setCourses(data);
                setLoadingData(false);
            })
            .catch(() => setLoadingData(false));
    }, [selectedDepartmentId]);

    // Fetch files when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchFiles({
                q: query,
                universityId: selectedUniversityId,
                departmentId: selectedDepartmentId,
                courseId: selectedCourseId,
                year: year,
                examType: examType,
                sort: searchParams.get("sort") || "recent"
            });
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [query, selectedUniversityId, selectedDepartmentId, selectedCourseId, year, examType, searchParams, fetchFiles]);

    // Initialize from URL params if present (and fetch initial)
    useEffect(() => {
        setMounted(true);
        const initialQuery = searchParams.get("q");
        if (initialQuery) {
            setQuery(initialQuery);
        }
        // Initial fetch is handled by the filter effect above effectively, 
        // but we might want to ensure it runs once if filters are empty.
        // The dependency array above includes all filters, so it will run on mount.
        // However, we need to be careful about double fetching.
        // Let's rely on the effect above.
    }, [searchParams, setQuery]);

    // Use files directly from store (no client-side filtering)
    const filteredFiles = files;

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
                                    <SearchableSelect
                                        options={universities.map(u => ({ value: u.id, label: u.name }))}
                                        value={selectedUniversityId}
                                        onValueChange={(val) => {
                                            setUniversity(val);
                                            // Optional: reset child filters if they are not allowed to stay
                                            // setDepartment("");
                                            // setCourse("");
                                        }}
                                        placeholder="Üniversite"
                                    />

                                    <SearchableSelect
                                        options={departments.map(d => ({ value: d.id, label: d.name }))}
                                        value={selectedDepartmentId}
                                        onValueChange={(val) => {
                                            setDepartment(val);
                                            // setCourse("");
                                        }}
                                        placeholder="Bölüm"
                                        disabled={loadingData}
                                    />

                                    <SearchableSelect
                                        options={courses.map(c => ({ value: c.id, label: c.name }))}
                                        value={selectedCourseId}
                                        onValueChange={setCourse}
                                        placeholder="Ders"
                                        disabled={loadingData}
                                    />

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
                        {filesLoading ? (
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
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                                                className="flex-1 bg-primary/90 hover:bg-primary shadow-sm"
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> Önizle
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={`px-2.5 ${file.isFavorite ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (session?.user) {
                                                        useFileStore.getState().toggleFavorite(file.id);
                                                    } else {
                                                        const { openAuthModal } = useModalStore.getState();
                                                        openAuthModal();
                                                    }
                                                }}
                                            >
                                                <svg
                                                    className={`h-4 w-4 ${file.isFavorite ? "fill-current" : ""}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                </svg>
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
