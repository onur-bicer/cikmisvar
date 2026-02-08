
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UniversityForm } from "@/components/admin/university-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface University {
    id: string;
    name: string;
    city: string | null;
    _count: {
        departments: number;
        files: number;
    };
}

export default function UniversitiesPage() {
    const [data, setData] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/universities");
            if (res.ok) {
                const text = await res.text();
                try {
                    const jsonData = JSON.parse(text);
                    if (Array.isArray(jsonData)) {
                        setData(jsonData);
                    } else {
                        console.error("API response is not an array:", jsonData);
                        setData([]);
                    }
                } catch (e) {
                    console.error("Failed to parse JSON:", text);
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

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`${name} üniversitesini silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/admin/universities/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            toast({
                title: "Silindi",
                description: "Üniversite başarıyla silindi.",
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

    const columns: ColumnDef<University>[] = [
        {
            accessorKey: "name",
            header: "Üniversite Adı",
        },
        {
            accessorKey: "city",
            header: "Şehir",
        },
        {
            accessorKey: "_count.departments",
            header: "Bölüm Sayısı",
        },
        {
            accessorKey: "_count.files",
            header: "Dosya Sayısı",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const university = row.original;
                return (
                    <div className="flex bg-transparent gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(university.id)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            color="destructive"
                            onClick={() => handleDelete(university.id, university.name)}
                        >
                            <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Üniversiteler</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Üniversite Ekle</DialogTitle>
                        </DialogHeader>
                        <UniversityForm
                            onSuccess={() => {
                                setIsCreateOpen(false);
                                fetchData();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white dark:bg-card rounded-md border">
                {loading ? <div className="p-4 text-center">Yükleniyor...</div> : <DataTable columns={columns} data={data} />}
            </div>

            <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Üniversiteyi Düzenle</DialogTitle>
                    </DialogHeader>
                    {editingId && (
                        <UniversityForm
                            initialData={data.find((d) => d.id === editingId)}
                            onSuccess={() => {
                                setEditingId(null);
                                fetchData();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
