
"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, User as UserIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
    role: "user" | "admin";
    createdAt: string;
    _count: {
        uploads: number;
        comments: number;
    };
}

export default function UsersPage() {
    const [data, setData] = useState<UserData[]>([]);
    const [filteredData, setFilteredData] = useState<UserData[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
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
            d.email?.toLowerCase().includes(lower)
        );
        setFilteredData(filtered);
    }, [search, data]);

    const handleRoleChange = async (id: string, newRole: "user" | "admin") => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            toast({
                title: "Güncellendi",
                description: "Kullanıcı rolü başarıyla güncellendi.",
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

    const columns: ColumnDef<UserData>[] = [
        {
            accessorKey: "image",
            header: "Kullanıcı",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.avatar || undefined} />
                        <AvatarFallback>{row.original.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.email}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => (
                <Badge variant={row.original.role === "admin" ? "destructive" : "secondary"}>
                    {row.original.role === "admin" ? "Yönetici" : "Kullanıcı"}
                </Badge>
            )
        },
        {
            accessorKey: "_count.uploads",
            header: "Dosyalar",
        },
        {
            accessorKey: "_count.comments",
            header: "Yorumlar",
        },
        {
            accessorKey: "createdAt",
            header: "Kayıt Tarihi",
            cell: ({ row }) => formatDate(row.original.createdAt)
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex gap-2 justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <UserIcon className="h-4 w-4 mr-1" />
                                    Rol Düzenle
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Rol Seçin</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                                    <UserIcon className="mr-2 h-4 w-4" /> Kullanıcı Yap
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                                    <ShieldAlert className="mr-2 h-4 w-4 text-destructive" /> Yönetici Yap
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Kullanıcılar</h2>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Input
                    placeholder="Ara (İsim, Email)..."
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
