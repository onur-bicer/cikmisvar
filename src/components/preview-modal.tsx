"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModalStore, useFileStore } from "@/store";
import { formatFileSize, formatExamType } from "@/lib/utils";
import { Download } from "lucide-react";
import { CommentSection } from "@/components/comment-section";

export function PreviewModal() {
    const { previewModalOpen, previewFileId, closePreviewModal } = useModalStore();
    const { files } = useFileStore();

    const file = files.find((f) => f.id === previewFileId);

    if (!file) return null;

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
                    <Button size="sm" className="ml-4 gap-2" asChild>
                        <a href={file.previewUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">İndir</span>
                        </a>
                    </Button>
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
