"use client";

import { newVerification } from "@/actions/new-verification";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewVerificationPage() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return;
        if (!token) {
            setError("Token bulunamadı!");
            return;
        }

        newVerification(token)
            .then((data) => {
                setSuccess(data.success);
                setError(data.error);
            })
            .catch(() => {
                setError("Bir şeyler ters gitti!");
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Email Doğrulama</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    {!success && !error && (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Doğrulanıyor...</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500 w-full justify-center">
                            <p>{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive w-full justify-center">
                            <p>{error}</p>
                        </div>
                    )}

                    <Button asChild className="w-full mt-4" variant="outline">
                        <Link href="/">Giriş Yap</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
