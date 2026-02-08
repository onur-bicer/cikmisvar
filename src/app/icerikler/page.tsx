"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, X, FileText, Eye, Download, ChevronDown, ChevronUp } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
    const { openPreviewModal, openAuthModal } = useModalStore();
    const [mounted, setMounted] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false); // Default closed for cleaner look

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
    }, [searchParams, setQuery]);

    // Use files directly from store (no client-side filtering)
    const filteredFiles = files;

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
                        Sınav Arşivi
                    </h1>
                    <p className="text-lg text-gray-600">
                        Binlerce çıkmış sınav sorusuna ücretsiz eriş.
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="max-w-5xl mx-auto mb-12">
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Ders, üniversite veya bölüm ara..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-12 h-14 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto px-2 pb-2 md:pb-0">
                            <Button
                                variant={isFiltersOpen ? "secondary" : "ghost"}
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="h-12 px-6 rounded-xl gap-2 font-medium w-full md:w-auto justify-center"
                            >
                                <Filter className="h-4 w-4" />
                                Filtreler
                                {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Collapsible Filters */}
                    <AnimatePresence>
                        {isFiltersOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 px-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <SearchableSelect
                                            options={universities.map(u => ({ value: u.id, label: u.name }))}
                                            value={selectedUniversityId}
                                            onValueChange={(val) => {
                                                setUniversity(val);
                                            }}
                                            placeholder="Üniversite"
                                        />

                                        <SearchableSelect
                                            options={departments.map(d => ({ value: d.id, label: d.name }))}
                                            value={selectedDepartmentId}
                                            onValueChange={(val) => {
                                                setDepartment(val);
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
                                            className="bg-white"
                                        />

                                        <Select value={examType} onValueChange={setExamType}>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Sınav Türü" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MIDTERM">Vize</SelectItem>
                                                <SelectItem value="FINAL">Final</SelectItem>
                                                <SelectItem value="QUIZ">Quiz</SelectItem>
                                                <SelectItem value="MAKEUP">Bütünleme</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <div className="col-span-full flex justify-end">
                                            <Button variant="ghost" onClick={resetFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <X className="mr-2 h-4 w-4" /> Filtreleri Temizle
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Info */}
                <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Son Eklenenler
                    </h2>
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                        {filteredFiles.length} sonuç
                    </span>
                </div>

                {/* Results Grid */}
                <div className="max-w-5xl mx-auto">
                    {filesLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="p-0 border-0 shadow-sm bg-white overflow-hidden h-[240px]">
                                    <div className="h-full flex flex-col p-6">
                                        <div className="flex justify-between mb-4">
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-12 rounded-full" />
                                        </div>
                                        <Skeleton className="h-8 w-3/4 mb-3" />
                                        <Skeleton className="h-5 w-1/2 mb-auto" />
                                        <div className="mt-6">
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : filteredFiles.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredFiles.map((file) => (
                                <Card
                                    key={file.id}
                                    className="group relative flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden"
                                >
                                    <div className="p-6 flex flex-col h-full">
                                        {/* Badges */}
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 font-semibold px-3 py-1">
                                                {formatExamType(file.examType)}
                                            </Badge>
                                            <Badge variant="outline" className="text-gray-500 border-gray-200 font-medium px-3 py-1">
                                                {file.year}
                                            </Badge>
                                        </div>

                                        {/* Content */}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-xl text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                                {file.courseName}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="truncate">{file.universityName}</span>
                                            </div>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50 text-xs text-gray-400 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                <span>{(file as any).views || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Download className="h-3 w-3" />
                                                <span>{(file as any).downloads || 0}</span>
                                            </div>
                                            <span>{formatFileSize(file.fileSize)}</span>
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            onClick={() => openPreviewModal(file.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-11 shadow-sm"
                                        >
                                            İndir
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
                            <div className="rounded-full bg-gray-50 p-8 mb-4">
                                <Search className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Sonuç bulunamadı</h3>
                            <p className="text-gray-500 max-w-sm mb-8">
                                Arama kriterlerinize uygun dosya bulunamadı. Filtreleri temizleyip tekrar deneyin.
                            </p>
                            <Button onClick={resetFilters} variant="outline" className="rounded-xl border-2 hover:bg-gray-50">
                                Filtreleri Temizle
                            </Button>
                        </div>
                    )}
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
