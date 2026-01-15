"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"; // 👈 Import generic client
import { redirect } from "next/navigation";
import { sendOtpEmail } from "@/lib/mail";

// --- SIGNUP CANDIDATE ---
export async function signupCandidate(prevState: any, formData: FormData) {
  const supabase = await createClient(); // Regular client for Auth
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!fullName || !email || !password) return { message: "All fields are required." };
  if (password !== confirmPassword) return { message: "Passwords do not match." };
  if (password.length < 6) return { message: "Password must be 6+ chars." };

  // A. Create Auth User (Standard Client)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: "candidate" } },
  });

  if (authError) return { message: authError.message };
  if (!authData.user) return { message: "Failed to create account." };

  // B. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // --- C. Create Profile (USING ADMIN CLIENT) ---
  // We use the Service Role key here to bypass RLS policies
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { error: dbError } = await supabaseAdmin.from("candidates").upsert({
    id: authData.user.id,
    full_name: fullName,
    personal_email: email,
    is_verified: false,
    otp_code: otp,
    otp_expires_at: expiresAt,
  }, { onConflict: 'id' });

  if (dbError) {
    console.error("DB Error:", dbError);
    return { message: "Database error. Please try again." };
  }

  // D. Send Email
  await sendOtpEmail(email, otp);

  // E. Redirect
  redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
}

// ... (Keep loginAction and verifyOtpAction as they were) ...
// (Note: verifyOtpAction and loginAction logic doesn't need admin client usually, 
// because the user is logged in for those or we are just updating a flag, 
// BUT if verifyOtpAction fails with RLS, use supabaseAdmin there too)

// --- UPDATED VERIFY OTP ACTION (Just in case RLS blocks update too) ---
export async function verifyOtpAction(prevState: any, formData: FormData) {
  // Use Admin Client here too to be safe since user might not be logged in yet
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
       auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("personal_email", email)
    .single();

  if (!candidate) return { message: "User not found." };
  if (candidate.otp_code !== otp) return { message: "Invalid code." };
  if (new Date() > new Date(candidate.otp_expires_at)) return { message: "Code expired." };

  // Mark Verified
  await supabaseAdmin.from("candidates").update({
    is_verified: true,
    otp_code: null,
    otp_expires_at: null
  }).eq("id", candidate.id);

  redirect("/auth/login?verified=true");
}

// --- UPDATED LOGIN ACTION (Robust Refetch) ---
export async function loginAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // A. Authenticate
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) return { message: "Invalid credentials." };
  if (!data.user) return { message: "Login failed." };

  // B. Check Verification Status (Standard client works here as user is logged in)
  const { data: candidate } = await supabase
    .from("candidates")
    .select("id, is_verified")
    .eq("id", data.user.id)
    .single();

  // C. Handle Unverified Users
  if (candidate && !candidate.is_verified) {
    await supabase.auth.signOut();
    
    // Use Admin Client to update OTP since user is now logged out
    const supabaseAdmin = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    await supabaseAdmin.from("candidates").update({
      otp_code: newOtp,
      otp_expires_at: newExpires
    }).eq("id", candidate.id);

    await sendOtpEmail(email, newOtp);
    redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
  }

  // D. Success Redirect
  if (candidate) {
    redirect("/candidate/dashboard");
  } else {
    redirect("/recruiter/dashboard");
  }
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function resendOtpAction(email: string) {
  if (!email) return { success: false, message: "Email is required." };

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Check if user exists
  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("personal_email", email)
    .single();

  if (!candidate) return { success: false, message: "User not found." };

  // 2. Generate New OTP
  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  // 3. Update DB
  const { error } = await supabaseAdmin
    .from("candidates")
    .update({
      otp_code: newOtp,
      otp_expires_at: newExpiresAt,
    })
    .eq("id", candidate.id);

  if (error) return { success: false, message: "Failed to update OTP." };

  // 4. Send Email
  try {
    await sendOtpEmail(email, newOtp);
    return { success: true, message: "New code sent successfully." };
  } catch (error) {
    return { success: false, message: "Failed to send email." };
  }
}