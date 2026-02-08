"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFileStore, useAuthStore } from "@/store";
import { Comment } from "@/types";
import { Send, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface CommentSectionProps {
    fileId: string;
    comments?: Comment[];
}

export function CommentSection({ fileId, comments = [] }: CommentSectionProps) {
    const { addComment } = useFileStore();
    const { user } = useAuthStore();
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            text: text.trim(),
            userName: user?.name || "Misafir Kullanıcı",
            avatar: user?.avatar,
            createdAt: new Date().toISOString(),
        };

        addComment(fileId, newComment);
        setText("");
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
                {comments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                        Henüz yorum yapılmamış. İlk yorumu sen yap!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.avatar} />
                                <AvatarFallback>
                                    {comment.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{comment.userName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
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
                        placeholder="Yorum yaz..."
                        className="min-h-[44px] max-h-32 resize-none"
                    />
                    <Button type="submit" size="icon" disabled={!text.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
