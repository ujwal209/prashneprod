export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
            <div className="w-full max-w-lg">
                {children}
            </div>
        </div>
    )
}
