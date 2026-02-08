"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Page error:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Bir şeyler yanlış gitti!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            {process.env.NODE_ENV !== "production" && (
                <p className="text-xs text-red-500 mb-4 max-w-md break-all font-mono">
                    {error.message}
                </p>
            )}
            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Sayfayı Yenile
                </Button>
                <Button onClick={() => reset()}>Tekrar Dene</Button>
            </div>
        </div>
    );
}

