"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, Trash2, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { useModalStore } from "@/store";

interface Report {
    id: string;
    fileId: string;
    reason: string;
    description: string | null;
    status: string;
    createdAt: string;
    file: {
        courseName: string;
        universityName: string;
        previewUrl: string | null;
    };
    user?: {
        name: string | null;
        email: string;
    } | null;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { openPreviewModal } = useModalStore();

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/admin/reports");
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const updateReportStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/reports/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                setReports(reports.map(r => r.id === id ? { ...r, status } : r));
                toast({
                    title: "Rapor güncellendi",
                    description: `Rapor durumu "${status}" olarak güncellendi.`,
                });
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Durum güncellenirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    const deleteFile = async (fileId: string, reportId: string) => {
        if (!confirm("Dosyayı silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/files/${fileId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                updateReportStatus(reportId, "resolved");
                toast({
                    title: "Dosya silindi",
                    description: "Dosya ve ilgili rapor çözümlendi.",
                });
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Dosya silinirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
                    <p className="text-muted-foreground">Şikayet edilen dosyaları buradan yönetin.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bekleyen Raporlar</CardTitle>
                    <CardDescription>Kullanıcılar tarafından bildirilen sorunlar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Dosya</TableHead>
                                <TableHead>Neden</TableHead>
                                <TableHead>Kullanıcı</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Hiç rapor bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="text-xs">
                                            {format(new Date(report.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{report.file.courseName}</span>
                                                <span className="text-xs text-muted-foreground">{report.file.universityName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5">
                                                {report.reason}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {report.user ? (
                                                <div className="flex flex-col">
                                                    <span>{report.user.name || "İsimsiz"}</span>
                                                    <span className="text-muted-foreground">{report.user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Anonim</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={report.status === "pending" ? "default" : "secondary"}>
                                                {report.status === "pending" ? "Bekliyor" :
                                                    report.status === "resolved" ? "Çözüldü" : "İncelendi"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => openPreviewModal(report.fileId)}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                                {report.status !== "resolved" && (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateReportStatus(report.id, "reviewed")}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteFile(report.fileId, report.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
