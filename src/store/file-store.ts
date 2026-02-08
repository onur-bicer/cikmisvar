import { create } from "zustand";
import { ExamFile } from "@/types";
import { mockFiles } from "@/data/mock-files";

interface FileState {
    files: ExamFile[];
    setFiles: (files: ExamFile[]) => void;
    addComment: (fileId: string, comment: any) => void;
    addFile: (file: any) => void;
}

export const useFileStore = create<FileState>((set) => ({
    files: mockFiles,
    addFile: (file) => set((state) => ({ files: [file, ...state.files] })),
    setFiles: (files) => set({ files }),
    addComment: (fileId, comment) => set((state) => ({
        files: state.files.map((file) => {
            if (file.id === fileId) {
                return {
                    ...file,
                    comments: [comment, ...(file.comments || [])]
                };
            }
            return file;
        })
    })),
}));
