import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 space-y-6">
            <div className="space-y-2">
                <h1 className="text-9xl font-extrabold tracking-tighter text-primary/20 select-none">404</h1>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                    Page not found
                </h2>
                <p className="text-muted-foreground max-w-[500px] mx-auto text-lg">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
                </p>
            </div>

            <div className="flex gap-4 items-center">
                <Button size="lg" asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/auth/login">Login</Link>
                </Button>
            </div>
        </div>
    )
}
