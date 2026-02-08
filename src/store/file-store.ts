import { create } from "zustand";
import { ExamFile } from "@/types";

interface FileState {
    files: ExamFile[];
    loading: boolean;
    setFiles: (files: ExamFile[]) => void;
    addFile: (file: ExamFile) => void;
    addComment: (fileId: string, comment: any) => void;
    toggleFavorite: (fileId: string) => Promise<void>;
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

    toggleFavorite: async (fileId) => {
        // Optimistic update
        set((state) => ({
            files: state.files.map((file) =>
                file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file
            )
        }));

        try {
            const response = await fetch(`/api/files/${fileId}/favorite`, {
                method: "POST",
            });
            if (!response.ok) {
                // Revert on failure
                set((state) => ({
                    files: state.files.map((file) =>
                        file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file
                    )
                }));
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            // Revert on failure
            set((state) => ({
                files: state.files.map((file) =>
                    file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file
                )
            }));
        }
    },

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
