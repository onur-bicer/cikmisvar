import { create } from "zustand";

interface AuthState {
    isAuthenticated: boolean;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    logout: () => {
        set({ isAuthenticated: false });
    },
}));
