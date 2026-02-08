"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export function CookieBanner() {
    const { cookieConsent, setConsent } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || cookieConsent) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-slide-up">
            <Card className="flex flex-col gap-4 p-5 shadow-2xl border-primary/20 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    <p>
                        Deneyiminizi iyileştirmek için çerezleri kullanıyoruz. Devam ederek
                        kabul etmiş sayılırsınız.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConsent("rejected")}
                    >
                        Reddet
                    </Button>
                    <Button size="sm" onClick={() => setConsent("accepted")}>
                        Kabul Et
                    </Button>
                </div>
            </Card>
        </div>
    );
}
