"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendHrInvitationEmail } from "@/lib/mail";

// Admin Client (Service Role) to bypass RLS for user creation
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function createTeamMemberAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // 1. Get Current HR Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 2. Get Admin's Company & Limits
  const { data: hrProfile } = await supabaseAdmin
    .from("hr_admins")
    .select("company_id, companies(hr_limit)")
    .eq("id", user.id)
    .single();

  if (!hrProfile || !hrProfile.companies) {
    return { success: false, message: "Company profile not found." };
  }

  const companyId = hrProfile.company_id;
  const limit = hrProfile.companies.hr_limit;

  // 3. CHECK QUOTA (The Critical Step)
  const { count: currentCount } = await supabaseAdmin
    .from("hr_users")
    .select("*", { count: 'exact', head: true })
    .eq("company_id", companyId);
  
  // We count existing users. If count is equal or greater than limit, BLOCK IT.
  if ((currentCount || 0) >= limit) {
    return { 
      success: false, 
      message: `Plan limit reached (${limit} users). Please upgrade your subscription to add more recruiters.` 
    };
  }

  // 4. Extract Form Data
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const designation = formData.get("designation") as string;
  
  // Generate random password
  const password = Math.random().toString(36).slice(-8) + "Aa1!";

  // 5. Create Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'hr_user' } // Role is strictly 'hr_user'
  });

  if (authError) return { success: false, message: authError.message };

  // 6. Create DB Record in 'hr_users'
  const { error: dbError } = await supabaseAdmin.from("hr_users").insert({
    id: authData.user.id,
    company_id: companyId,
    full_name: fullName,
    email: email, // Store email for recovery
    designation: designation,
    status: 'active'
  });

  if (dbError) {
    // Rollback auth user if DB fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { success: false, message: dbError.message };
  }

  // 7. Send Invite
  try {
    await sendHrInvitationEmail(email, password, fullName);
  } catch (err) {
    console.error("Email failed", err);
    // User created successfully, just email failed. Don't fail the action.
    return { success: true, message: "User created, but email failed. Share credentials manually." };
  }

  revalidatePath("/hr-admin/team");
  redirect("/hr-admin/team");
}

// --- GET TEAM LIST ---
export async function getTeamList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { members: [], limit: 0, count: 0 };

  // Get Company ID
  const { data: hrProfile } = await supabaseAdmin
    .from("hr_admins")
    .select("company_id, companies(hr_limit)")
    .eq("id", user.id)
    .single();

  if (!hrProfile) return { members: [], limit: 0, count: 0 };

  const { data: members, count } = await supabaseAdmin
    .from("hr_users")
    .select("*", { count: 'exact' })
    .eq("company_id", hrProfile.company_id)
    .order('created_at', { ascending: false });

  return { 
    members: members || [], 
    limit: hrProfile.companies.hr_limit,
    count: count || 0
  };
}