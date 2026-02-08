import { create } from "zustand";
import { persist } from "zustand/middleware";

type CookieConsent = "accepted" | "rejected" | null;

interface UIState {
    cookieConsent: CookieConsent;
    setConsent: (consent: CookieConsent) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            cookieConsent: null,
            setConsent: (consent) => set({ cookieConsent: consent }),
        }),
        {
            name: "ui-storage",
        }
    )
);
