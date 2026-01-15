"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Helper type to bypass type check issues in some environments if needed, but ComponentProps is standard
export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
