"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Groq from "groq-sdk";

// Admin Client
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- 1. GET JOBS (Updated with Search) ---
export async function getJobs(query: string = "") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Resolve Company ID
  let companyId = null;
  const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
  if (admin) companyId = admin.company_id;
  else {
    const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
    if (hrUser) companyId = hrUser.company_id;
  }

  if (!companyId) return [];

  // Build Query
  let dbQuery = supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  // Apply Search Filter
  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  const { data } = await dbQuery;
  return data || [];
}

// --- 2. GET SINGLE JOB (New) ---
export async function getJobById(id: string) {
  const { data } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();
  
  return data;
}

// --- 3. CREATE JOB (Unchanged) ---
export async function createJobAction(prevState: any, formData: FormData) {
  // ... (Your existing create logic here) ...
  // Keep the code you already have, I am omitting it here to save space
  return { success: false, message: "Use your existing create code here" }; 
}

// --- 4. AI GENERATOR (Unchanged) ---
export async function generateAiJobDescription(title: string, skills: string) {
    // ... (Your existing AI logic) ...
    return { success: false, description: "Use your existing AI code here" };
}

export async function updateJobAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // 1. Resolve Company ID (Security Check)
  let companyId = null;
  const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
  if (admin) companyId = admin.company_id;
  else {
    const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
    if (hrUser) companyId = hrUser.company_id;
  }

  if (!companyId) return { success: false, message: "Company not found." };

  // 2. Extract Data
  const jobId = formData.get("jobId") as string;
  const title = formData.get("title") as string;
  const department = formData.get("department") as string;
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  const salary = formData.get("salary") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  if (!jobId || !title || !description) return { success: false, message: "Missing required fields." };

  // 3. Update DB (Ensure the job belongs to the user's company)
  const { error } = await supabaseAdmin
    .from("jobs")
    .update({
      title,
      department,
      location,
      employment_type: type,
      salary_range: salary,
      description,
      status // active or closed
    })
    .eq("id", jobId)
    .eq("company_id", companyId); // Critical security clause

  if (error) return { success: false, message: error.message };

  revalidatePath("/hr-admin/jobs");
  revalidatePath(`/hr-admin/jobs/${jobId}`);
  redirect(`/hr-admin/jobs/${jobId}`);
}