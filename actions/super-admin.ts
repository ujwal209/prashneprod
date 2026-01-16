"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendHrInvitationEmail } from "@/lib/mail";
import { sendBroadcastEmail } from "@/lib/mail";

// Admin Client (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --- 1. GET DASHBOARD DATA (Fixed to include 'tiers') ---
export async function getSuperAdminData(searchQuery: string = "") {
  // Start the query
  let query = supabaseAdmin
    .from("companies")
    .select("*, hr_admins(count)")
    .order('created_at', { ascending: false });

  // Apply search filter if it exists
  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`);
  }

  const { data: companies } = await query;
  
  // Fetch other stats
  const { count: hrCount } = await supabaseAdmin.from("hr_users").select("*", { count: 'exact', head: true });
  const { count: candidateCount } = await supabaseAdmin.from("candidates").select("*", { count: 'exact', head: true });

  const allCompanies = companies || [];

  // --- CALCULATE TIERS (This was missing/undefined before) ---
  const tiers = {
    Starter: 0,
    Growth: 0,
    Pro: 0,
    Enterprise: 0
  };

  allCompanies.forEach(c => {
    if (c.hr_limit <= 3) tiers.Starter++;
    else if (c.hr_limit <= 5) tiers.Growth++;
    else if (c.hr_limit <= 10) tiers.Pro++;
    else tiers.Enterprise++;
  });

  return {
    companies: allCompanies,
    recentCompanies: allCompanies.slice(0, 5), // Top 5 for dashboard list
    tiers, // <--- Crucial: Passing the calculated tiers back
    stats: {
      totalCompanies: allCompanies.length,
      totalHrs: hrCount || 0,
      totalCandidates: candidateCount || 0
    }
  };
}

// --- 2. GET COMPANY OPTIONS ---
export async function getCompanyOptions() {
  const { data } = await supabaseAdmin.from("companies").select("id, name").order('name');
  return data || [];
}

// --- 3. CREATE COMPANY ---
export async function createCompanyAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const website = formData.get("website") as string;
  const hr_limit = parseInt(formData.get("hr_limit") as string) || 5;
  const logo_url = formData.get("logo_url") as string;
  const description = formData.get("description") as string;
  const industry = formData.get("industry") as string;
  const address = formData.get("address") as string;
  const contact_email = formData.get("contact_email") as string;
  const contact_phone = formData.get("contact_phone") as string;

  if (!name) return { success: false, message: "Company Name is required." };

  const { error } = await supabaseAdmin.from("companies").insert({
    name, website, hr_limit, logo_url, description, industry, address, contact_email, contact_phone
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/super-admin/companies");
  redirect("/super-admin/companies");
}

// --- 4. CREATE HR ADMIN ---
export async function createHrAdminAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const companyId = formData.get("companyId") as string;
  let password = formData.get("password") as string;
  
  if (!password) password = Math.random().toString(36).slice(-8) + "Aa1!";

  if (!email || !companyId) return { success: false, message: "Missing fields." };

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'hr_admin' }
  });

  if (authError) return { success: false, message: authError.message };

  const { error: dbError } = await supabaseAdmin.from("hr_admins").insert({
    id: authData.user.id,
    company_id: companyId,
    full_name: fullName,
    is_first_login: true
  });

  if (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { success: false, message: dbError.message };
  }

  try {
    await sendHrInvitationEmail(email, password, fullName);
  } catch (emailError) {
    console.error("Failed to send invite email:", emailError);
    return { success: true, message: "Admin created, but email failed. Send credentials manually." };
  }

  revalidatePath("/super-admin/users");
  redirect("/super-admin/users");
}

// --- 5. GET HR ADMINS LIST ---
export async function getHrAdminsList() {
  const { data } = await supabaseAdmin
    .from("hr_admins")
    .select("*, companies(name)")
    .order('created_at', { ascending: false });
  return data || [];
}

export async function sendPromotionAction(prevState: any, formData: FormData) {
  const target = formData.get("target") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!target || !subject || !message) {
    return { success: false, message: "All fields are required." };
  }

  let emails: string[] = [];

  try {
    // A. Fetch Candidates
    if (target === "candidates" || target === "all") {
      const { data } = await supabaseAdmin
        .from("candidates")
        .select("personal_email");
      
      if (data) emails.push(...data.map(c => c.personal_email));
    }

    // B. Fetch HRs (Admins & Users)
    // Since HR emails might not be in public tables, we fetch from Auth (limit 1000 for this demo)
    if (target === "hr" || target === "all") {
       const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
       
       const hrEmails = users
         .filter(u => u.user_metadata.role === 'hr_admin' || u.user_metadata.role === 'hr_user')
         .map(u => u.email)
         .filter((e): e is string => !!e); // Filter out nulls
       
       emails.push(...hrEmails);
    }

    // Remove duplicates
    emails = [...new Set(emails)];

    if (emails.length === 0) {
      return { success: false, message: "No users found for the selected group." };
    }

    // Convert newlines in message to HTML breaks
    const formattedMessage = message.replace(/\n/g, "<br/>");

    // Send Broadcast
    await sendBroadcastEmail(emails, subject, formattedMessage);

    return { success: true, message: `Campaign sent successfully to ${emails.length} users!` };

  } catch (error: any) {
    console.error("Broadcast Error:", error);
    return { success: false, message: "Failed to send broadcast." };
  }
}