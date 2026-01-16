"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { sendOtpEmail } from "@/lib/mail";

// --- SIGNUP CANDIDATE (Unchanged) ---
export async function signupCandidate(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName || !email || !password) return { message: "All fields are required." };
  if (password !== confirmPassword) return { message: "Passwords do not match." };
  if (password.length < 6) return { message: "Password must be 6+ chars." };

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role: "candidate" } },
  });

  if (authError) return { message: authError.message };
  if (!authData.user) return { message: "Failed to create account." };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
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

  await sendOtpEmail(email, otp);
  redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
}

// --- VERIFY OTP (Unchanged) ---
export async function verifyOtpAction(prevState: any, formData: FormData) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
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

  await supabaseAdmin.from("candidates").update({
    is_verified: true,
    otp_code: null,
    otp_expires_at: null
  }).eq("id", candidate.id);

  redirect("/auth/login?verified=true");
}

// --- LOGIN ACTION (UPDATED FOR ROLES) ---
export async function loginAction(prevState: any, formData: FormData) {
  const supabase = await createClient(); // Standard Client
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Authenticate against Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) return { message: "Invalid credentials." };
  if (!data.user) return { message: "Login failed." };

  const userId = data.user.id;

  // 2. Initialize Admin Client to check all tables
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // --- CHECK 1: SUPER ADMIN ---
  const { data: superAdmin } = await supabaseAdmin
    .from("super_admins")
    .select("id")
    .eq("id", userId)
    .single();

  if (superAdmin) {
    redirect("/super-admin/dashboard");
  }

  // --- CHECK 2: HR ADMIN (Company Owner) ---
  const { data: hrAdmin } = await supabaseAdmin
    .from("hr_admins")
    .select("id")
    .eq("id", userId)
    .single();

  if (hrAdmin) {
    redirect("/hr-admin/dashboard");
  }

  // --- CHECK 3: HR USER (Recruiter) ---
  const { data: hrUser } = await supabaseAdmin
    .from("hr_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (hrUser) {
    redirect("/hr/dashboard");
  }

  // --- CHECK 4: CANDIDATE ---
  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id, is_verified")
    .eq("id", userId)
    .single();

  // Handle Unverified Candidate
  if (candidate && !candidate.is_verified) {
    await supabase.auth.signOut();
    
    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    await supabaseAdmin.from("candidates").update({
      otp_code: newOtp,
      otp_expires_at: newExpires
    }).eq("id", candidate.id);

    await sendOtpEmail(email, newOtp);
    redirect(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
  }

  // Valid Candidate
  if (candidate) {
    redirect("/candidate/dashboard");
  }

  // Fallback: User authenticated but no role found in tables
  return { message: "Account setup incomplete. Please contact support." };
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

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("personal_email", email)
    .single();

  if (!candidate) return { success: false, message: "User not found." };

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("candidates")
    .update({
      otp_code: newOtp,
      otp_expires_at: newExpiresAt,
    })
    .eq("id", candidate.id);

  if (error) return { success: false, message: "Failed to update OTP." };

  try {
    await sendOtpEmail(email, newOtp);
    return { success: true, message: "New code sent successfully." };
  } catch (error) {
    return { success: false, message: "Failed to send email." };
  }
}