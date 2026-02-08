import { create } from "zustand";
import { ExamFile } from "@/types";

interface FileState {
    files: ExamFile[];
    loading: boolean;
    setFiles: (files: ExamFile[]) => void;
    addFile: (file: ExamFile) => void;
    addComment: (fileId: string, comment: any) => void;
    toggleFavorite: (fileId: string) => Promise<void>;
    fetchFiles: (filters?: {
        q?: string;
        universityId?: string;
        departmentId?: string;
        courseId?: string;
        year?: string;
        examType?: string;
        sort?: string;
    }) => Promise<void>;
    incrementView: (fileId: string) => Promise<void>;
    incrementDownload: (fileId: string) => Promise<void>;
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

    fetchFiles: async (filters?: {
        q?: string;
        universityId?: string;
        departmentId?: string;
        courseId?: string;
        year?: string;
        examType?: string;
        sort?: string;
    }) => {
        set({ loading: true });
        try {
            const params = new URLSearchParams();
            if (filters) {
                if (filters.q) params.append("q", filters.q);
                if (filters.universityId) params.append("universityId", filters.universityId);
                if (filters.departmentId) params.append("departmentId", filters.departmentId);
                if (filters.courseId) params.append("courseId", filters.courseId);
                if (filters.year) params.append("year", filters.year);
                if (filters.examType) params.append("examType", filters.examType);
                if (filters.sort) params.append("sort", filters.sort);
            }

            const url = filters ? `/api/files?${params.toString()}` : "/api/files";
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
    },

    incrementView: async (fileId) => {
        // Optimistic update
        set((state) => ({
            files: state.files.map((file) =>
                file.id === fileId ? { ...file, viewCount: (file.viewCount || 0) + 1 } : file
            )
        }));

        try {
            await fetch(`/api/files/${fileId}/view`, { method: "POST" });
        } catch (error) {
            console.error("Failed to increment view count:", error);
        }
    },

    incrementDownload: async (fileId) => {
        // Optimistic update
        set((state) => ({
            files: state.files.map((file) =>
                file.id === fileId ? { ...file, downloadCount: (file.downloadCount || 0) + 1 } : file
            )
        }));

        try {
            await fetch(`/api/files/${fileId}/download`, { method: "POST" });
        } catch (error) {
            console.error("Failed to increment download count:", error);
        }
    }
}));
