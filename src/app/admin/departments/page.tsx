
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
import { DepartmentForm } from "@/components/admin/department-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface Department {
    id: string;
    name: string;
    universityId: string;
    university: { name: string };
    _count: {
        courses: number;
        files: number;
    };
}

export default function DepartmentsPage() {
    const [data, setData] = useState<Department[]>([]);
    const [filteredData, setFilteredData] = useState<Department[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/departments");
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
            d.name.toLowerCase().includes(lower) ||
            d.university.name.toLowerCase().includes(lower)
        );
        setFilteredData(filtered);
    }, [search, data]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`${name} bölümünü silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/admin/departments/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            toast({
                title: "Silindi",
                description: "Bölüm başarıyla silindi.",
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

    const columns: ColumnDef<Department>[] = [
        {
            accessorKey: "university.name",
            header: "Üniversite",
        },
        {
            accessorKey: "name",
            header: "Bölüm Adı",
        },
        {
            accessorKey: "_count.courses",
            header: "Ders Sayısı",
        },
        {
            accessorKey: "_count.files",
            header: "Dosya Sayısı",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const department = row.original;
                return (
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(department.id)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(department.id, department.name)}
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
                <h2 className="text-3xl font-bold tracking-tight">Bölümler</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Bölüm Ekle</DialogTitle>
                        </DialogHeader>
                        <DepartmentForm
                            onSuccess={() => {
                                setIsCreateOpen(false);
                                fetchData();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Input
                    placeholder="Ara (Bölüm veya Üniversite)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white dark:bg-card rounded-md border">
                {loading ? <div className="p-4 text-center">Yükleniyor...</div> : <DataTable columns={columns} data={filteredData} />}
            </div>

            <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bölümü Düzenle</DialogTitle>
                    </DialogHeader>
                    {editingId && (
                        <DepartmentForm
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
