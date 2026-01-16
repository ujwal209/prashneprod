"use server";

import { createClient } from "@supabase/supabase-js";
import { sendOtpEmail } from "@/lib/mail";

// 1. Initialize Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- HELPER: Reliable User Lookup ---
async function findUserByEmail(email: string) {
  // TRICK: We ask Supabase to generate a recovery link. 
  // This performs a direct, indexed lookup for the user.
  // We don't use the link; we just want the 'user' object it returns.
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: email,
  });

  if (error || !data.user) {
    console.error("[Auth] Lookup failed:", error?.message);
    return null;
  }

  return data.user;
}

// --- STEP 1: SEND OTP ---
export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) return { success: false, message: "Email is required." };

  // 1. Find User (Using the new reliable method)
  const user = await findUserByEmail(email);

  if (!user) {
    // Security: Fake success
    return { success: true, message: "If an account exists, a code has been sent.", step: "otp", email }; 
  }

  // 2. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  // 3. Store OTP in Metadata
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { user_metadata: { ...user.user_metadata, reset_otp: otp, reset_exp: expiresAt } }
  );

  if (updateError) {
    console.error("[Auth] Update Error:", updateError.message);
    return { success: false, message: "System error. Try again." };
  }

  // 4. Send Email
  try {
    await sendOtpEmail(email, otp, 'reset');
    return { success: true, message: "Verification code sent.", step: "otp", email };
  } catch (err) {
    console.error("[Auth] Nodemailer Error:", err);
    return { success: false, message: "Failed to send email." };
  }
}

// --- STEP 2: VERIFY OTP ---
export async function verifyResetOtp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  const user = await findUserByEmail(email);

  if (!user) return { success: false, message: "Invalid request." };

  const storedOtp = user.user_metadata?.reset_otp;
  const storedExp = user.user_metadata?.reset_exp;

  if (!storedOtp || storedOtp !== otp) {
    return { success: false, message: "Invalid code.", step: "otp", email };
  }

  if (Date.now() > storedExp) {
    return { success: false, message: "Code expired.", step: "email", email: "" };
  }

  return { success: true, message: "Code verified.", step: "password", email };
}

// --- STEP 3: RESET PASSWORD ---
export async function resetPassword(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) return { success: false, message: "Passwords do not match.", step: "password", email };
  if (password.length < 6) return { success: false, message: "Password must be 6+ characters.", step: "password", email };

  const user = await findUserByEmail(email);
  if (!user) return { success: false, message: "User not found." };

  if (user.user_metadata?.reset_otp !== otp) {
    return { success: false, message: "Session expired.", step: "email" };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { 
      password: password,
      user_metadata: { ...user.user_metadata, reset_otp: null, reset_exp: null }
    }
  );

  if (error) return { success: false, message: error.message, step: "password", email };

  return { success: true, message: "Password updated successfully!", step: "success" };
}