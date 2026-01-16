"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- 1. FETCH SETTINGS (User & Company) ---
export async function getSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Fetch Admin Profile
  const { data: admin } = await supabaseAdmin
    .from("hr_admins")
    .select("*, companies(*)") // Join company data
    .eq("id", user.id)
    .single();

  if (!admin) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: admin.full_name || "",
      job_title: admin.job_title || "",
      avatar_url: admin.avatar_url || "",
    },
    company: admin.companies || {
        id: admin.company_id,
        name: "",
        website: "",
        industry: ""
    }
  };
}

// --- 2. UPDATE PROFILE ---
export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const fullName = formData.get("fullName") as string;
  const jobTitle = formData.get("jobTitle") as string;

  const { error } = await supabaseAdmin
    .from("hr_admins")
    .update({ 
      full_name: fullName,
      job_title: jobTitle
    })
    .eq("id", user.id);

  if (error) return { success: false, message: "Failed to update profile." };

  revalidatePath("/hr-admin/settings");
  return { success: true, message: "Profile updated successfully." };
}

// --- 3. UPDATE COMPANY ---
export async function updateCompany(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const companyId = formData.get("companyId") as string;
  const name = formData.get("name") as string;
  const website = formData.get("website") as string;
  const industry = formData.get("industry") as string;

  // Verify user belongs to this company (Security)
  const { data: admin } = await supabaseAdmin
    .from("hr_admins")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!admin || admin.company_id !== companyId) {
    return { success: false, message: "Unauthorized to edit this company." };
  }

  const { error } = await supabaseAdmin
    .from("companies")
    .update({ 
      name, 
      website, 
      industry 
    })
    .eq("id", companyId);

  if (error) return { success: false, message: "Failed to update company." };

  revalidatePath("/hr-admin/settings");
  return { success: true, message: "Company details updated." };
}