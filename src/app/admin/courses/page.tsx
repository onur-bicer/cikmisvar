
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
import { CourseForm } from "@/components/admin/course-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface Course {
    id: string;
    name: string;
    departmentId: string;
    department: {
        name: string;
        university: { name: string };
    };
    _count: {
        files: number;
    };
}

export default function CoursesPage() {
    const [data, setData] = useState<Course[]>([]);
    const [filteredData, setFilteredData] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/courses");
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
            d.department.name.toLowerCase().includes(lower) ||
            d.department.university.name.toLowerCase().includes(lower)
        );
        setFilteredData(filtered);
    }, [search, data]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`${name} dersini silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            toast({
                title: "Silindi",
                description: "Ders başarıyla silindi.",
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

    const columns: ColumnDef<Course>[] = [
        {
            accessorKey: "department.university.name",
            header: "Üniversite",
        },
        {
            accessorKey: "department.name",
            header: "Bölüm",
        },
        {
            accessorKey: "name",
            header: "Ders Adı",
        },
        {
            accessorKey: "_count.files",
            header: "Dosya Sayısı",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const course = row.original;
                return (
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(course.id)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(course.id, course.name)}
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
                <h2 className="text-3xl font-bold tracking-tight">Dersler</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Ders Ekle</DialogTitle>
                        </DialogHeader>
                        <CourseForm
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
                    placeholder="Ara (Ders, Bölüm veya Üniversite)..."
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
                        <DialogTitle>Dersi Düzenle</DialogTitle>
                    </DialogHeader>
                    {editingId && (
                        <CourseForm
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
