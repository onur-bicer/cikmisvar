
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash, Eye, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { formatExamType, formatDate } from "@/lib/utils";

interface FileData {
    id: string;
    name: string;
    url: string;
    type: string;
    examType: string;
    year: string;
    createdAt: string;
    uploader: string;
    courseName: string;
    universityName: string;
}

export default function FilesPage() {
    const [data, setData] = useState<FileData[]>([]);
    const [filteredData, setFilteredData] = useState<FileData[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/files");
            if (res.ok) {
                const jsonData = await res.json();
                if (Array.isArray(jsonData)) {
                    setData(jsonData);
                    setFilteredData(jsonData);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        const filtered = data.filter(d =>
            d.name?.toLowerCase().includes(lower) ||
            d.courseName?.toLowerCase().includes(lower) ||
            d.uploader?.toLowerCase().includes(lower) ||
            d.universityName?.toLowerCase().includes(lower)
        );
        setFilteredData(filtered);
    }, [search, data]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`${name} dosyasını silmek istediğinize emin misiniz?`)) return;

        try {
            // Using the existing generic delete endpoint which handles file deletion from blob and db
            const res = await fetch(`/api/files/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            toast({
                title: "Silindi",
                description: "Dosya başarıyla silindi.",
            });
            fetchData();
            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: (error as Error).message,
            });
        }
    };

    const columns: ColumnDef<FileData>[] = [
        {
            accessorKey: "name",
            header: "Dosya Adı",
            cell: ({ row }) => (
                <a href={row.original.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                    {row.original.name} <ExternalLink className="h-3 w-3" />
                </a>
            )
        },
        {
            accessorKey: "courseName",
            header: "Ders",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.courseName}</div>
                    <div className="text-xs text-muted-foreground">{row.original.universityName}</div>
                </div>
            )
        },
        {
            accessorKey: "examType",
            header: "Tür/Yıl",
            cell: ({ row }) => `${formatExamType(row.original.examType)} ${row.original.year}`
        },
        {
            accessorKey: "uploader",
            header: "Yükleyen",
        },
        {
            accessorKey: "createdAt",
            header: "Tarih",
            cell: ({ row }) => formatDate(row.original.createdAt)
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const file = row.original;
                return (
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(file.id, file.name)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dosyalar</h2>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Input
                    placeholder="Ara (Dosya, Ders, Üniversite, Yükleyen)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white dark:bg-card rounded-md border">
                {loading ? <div className="p-4 text-center">Yükleniyor...</div> : <DataTable columns={columns} data={filteredData} />}
            </div>
        </div>
    );
}
