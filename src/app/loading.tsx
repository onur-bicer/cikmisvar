import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/navbar";

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container py-8">
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="flex flex-col p-6 h-[200px]">
                                <Skeleton className="h-6 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/3 mb-auto" />
                                <Skeleton className="h-9 w-full mt-4" />
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
            {children}
        </div>
    );
}
