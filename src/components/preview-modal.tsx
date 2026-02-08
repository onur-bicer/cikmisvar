import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModalStore, useFileStore } from "@/store";
import { formatFileSize, formatExamType } from "@/lib/utils";
import { Download, Trash2, Loader2, X, Flag, AlertTriangle } from "lucide-react";
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
    const [reporting, setReporting] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [showReportForm, setShowReportForm] = useState(false);

    const file = files.find((f) => f.id === previewFileId);

    // Increment view count on mount
    useEffect(() => {
        if (file && previewModalOpen) {
            useFileStore.getState().incrementView(file.id);
        }
    }, [file?.id, previewModalOpen]); // Changed dependency to file.id to avoid loop

    if (!file) return null;

    // ... existing code ...

                        <Button size="sm" className="gap-2" asChild>
                            <a 
                                href={file.previewUrl} 
                                download 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={() => {
                                    useFileStore.getState().incrementDownload(file.id);
                                }}
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">İndir</span>
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-destructive"
                            onClick={() => setShowReportForm(true)}
                        >
                            <Flag className="h-4 w-4" />
                            <span className="hidden sm:inline">Rapor Et</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={closePreviewModal}>
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline">Kapat</span>
                        </Button>
                    </div >
                </DialogHeader >

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

            {/* Report Form Overlay */}
            {showReportForm && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleReport} className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            <h3 className="font-semibold text-lg">Dosyayı Rapor Et</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Bu dosya ile ilgili bir sorun mu var? Lütfen nedeninizi kısaca açıklayın.
                        </p>
                        <textarea
                            className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Hatalı dosya, kopya içerik, telif vb..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            required
                        />
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setShowReportForm(false)}>Vazgeç</Button>
                            <Button type="submit" variant="destructive" disabled={reporting}>
                                {reporting ? "Gönderiliyor..." : "Raporu Gönder"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
            </DialogContent >
        </Dialog >
    );
}
