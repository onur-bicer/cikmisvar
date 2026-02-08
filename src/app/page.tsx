"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Upload, X, FileText, BookOpen, Eye, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { AuthModal } from "@/components/auth-modal";
import { UploadModal } from "@/components/upload-modal";
import { PreviewModal } from "@/components/preview-modal";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useModalStore, useSearchStore, useFileStore } from "@/store";
import { popularSearches as defaultPopularSearches } from "@/data/popular-searches";
import { universities } from "@/data/universities";
import { formatFileSize, formatExamType, formatDate } from "@/lib/utils";

export default function Home() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const { openAuthModal, openUploadModal, openPreviewModal } = useModalStore();
    const { query, setQuery, setActiveChip, activeChip } = useSearchStore();
    const { files, fetchFiles } = useFileStore();
    const [popularSearches, setPopularSearches] = useState<{ id: string; query: string; label: string }[]>([]);
    const [mounted, setMounted] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Live search filtering
    const searchResults = useMemo(() => {
        if (!query.trim() || query.length < 2) return { courses: [], files: [] };

        const normalizedQuery = query.toLowerCase().trim();

        // Search courses
        const matchedCourses: Array<{ id: string; name: string; universityName: string; departmentName: string }> = [];
        universities.forEach(uni => {
            uni.departments.forEach(dep => {
                dep.courses.forEach(course => {
                    if (course.name.toLowerCase().includes(normalizedQuery)) {
                        matchedCourses.push({
                            id: course.id,
                            name: course.name,
                            universityName: uni.name,
                            departmentName: dep.name,
                        });
                    }
                });
            });
        });

        // Search files
        const matchedFiles = files.filter(file =>
            file.courseName?.toLowerCase().includes(normalizedQuery) ||
            file.universityName?.toLowerCase().includes(normalizedQuery) ||
            file.departmentName?.toLowerCase().includes(normalizedQuery)
        ).slice(0, 5);

        return { courses: matchedCourses.slice(0, 5), files: matchedFiles };
    }, [query, files]);

    const hasResults = searchResults.courses.length > 0 || searchResults.files.length > 0;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setMounted(true);
        fetchFiles();
    }, []);

    useEffect(() => {
        // Fetch popular searches
        fetch("/api/search/popular")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setPopularSearches(data);
                } else {
                    // Fallback to defaults
                    setPopularSearches([
                        { id: "1", query: "Bilgisayar Mühendisliği", label: "Bilgisayar Müh." },
                        { id: "2", query: "Elektrik Elektronik", label: "Elektrik-Elektronik" },
                        { id: "3", query: "Matematik", label: "Matematik 1" },
                        { id: "4", query: "Fizik", label: "Fizik 2" },
                    ]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch popular searches:", err);
            });
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            fetch("/api/search/log", {
                method: "POST",
                body: JSON.stringify({ term: query }),
            });
            router.push("/icerikler");
        }
    };

    const handleChipClick = (chip: { id: string; query: string; label: string }) => {
        setActiveChip(chip.id);
        setQuery(chip.query);
        if (chip.query) {
            fetch("/api/search/log", {
                method: "POST",
                body: JSON.stringify({ term: chip.query }),
            });
            router.push("/icerikler");
        }
    };

    const handleUploadClick = () => {
        if (user) {
            openUploadModal();
        } else {
            openAuthModal();
        }
    };

    // Recommended files state
    const [recommendedFiles, setRecommendedFiles] = useState<any[]>([]);

    useEffect(() => {
        if (session?.user) {
            fetch("/api/files/recommended")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setRecommendedFiles(data);
                    }
                })
                .catch(err => console.error("Failed to fetch recommendations:", err));
        }
    }, [session]);

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-28 lg:pt-36 lg:pb-44">
                    <div className="container relative z-10 mx-auto px-4 text-center">
                        <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl text-foreground">
                            Geçmiş sınavları saniyeler içinde bul
                        </h1>
                        <p className="mx-auto mb-12 max-w-xl text-base font-normal text-muted-foreground/80 sm:text-lg">
                            Üniversite, bölüm ve ders bazında filtrele.
                            Çıkmış PDF arşivine hızlı ve ücretsiz eriş.
                        </p>

                        <div className="mx-auto max-w-3xl">
                            <div ref={searchRef} className="relative mb-8">
                                <form onSubmit={handleSearch}>
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-5 h-6 w-6 text-muted-foreground z-10" />
                                        <Input
                                            className="h-16 rounded-2xl pl-14 pr-32 text-lg shadow-xl shadow-primary/10 border-2 border-primary/10 focus-visible:ring-primary/30 focus-visible:border-primary/30 hover:shadow-2xl transition-all bg-background"
                                            placeholder="Ders adı, üniversite veya sınav türü ara..."
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onFocus={() => setSearchFocused(true)}
                                        />
                                        <Button
                                            type="submit"
                                            className="absolute right-2 h-12 px-8 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] z-10"
                                        >
                                            Ara
                                        </Button>
                                    </div>
                                </form>

                                {/* Live Search Dropdown */}
                                {searchFocused && hasResults && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                                        {searchResults.courses.length > 0 && (
                                            <div className="p-2">
                                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Dersler
                                                </div>
                                                {searchResults.courses.map((course) => (
                                                    <button
                                                        key={course.id}
                                                        type="button"
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-muted/50 transition-colors"
                                                        onClick={() => {
                                                            setSearchFocused(false);
                                                            router.push(`/icerikler?course=${course.id}`);
                                                        }}
                                                    >
                                                        <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{course.name}</div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {course.universityName} • {course.departmentName}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchResults.files.length > 0 && (
                                            <div className="p-2 border-t border-border">
                                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Dosyalar
                                                </div>
                                                {searchResults.files.map((file) => (
                                                    <button
                                                        key={file.id}
                                                        type="button"
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-muted/50 transition-colors"
                                                        onClick={() => {
                                                            setSearchFocused(false);
                                                            router.push(`/icerikler`);
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{file.courseName}</div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {file.year} {formatExamType(file.examType)} • {file.universityName}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                <div className="mb-4 text-center">
                                    <span className="text-sm font-medium text-muted-foreground">Popüler Aramalar</span>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    {popularSearches.map((chip) => (
                                        <button
                                            key={chip.id}
                                            onClick={() => handleChipClick(chip)}
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${activeChip === chip.id
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-background text-muted-foreground border-border"
                                                }`}
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>

                                {recommendedFiles.length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-border/50 animate-fade-in">
                                        <div className="mb-4 text-center">
                                            <span className="text-sm font-medium text-muted-foreground">Sizin İçin Önerilenler</span>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {recommendedFiles.slice(0, 5).map((file) => (
                                                <Badge
                                                    key={file.id}
                                                    variant="outline"
                                                    className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 hover:bg-primary/5 hover:border-primary/20"
                                                    onClick={() => openPreviewModal(file.id)}
                                                >
                                                    <FileText className="mr-2 h-3.5 w-3.5 text-primary" />
                                                    {file.courseName}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Popular Files Section */}
                <section className="container mx-auto py-24">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Popüler Dosyalar
                            </h2>
                            <Button variant="ghost" onClick={() => router.push("/icerikler")} className="group">
                                Tümünü Gör <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {files.slice(0, 8).map((file) => (
                                <Card
                                    key={file.id}
                                    className="flex flex-col p-5 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                                    onClick={() => openPreviewModal(file.id)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <FileText className="h-6 w-6 text-primary" />
                                        <h3 className="font-semibold text-lg line-clamp-1">{file.courseName}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                        {file.universityName}
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 mb-5">
                                        {formatExamType(file.examType)} • {formatFileSize(file.fileSize)}
                                    </p>

                                    <div className="mt-auto pt-4 flex gap-2 border-t border-border/50">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPreviewModal(file.id);
                                            }}
                                            variant="default"
                                            size="sm"
                                            className="flex-1 bg-primary/90 hover:bg-primary shadow-sm font-semibold"
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> İncele
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`px-2.5 ${file.isFavorite ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (user) {
                                                    useFileStore.getState().toggleFavorite(file.id);
                                                } else {
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
                    </div>
                </section>

                {/* Promotional Section */}
                <section className="container mx-auto pb-24">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                                Neden Çıkmış Var?
                            </span>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                                Sınav hazırlığını kolaylaştır
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Türkiye&rsquo;nin en kapsamlı çıkmış soru arşivine ücretsiz eriş
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3 mb-20">
                            <div className="group text-center p-8 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08-.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3">%100 Ücretsiz</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Tüm sınav sorularına tamamen ücretsiz eriş. Gizli ücret yok.
                                </p>
                            </div>

                            <div className="group text-center p-8 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3">Anında Erişim</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Saniyeler içinde aradığın sınavı bul. Akıllı arama ve filtreleme.
                                </p>
                            </div>

                            <div className="group text-center p-8 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3">Doğrulanmış</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Öğrenciler tarafından yüklenmiş gerçek sınav soruları.
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div className="space-y-2">
                                    <div className="text-5xl font-black text-primary">1.200+</div>
                                    <div className="text-base font-medium text-muted-foreground">Sınav Dosyası</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-5xl font-black text-primary">50+</div>
                                    <div className="text-base font-medium text-muted-foreground">Üniversite</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-5xl font-black text-primary">10K+</div>
                                    <div className="text-base font-medium text-muted-foreground">Aktif Kullanıcı</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto pb-24">
                    <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center shadow-xl sm:px-16 md:py-24 dark:bg-card dark:border dark:border-primary/10 dark:shadow-none">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight text-white mb-4 dark:text-foreground">
                                Arşive katkı sağla
                            </h2>
                            <p className="mb-8 text-lg text-primary-foreground/80 dark:text-muted-foreground">
                                Elindeki çıkmış soruları yükleyerek diğer öğrencilere destek ol.
                            </p>

                            <div className="flex justify-center mb-8">
                                <Button
                                    onClick={handleUploadClick}
                                    size="lg"
                                    variant="secondary"
                                    className="bg-white text-primary hover:bg-white/90 font-semibold h-12 px-8 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                                >
                                    <Upload className="mr-2 h-5 w-5" />
                                    Dosya Yükle
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center animate-fade-in" style={{ animationDelay: "100ms" }}>
                                {popularSearches.map((search) => (
                                    <Badge
                                        key={search.id}
                                        variant={activeChip === search.id ? "default" : "secondary"}
                                        className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${activeChip === search.id ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-secondary/80"
                                            }`}
                                        onClick={() => handleChipClick(search)}
                                    >
                                        {search.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl dark:bg-primary/5"></div>
                        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl dark:bg-primary/5"></div>
                    </div>
                </section>
            </main>

            <Footer />
            <CookieBanner />
            <AuthModal />
            <UploadModal />
            <PreviewModal />
            <Toaster />
        </div>
    );
}
