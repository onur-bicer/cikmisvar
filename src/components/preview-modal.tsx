import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModalStore, useFileStore } from "@/store";
import { formatFileSize, formatExamType } from "@/lib/utils";
import { Download, Trash2, Loader2, X } from "lucide-react";
import { CommentSection } from "@/components/comment-section";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

export function PreviewModal() {
    const { previewModalOpen, previewFileId, closePreviewModal, openAuthModal } = useModalStore();
    const { files, setFiles } = useFileStore();
    const { data: session } = useSession();
    const user = session?.user as any;
    const { toast } = useToast();
    const [deleting, setDeleting] = useState(false);

    const file = files.find((f) => f.id === previewFileId);

    // Increment view count on mount
    useEffect(() => {
        if (file && previewModalOpen) {
            fetch(`/api/files/${file.id}/view`, { method: "POST" });
        }
    }, [file, previewModalOpen]);

    if (!file) return null;

    const handleDelete = async () => {
        if (!confirm("Bu dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/files/${file.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                // Remove file from store
                setFiles(files.filter(f => f.id !== file.id));
                toast({
                    title: "Dosya silindi",
                    description: "Dosya başarıyla silindi.",
                });
                closePreviewModal();
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Dosya silinirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={previewModalOpen} onOpenChange={(open) => !open && closePreviewModal()}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
                <DialogHeader className="p-4 border-b flex-shrink-0 bg-background/95 backdrop-blur z-10 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-0.5">
                        <DialogTitle className="text-lg">{file.courseName}</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            {file.universityName} • {file.year} {formatExamType(file.examType)} • {formatFileSize(file.fileSize)}
                        </p>
                    </div>
                    <div className="flex items-center ml-4 gap-2">
                        {(user?.role === "admin" || user?.id === file.uploaderId) && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span className="hidden sm:inline">Sil</span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className={`gap-2 ${file.isFavorite ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10" : ""}`}
                            onClick={() => {
                                if (user) {
                                    useFileStore.getState().toggleFavorite(file.id);
                                } else {
                                    openAuthModal();
                                }
                            }}
                        >
                            <svg
                                className={`h-4 w-4 ${file.isFavorite ? "fill-current" : ""}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span className="hidden sm:inline">{file.isFavorite ? "Favorilerde" : "Favoriye Ekle"}</span>
                        </Button>
                        <Button size="sm" className="gap-2" asChild>
                            <a href={file.previewUrl} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">İndir</span>
                            </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={closePreviewModal}>
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline">Kapat</span>
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-muted/30 p-0 overflow-hidden flex flex-col lg:flex-row relative h-full">
                    {/* PDF Area */}
                    <div className="flex-1 relative h-[50vh] lg:h-auto border-b lg:border-b-0 lg:border-r border-border">
                        {file.previewUrl ? (
                            <iframe
                                src={`${file.previewUrl}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-background/50">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <span className="font-bold text-xl">PDF</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Önizleme Kullanılamıyor</h3>
                                <p className="text-gray-500 max-w-md">
                                    Bu dosya yalnızca indirilerek görüntülenebilir.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Comments Area */}
                    <div className="w-full lg:w-[320px] xl:w-[380px] h-[50vh] lg:h-full flex-shrink-0 bg-background">
                        <CommentSection fileId={file.id} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
