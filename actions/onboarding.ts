"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// Define schema with looser validation for the role
const OnboardingSchema = z.object({
  experience_years: z.string().min(1, "Please select your experience level."),
  current_job_title: z.string().min(2, "Job title is required."),
  
  // FIX: Remove .enum() or .refine() and just use .min(2)
  // This allows "Frontend" OR "Custom Role" OR anything else
  target_job_title: z.string().min(2, "Target role is required."),
  
  primary_goal: z.string().min(1, "Please select a primary goal."),
});

export async function completeOnboarding(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Unauthorized" };

  // 2. Extract Data
  const rawData = {
    experience_years: formData.get("experience_years"),
    current_job_title: formData.get("current_job_title"),
    target_job_title: formData.get("target_job_title"),
    primary_goal: formData.get("primary_goal"),
  };

  // 3. Validate
  const validatedFields = OnboardingSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fill in all required fields.",
    };
  }

  // 4. Update Database
  const { error } = await supabase
    .from("candidates")
    .update({
      experience_years: validatedFields.data.experience_years,
      current_job_title: validatedFields.data.current_job_title,
      target_job_title: validatedFields.data.target_job_title,
      primary_goal: validatedFields.data.primary_goal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Onboarding Error:", error);
    return { message: "Failed to save profile. Please try again." };
  }

  // 5. Redirect
  redirect("/candidate/dashboard");
}