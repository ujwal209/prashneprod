import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    // 1. Update session (refresh cookies)
    // This calls the helper we made which does getUser()
    const { response, user, supabase } = await updateSession(request);

    // 2. Protected Routes Logic
    const path = request.nextUrl.pathname;

    // Candidate Dashboard Protection
    // If accessing dashboard and not logged in -> redirect to login
    // If logged in, check if onboarding is complete.

    // NOTE: In a real app we might fetch the role from the DB or metadata.
    // For now, let's assume if they are logged in and hit /candidate/* or /, we check onboarding.

    // We ONLY enforce onboarding check if the user is authenticated.
    if (user) {
        // Check for onboarding status if the user is signed in
        // We query the 'candidates' table.
        // Optimization: You might want to store this in metadata, but the prompt says check DB.
        // However, doing a DB call in middleware is expensive.
        // Strategy: We can do it if path is NOT onboarding.

        if (path === "/onboarding") {
            // Allow access to onboarding
            return response;
        }

        // If user is candidate, verify onboarding
        const role = user.user_metadata?.role;

        if (role === 'candidate') {
            // For strict performance, we usually cache this in a cookie or metadata.
            // But per prompt "Check database/metadata", I'll check metadata first if available,
            // otherwise I might rely on "is_onboarding_completed" column in public table.
            // Middleware DB access is tricky with Supabase standard client (it uses fetch). 
            // It IS supported but adds latency. 

            // Let's trying checking a custom claim or just assuming they need to check DB if we can't trust metadata.
            // Prompt: "Check database/metadata to see if they have finished onboarding."

            // Let's try to query the candidates table for this user
            const { data: candidate } = await supabase
                .from("candidates")
                .select("experience_years")
                .eq("id", user.id)
                .single();

            // Check if profile exists and has experience_years set (proxy for onboarding complete)
            if (!candidate || !candidate.experience_years) {
                // Force redirect to onboarding if no profile exists OR onboarding is not done
                return NextResponse.redirect(new URL("/onboarding", request.url));
            }
        }
    } else {
        // If NOT logged in and trying to access protected routes
        if (path.startsWith("/dashboard") || path.startsWith("/onboarding")) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    return response;
}

export const config = {
    // matcher: [
    //   /*
    //    * Match all request paths except for the ones starting with:
    //    * - _next/static (static files)
    //    * - _next/image (image optimization files)
    //    * - favicon.ico (favicon file)
    //    * - auth (auth pages) - Wait, we DO want middleware on auth pages to redirect if ALREADY logged in? 
    //    *   Use explicit exclusions.
    //    */
    //   '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // ],
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
