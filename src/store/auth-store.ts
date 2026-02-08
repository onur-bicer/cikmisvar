import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loginMock: (email: string, name: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            loginMock: (email: string, name: string) => {
                set({
                    user: {
                        id: "user-mock-1",
                        email,
                        name,
                        avatar: undefined,
                    },
                    isAuthenticated: true,
                });
            },
            logout: () => {
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
