import { create } from "zustand";

interface ModalState {
    authModalOpen: boolean;
    uploadModalOpen: boolean;
    previewModalOpen: boolean;
    previewFileId: string | null;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    openUploadModal: () => void;
    closeUploadModal: () => void;
    openPreviewModal: (fileId: string) => void;
    closePreviewModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    authModalOpen: false,
    uploadModalOpen: false,
    previewModalOpen: false,
    previewFileId: null,
    openAuthModal: () => set({ authModalOpen: true }),
    closeAuthModal: () => set({ authModalOpen: false }),
    openUploadModal: () => set({ uploadModalOpen: true }),
    closeUploadModal: () => set({ uploadModalOpen: false }),
    openPreviewModal: (fileId: string) => set({ previewModalOpen: true, previewFileId: fileId }),
    closePreviewModal: () => set({ previewModalOpen: false, previewFileId: null }),
}));
