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

// --- 1. GET JOBS (With Search) ---
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

// --- 2. GET SINGLE JOB (The Missing Function) ---
export async function getJobById(id: string) {
  const { data } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();
  
  return data;
}

// --- 3. CREATE JOB ---
export async function createJobAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  let companyId = null;
  const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
  if (admin) companyId = admin.company_id;
  else {
    const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
    if (hrUser) companyId = hrUser.company_id;
  }

  if (!companyId) return { success: false, message: "Company not found." };

  const title = formData.get("title") as string;
  const department = formData.get("department") as string;
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  const salary = formData.get("salary") as string;
  const description = formData.get("description") as string;

  if (!title || !description) return { success: false, message: "Title and Description are required." };

  const { error } = await supabaseAdmin.from("jobs").insert({
    company_id: companyId,
    title,
    department,
    location,
    employment_type: type,
    salary_range: salary,
    description,
    status: 'active'
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/hr-admin/jobs");
  redirect("/hr-admin/jobs");
}

// --- 4. UPDATE JOB ---
export async function updateJobAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  let companyId = null;
  const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
  if (admin) companyId = admin.company_id;
  else {
    const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
    if (hrUser) companyId = hrUser.company_id;
  }

  if (!companyId) return { success: false, message: "Company not found." };

  const jobId = formData.get("jobId") as string;
  const title = formData.get("title") as string;
  const department = formData.get("department") as string;
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  const salary = formData.get("salary") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  if (!jobId || !title || !description) return { success: false, message: "Missing required fields." };

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
    .eq("company_id", companyId);

  if (error) return { success: false, message: error.message };

  revalidatePath("/hr-admin/jobs");
  revalidatePath(`/hr-admin/jobs/${jobId}`);
  redirect(`/hr-admin/jobs/${jobId}`);
}

// --- 5. AI GENERATOR (Full Job Object) ---
export async function generateFullJobWithAI(userPrompt: string) {
  "use server";
  
  if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing.");
      return { success: false, message: "API Key missing." };
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert HR Manager. 
          Generate a professional job listing based on the user's rough input.
          
          Return a valid JSON object with EXACTLY these keys:
          - title (string)
          - department (string)
          - location (string)
          - employment_type (string): Full-time, Part-time, Contract, Internship
          - salary_range (string)
          - description (string): A complete Markdown description (About, Responsibilities, Requirements).
          
          Infer reasonable defaults for missing info.`
        },
        {
          role: "user",
          content: `Generate a job listing for: ${userPrompt}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const data = JSON.parse(content);
    return { success: true, data };

  } catch (error: any) {
    console.error("AI Error:", error);
    return { success: false, message: "Failed to generate job." };
  }
}

// --- 6. LEGACY AI SUPPORT (To prevent breaking other files) ---
export async function generateAiJobDescription(title: string, skills: string) {
    const result = await generateFullJobWithAI(`${title}. Skills: ${skills}`);
    if (result.success && result.data) {
        return { success: true, description: result.data.description };
    }
    return { success: false, message: result.message };
}