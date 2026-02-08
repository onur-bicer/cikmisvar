"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Upload, CheckCircle2, Zap, Shield, DollarSign, BookOpen, FileText, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { universities } from "@/data/universities";
import { formatFileSize, formatExamType } from "@/lib/utils";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

// Counter Component for Stats
function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (inView) {
            const controls = animate(count, to, { duration });
            return controls.stop;
        }
    }, [count, to, duration, inView]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function Home() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const { openAuthModal, openUploadModal, openPreviewModal } = useModalStore();
    const { query, setQuery, setActiveChip } = useSearchStore(); // activeChip removed from UI but kept in store if needed
    const { files, fetchFiles } = useFileStore();
    const [mounted, setMounted] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLElement>(null);


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

    const handleUploadClick = () => {
        if (user) {
            openUploadModal();
        } else {
            openAuthModal();
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
            <Navbar />

            <main className="flex-1 overflow-hidden">
                {/* Hero Section */}
                <section className="container mx-auto px-4 pt-12 pb-20 lg:pt-24 lg:pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                                Neden Çıkmış Var?
                            </div>

                            <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                                Sınav hazırlığını <br />
                                <span className="text-gray-900">kolaylaştır</span>
                            </h1>

                            <p className="max-w-xl text-lg text-gray-600 sm:text-xl">
                                Türkiye&rsquo;nin en kapsamlı çıkmış soru arşivine ücretsiz eriş
                            </p>

                            {/* Search Bar */}
                            <div ref={searchRef} className="relative max-w-2xl z-20">
                                <form onSubmit={handleSearch} className="relative">
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" />
                                        <Input
                                            className="h-14 lg:h-16 w-full rounded-2xl border-2 border-gray-200 bg-white pl-12 pr-32 text-lg shadow-sm transition-all focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10"
                                            placeholder="Üniversite, bölüm veya ders ara..."
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onFocus={() => setSearchFocused(true)}
                                        />
                                        <Button
                                            type="submit"
                                            className="absolute right-2 h-10 lg:h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-transform active:scale-95"
                                        >
                                            Ara
                                        </Button>
                                    </div>
                                </form>

                                {/* Dropdown Results */}
                                {searchFocused && hasResults && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {searchResults.courses.length > 0 && (
                                            <div className="p-2">
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    Dersler
                                                </div>
                                                {searchResults.courses.map((course) => (
                                                    <button
                                                        key={course.id}
                                                        type="button"
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                                        onClick={() => {
                                                            setSearchFocused(false);
                                                            router.push(`/icerikler?course=${course.id}`);
                                                        }}
                                                    >
                                                        <div className="bg-blue-50 p-2 rounded-md">
                                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">{course.name}</div>
                                                            <div className="text-xs text-gray-500 truncate">
                                                                {course.universityName} • {course.departmentName}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.files.length > 0 && (
                                            <div className="p-2 border-t border-gray-100">
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    Dosyalar
                                                </div>
                                                {searchResults.files.map((file) => (
                                                    <button
                                                        key={file.id}
                                                        type="button"
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 transition-colors"
                                                        onClick={() => {
                                                            setSearchFocused(false);
                                                            router.push(`/icerikler`); // Ideally link to file detail
                                                        }}
                                                    >
                                                        <div className="bg-orange-50 p-2 rounded-md">
                                                            <FileText className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">{file.courseName}</div>
                                                            <div className="text-xs text-gray-500 truncate">
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

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-600/20" onClick={() => {
                                    ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}>
                                    Hemen Başla
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-2 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300" onClick={() => router.push("/icerikler")}>
                                    Soru Arşivine Gözat
                                </Button>
                            </div>
                        </motion.div>

                        {/* Right Content - Hero Image */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white aspect-[4/3] flex items-center justify-center border border-gray-100">
                                {/* Placeholder for Figma Image - Using a gradient/pattern or placeholder text */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
                                <img
                                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Sınav Hazırlık Platformu"
                                    className="object-cover w-full h-full mix-blend-multiply opacity-90"
                                />

                                {/* Floating Badge */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="absolute bottom-8 right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 z-10"
                                >
                                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Başarı Oranı</p>
                                        <p className="text-xl font-bold text-gray-900">%95</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl"
                        >
                            <div className="h-14 w-14 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                                <DollarSign className="h-7 w-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">%100 Ücretsiz</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Tüm sınav sorularına tamamen ücretsiz eriş. Gizli ücret yok, abonelik yok.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl"
                        >
                            <div className="h-14 w-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="h-7 w-7 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Anında Erişim</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Saniyeler içinde aradığın sınavı bul. Akıllı arama ve gelişmiş filtreleme özellikleri.
                            </p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl"
                        >
                            <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="h-7 w-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Doğrulanmış</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Öğrenciler tarafından yüklenmiş gerçek sınav soruları. Topluluk onaylı içerik.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Popular Files Section (Adapting style to match new design) */}
                <section className="container mx-auto px-4 py-20">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Popüler Dosyalar
                        </h2>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => router.push("/icerikler")}>
                            Tümünü Gör <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {files.slice(0, 8).map((file, i) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card
                                    className="flex flex-col p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-gray-100 bg-white h-full group"
                                    onClick={() => openPreviewModal(file.id)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                                        {file.courseName}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-1 mb-4">
                                        {file.universityName}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                        <span>{formatExamType(file.examType)}</span>
                                        <span>{formatFileSize(file.fileSize)}</span>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                className="space-y-2"
                            >
                                <div className="text-5xl lg:text-6xl font-black text-blue-600">
                                    <Counter from={0} to={1200} />+
                                </div>
                                <div className="text-lg font-medium text-gray-600">Sınav Dosyası</div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="space-y-2"
                            >
                                <div className="text-5xl lg:text-6xl font-black text-blue-600">
                                    <Counter from={0} to={50} />+
                                </div>
                                <div className="text-lg font-medium text-gray-600">Üniversite</div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <div className="text-5xl lg:text-6xl font-black text-blue-600">
                                    <Counter from={0} to={10000} />+
                                </div>
                                <div className="text-lg font-medium text-gray-600">Aktif Kullanıcı</div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section ref={ctaRef} className="container mx-auto px-4 py-24">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-20 text-center shadow-2xl">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-700" />

                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                                Arşive katkı sağla
                            </h2>
                            <p className="text-lg text-blue-100 max-w-lg mx-auto">
                                Elindeki çıkmış soruları yükleyerek diğer öğrencilere destek ol ve topluluğumuzu büyüt.
                            </p>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={handleUploadClick}
                                    size="lg"
                                    className="bg-white text-blue-700 hover:bg-blue-50 font-bold h-14 px-10 text-lg rounded-xl shadow-lg"
                                >
                                    <Upload className="mr-2 h-5 w-5" />
                                    Dosya Yükle
                                </Button>
                            </motion.div>
                        </div>
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
