"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Safety check: Ensure skills is a string before splitting
  const skillsString = (formData.skills as string) || "";
  const skillsArray = skillsString
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0); // Remove empty strings

  const { error } = await supabase
    .from("candidates")
    .update({
      full_name: formData.fullName,
      current_job_title: formData.currentJobTitle,
      target_job_title: formData.targetJobTitle,
      experience_years: formData.experienceYears,
      primary_goal: formData.primaryGoal,
      github_url: formData.githubUrl,
      linkedin_url: formData.linkedinUrl,
      portfolio_url: formData.portfolioUrl,
      skills: skillsArray, // Use the safely processed array
      avatar_url: formData.avatarUrl,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/candidate/profile");
  return { success: true };
}