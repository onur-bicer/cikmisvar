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

    // Get popular courses (mock logic: just take first few courses from first uni)
    const popularCourses = universities[0]?.departments[0]?.courses?.slice(0, 4) || [];

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
        fetchFiles(); // Fetch files from database on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Fetch popular searches
        fetch("/api/search/popular")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setPopularSearches(data);
                } else {
                    // Fallback to defaults if no data yet
                    setPopularSearches([
                        { id: "1", query: "Bilgisayar MÃ¼hendisliÄŸi", label: "Bilgisayar MÃ¼h." },
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
            // Log search
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
            // Log search
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
                            GeÃ§miÅŸ sÄ±navlarÄ± saniyeler iÃ§inde bul
                        </h1>
                        <p className="mx-auto mb-12 max-w-xl text-base font-normal text-muted-foreground/80 sm:text-lg">
                            Ãœniversite, bÃ¶lÃ¼m ve ders bazÄ±nda filtrele.
                            Ã‡Ä±kmÄ±ÅŸ PDF arÅŸivine hÄ±zlÄ± ve Ã¼cretsiz eriÅŸ.
                        </p>

                        <div className="mx-auto max-w-3xl">
                            <div ref={searchRef} className="relative mb-8">
                                <form onSubmit={handleSearch}>
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-5 h-6 w-6 text-muted-foreground z-10" />
                                        <Input
                                            className="h-16 rounded-2xl pl-14 pr-32 text-lg shadow-xl shadow-primary/10 border-2 border-primary/10 focus-visible:ring-primary/30 focus-visible:border-primary/30 hover:shadow-2xl transition-all bg-background"
                                            placeholder="Ders adÄ±, Ã¼niversite veya sÄ±nav tÃ¼rÃ¼ ara..."
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
                                                                {course.universityName} â€¢ {course.departmentName}
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
                                                                {file.year} {formatExamType(file.examType)} â€¢ {file.universityName}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Empty State */}
                                {searchFocused && !hasResults && query.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                                        <div className="p-6 text-center">
                                            <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                                            <p className="font-medium text-foreground mb-1">SonuÃ§ bulunamadÄ±</p>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                &quot;{query}&quot; iÃ§in eÅŸleÅŸen ders veya dosya bulunamadÄ±.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSearchFocused(false);
                                                    router.push("/icerikler");
                                                }}
                                            >
                                                TÃ¼m iÃ§erikleri gÃ¶r
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Recommended Section for Logged In Users */}
                            {session?.user && recommendedFiles.length > 0 && (
                                <div className="mb-12 animate-fade-in text-left">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center lg:justify-start">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                        Sizin Ä°Ã§in Ã–nerilenler
                                    </h2>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
                                        {recommendedFiles.map((file) => (
                                            <Card key={file.id} className="flex flex-col p-5 transition-all hover:border-primary/40 hover:shadow-lg group bg-card/50 backdrop-blur-sm border-muted/60">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground border bg-background/50 px-2.5 py-1 rounded-full">
                                                        {file.year}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                                    {file.courseName}
                                                </h3>
                                                <p className="text-sm font-medium text-muted-foreground mb-1 line-clamp-1">
                                                    {file.universityName}
                                                </p>
                                                <p className="text-xs text-muted-foreground/80 mb-5">
                                                    {formatExamType(file.examType)} â€¢ {formatFileSize(file.fileSize)}
                                                </p>

                                                <div className="mt-auto pt-4 flex gap-2 border-t border-border/50">
                                                    <Button
                                                        onClick={() => openPreviewModal(file.id)}
                                                        variant="default"
                                                        size="sm"
                                                        className="w-full bg-primary/90 hover:bg-primary shadow-sm font-semibold"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" /> Ä°ncele
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mb-4 text-center">
                                <span className="text-sm font-medium text-muted-foreground">PopÃ¼ler Aramalar</span>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {popularSearches.map((chip) => (
                                    <button
                                        key={chip.id}
                                        onClick={() => handleChipClick(chip)}
                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foregroundfocus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${activeChip === chip.id
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "bg-background text-muted-foreground border-border"
                                            }`}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>

                        </div>
                    </div>

                </section>

                {/* Promotional Section */}
                <section className="container mx-auto pb-24">
                    <div className="max-w-5xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                                Neden Ã‡Ä±kmÄ±ÅŸ Var?
                            </span>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                                SÄ±nav hazÄ±rlÄ±ÄŸÄ±nÄ± kolaylaÅŸtÄ±r
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                TÃ¼rkiye&rsquo;nin en kapsamlÄ± Ã§Ä±kmÄ±ÅŸ soru arÅŸivine Ã¼cretsiz eriÅŸ
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid gap-6 md:grid-cols-3 mb-20">
                            <div className="group text-center p-8 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3">%100 Ãœcretsiz</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    TÃ¼m sÄ±nav sorularÄ±na tamamen Ã¼cretsiz eriÅŸ. Gizli Ã¼cret yok.
                                </p>
                            </div>

                            <div className="group text-center p-8 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3">AnÄ±nda EriÅŸim</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Saniyeler iÃ§inde aradÄ±ÄŸÄ±n sÄ±navÄ± bul. AkÄ±llÄ± arama ve filtreleme.
                                </p>
                            </div>

                            <div className="group text-center p-8 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3">DoÄŸrulanmÄ±ÅŸ</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Ã–ÄŸrenciler tarafÄ±ndan yÃ¼klenmiÅŸ gerÃ§ek sÄ±nav sorularÄ±.
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div className="space-y-2">
                                    <div className="text-5xl font-black text-primary">1.200+</div>
                                    <div className="text-base font-medium text-muted-foreground">SÄ±nav DosyasÄ±</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-5xl font-black text-primary">50+</div>
                                    <div className="text-base font-medium text-muted-foreground">Ãœniversite</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-5xl font-black text-primary">10K+</div>
                                    <div className="text-base font-medium text-muted-foreground">Aktif KullanÄ±cÄ±</div>
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
                                ArÅŸive katkÄ± saÄŸla
                            </h2>
                            <p className="mb-8 text-lg text-primary-foreground/80 dark:text-muted-foreground">
                                Elindeki Ã§Ä±kmÄ±ÅŸ sorularÄ± yÃ¼kleyerek diÄŸer Ã¶ÄŸrencilere destek ol.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center animate-fade-in mb-8" style={{ animationDelay: "100ms" }}>
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
                            <Button
                                onClick={handleUploadClick}
                                size="lg"
                                variant="secondary"
                                className="bg-white text-primary hover:bg-white/90 font-semibold h-12 px-8 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Dosya YÃ¼kle
                            </Button>
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
