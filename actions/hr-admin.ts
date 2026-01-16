"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- GET DASHBOARD DATA ---
export async function getHrDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // 1. Get HR Admin Details & Company Link
  const { data: hrProfile } = await supabase
    .from("hr_admins")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (!hrProfile) return null;

  const companyId = hrProfile.company_id;

  // 2. Get Stats (Mocking counts assuming tables exist, or returning 0)
  // You would replace 'jobs', 'applications' with your actual tables
  const { count: jobCount } = await supabase
    .from("jobs") 
    .select("*", { count: 'exact', head: true })
    .eq("company_id", companyId);

  const { count: teamCount } = await supabase
    .from("hr_users")
    .select("*", { count: 'exact', head: true })
    .eq("company_id", companyId);
    
  // Check if onboarding (personal details) is complete
  const isOnboardingComplete = !!(hrProfile.phone && hrProfile.linkedin_url);

  return {
    profile: hrProfile,
    company: hrProfile.companies,
    stats: {
      activeJobs: jobCount || 0,
      totalCandidates: 0, // Replace with real query later
      teamSize: teamCount || 0,
      interviewsScheduled: 0
    },
    isOnboardingComplete
  };
}

// --- SUBMIT PERSONAL ONBOARDING ---
export async function completeHrOnboarding(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, message: "Unauthorized" };

  const phone = formData.get("phone") as string;
  const linkedin = formData.get("linkedin") as string;
  const designation = formData.get("designation") as string;

  if (!phone || !designation) {
    return { success: false, message: "Phone and Designation are required." };
  }

  const { error } = await supabase
    .from("hr_admins")
    .update({ 
      phone, 
      linkedin_url: linkedin,
      // Assuming you might add a 'designation' column later, 
      // otherwise store it in metadata or ignore it.
      // For now, let's assume standard fields.
    })
    .eq("id", user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/hr-admin/dashboard");
  return { success: true, message: "Profile completed successfully!" };
}
export async function getTeamList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { members: [], limit: 0, count: 0 };

  // 1. Get Company ID & Limit from the Admin's profile
  const { data: hrProfile } = await supabaseAdmin
    .from("hr_admins")
    .select("company_id, companies(hr_limit)")
    .eq("id", user.id)
    .single();

  if (!hrProfile || !hrProfile.companies) return { members: [], limit: 0, count: 0 };

  // 2. Fetch Team Members (Recruiters)
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