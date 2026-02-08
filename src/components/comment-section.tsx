"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { Comment } from "@/types";
import { Send, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface CommentSectionProps {
    fileId: string;
}

export function CommentSection({ fileId }: CommentSectionProps) {
    const { data: session } = useSession();
    const user = session?.user as any; // Cast to access role
    const { toast } = useToast();
    const [text, setText] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch comments on mount
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/comments?fileId=${fileId}`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (error) {
                console.error("Failed to fetch comments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [fileId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        if (!user) {
            toast({
                title: "Giriş yapmalısınız",
                description: "Yorum yapmak için giriş yapmanız gerekiyor.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId, text: text.trim() })
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments(prev => [newComment, ...prev]);
                setText("");
                toast({
                    title: "Yorum eklendi",
                    description: "Yorumunuz başarıyla kaydedildi.",
                });
            } else {
                throw new Error("Failed to submit");
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Yorum eklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

        setDeletingId(commentId);
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
                toast({
                    title: "Yorum silindi",
                    description: "Yorum başarıyla silindi.",
                });
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Yorum silinirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background border-l">
            <div className="p-4 border-b flex-shrink-0">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    Yorumlar
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {comments.length}
                    </span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                        Henüz yorum yapılmamış. İlk yorumu sen yap!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group relative">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.avatar} />
                                <AvatarFallback>
                                    {comment.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{comment.userName}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                                        </span>
                                        {(user?.role === "admin" || user?.id === comment.userId) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => handleDelete(comment.id)}
                                                disabled={deletingId === comment.id}
                                            >
                                                {deletingId === comment.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3 w-3" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-foreground/90 whitespace-pre-wrap pr-2">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t mt-auto bg-background">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Yorum yaz..."
                        className="min-h-[44px] max-h-32 resize-none"
                        disabled={submitting}
                    />
                    <Button type="submit" size="icon" disabled={!text.trim() || submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
