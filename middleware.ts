import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Update session (refresh cookies & get user)
  // 'supabase' here is the standard client using Request/Response context
  const { response, user, supabase } = await updateSession(request);

  // 2. Define Paths
  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/auth");
  const isVerifyPage = path.startsWith("/auth/verify-otp");
  const isOnboardingPage = path === "/onboarding";

  // 3. Authenticated User Logic
  if (user) {
    
    // --- ROLE CHECK 1: SUPER ADMIN ---
    // Check if user exists in super_admins table
    const { data: superAdmin } = await supabase
      .from("super_admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (superAdmin) {
      // If they try to go to Login, send to Dashboard
      if (isAuthPage) return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
      
      // If they try to access other portals (Candidate/HR), block them
      if (path.startsWith("/candidate") || path.startsWith("/hr") || path.startsWith("/hr-admin") || isOnboardingPage) {
        return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
      }
      
      // Allow access to /super-admin routes
      return response;
    }

    // --- ROLE CHECK 2: HR ADMIN ---
    const { data: hrAdmin } = await supabase
      .from("hr_admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (hrAdmin) {
      if (isAuthPage) return NextResponse.redirect(new URL("/hr-admin/dashboard", request.url));
      
      // Block access to other portals
      if (!path.startsWith("/hr-admin")) {
        // Special case: HR Admin shouldn't see Candidate/SuperAdmin pages
        return NextResponse.redirect(new URL("/hr-admin/dashboard", request.url));
      }
      return response;
    }

    // --- ROLE CHECK 3: HR USER ---
    const { data: hrUser } = await supabase
      .from("hr_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (hrUser) {
      if (isAuthPage) return NextResponse.redirect(new URL("/hr/dashboard", request.url));
      
      // Block access to other portals
      if (!path.startsWith("/hr") || path.startsWith("/hr-admin")) { 
        // Note: checking !startsWith("/hr") handles candidate/super. 
        // checking startsWith("/hr-admin") blocks them from admin panel.
        return NextResponse.redirect(new URL("/hr/dashboard", request.url));
      }
      return response;
    }

    // --- ROLE CHECK 4: CANDIDATE (Default) ---
    // We assume if they aren't in the admin tables, they are a candidate
    const { data: candidate } = await supabase
      .from("candidates")
      .select("is_verified, experience_years")
      .eq("id", user.id)
      .single();

    if (candidate) {
        // A. Verification Check
        if (!candidate.is_verified) {
            if (isVerifyPage || path === "/auth/signout") return response;
            const email = user.email || "";
            return NextResponse.redirect(
                new URL(`/auth/verify-otp?email=${encodeURIComponent(email)}`, request.url)
            );
        }

        // B. Onboarding Check
        if (candidate.is_verified && !candidate.experience_years) {
            if (isOnboardingPage || path === "/auth/signout") return response;
            return NextResponse.redirect(new URL("/onboarding", request.url));
        }

        // C. Dashboard Access
        // Block them from Admin/HR routes
        if (path.startsWith("/super-admin") || path.startsWith("/hr") || path.startsWith("/hr-admin")) {
            return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
        }

        // Redirect from Login to Dashboard
        if (isAuthPage && !isVerifyPage && path !== "/auth/signout") {
            return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
        }

        return response;
    }
  } 
  
  // 4. Unauthenticated User Logic
  else {
    // Protect all private routes
    const protectedPaths = ["/candidate", "/onboarding", "/super-admin", "/hr", "/hr-admin"];
    
    // If user tries to visit any protected path without login, send to Login
    if (protectedPaths.some((p) => path.startsWith(p))) {
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
     * - api (API routes - handled separately or pass through)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};