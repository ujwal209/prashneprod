import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Update session (refresh cookies)
  const { response, user, supabase } = await updateSession(request);

  // 2. Define Paths
  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/auth");
  const isVerifyPage = path.startsWith("/auth/verify-otp");
  const isOnboardingPage = path === "/onboarding";
  const isDashboard = path.startsWith("/candidate") || path === "/";

  // 3. Authenticated User Logic
  if (user) {
    // A. Fetch Candidate Profile (Check Verification & Onboarding status)
    // We fetch this for every request on protected routes to ensure security.
    const { data: candidate } = await supabase
      .from("candidates")
      .select("is_verified, experience_years")
      .eq("id", user.id)
      .single();

    // --- CHECK 1: VERIFICATION ---
    // If user exists but is NOT verified
    if (candidate && !candidate.is_verified) {
      // Allow access to the Verify OTP page so they can enter the code
      if (isVerifyPage) {
        return response;
      }
      
      // Allow signout
      if (path === "/auth/signout") {
        return response;
      }

      // Redirect EVERYTHING else to Verify OTP page
      // We attach the email so the UI can show it
      const email = user.email || "";
      return NextResponse.redirect(
        new URL(`/auth/verify-otp?email=${encodeURIComponent(email)}`, request.url)
      );
    }

    // --- CHECK 2: ONBOARDING ---
    // If user is Verified but hasn't completed onboarding (missing experience_years)
    if (candidate && candidate.is_verified && !candidate.experience_years) {
      // Allow access to the Onboarding page
      if (isOnboardingPage) {
        return response;
      }
      
      // Allow auth pages (like signout)
      if (isAuthPage) {
         return response;
      }

      // Redirect everything else (like Dashboard) to Onboarding
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // --- CHECK 3: ALREADY LOGGED IN ---
    // If user is Verified AND Onboarded, but tries to visit Login/Signup
    if (isAuthPage && !isVerifyPage && path !== "/auth/signout") {
       return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
    }
  } 
  
  // 4. Unauthenticated User Logic
  else {
    // If NOT logged in, block access to protected areas
    if (path.startsWith("/candidate") || path === "/onboarding") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - generally shouldn't redirect, but handle 401s internally)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};