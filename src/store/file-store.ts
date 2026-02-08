import { create } from "zustand";
import { ExamFile } from "@/types";

interface FileState {
    files: ExamFile[];
    loading: boolean;
    setFiles: (files: ExamFile[]) => void;
    addFile: (file: ExamFile) => void;
    addComment: (fileId: string, comment: any) => void;
    fetchFiles: (query?: string) => Promise<void>;
    refreshFiles: () => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
    files: [],
    loading: false,

    setFiles: (files) => set({ files }),

    addFile: (file) => set((state) => ({ files: [file, ...state.files] })),

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

    fetchFiles: async (query?: string) => {
        set({ loading: true });
        try {
            const url = query ? `/api/files?q=${encodeURIComponent(query)}` : "/api/files";
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                set({ files: data, loading: false });
            } else {
                set({ loading: false });
            }
        } catch (error) {
            console.error("Failed to fetch files:", error);
            set({ loading: false });
        }
    },

    refreshFiles: async () => {
        await get().fetchFiles();
    }
}));
