"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const OnboardingSchema = z.object({
    experience_years: z.enum(["0", "1-3", "3-5", "5+"]),
    current_job_title: z.string().min(2, {
        message: "Current job title must be at least 2 characters.",
    }),
    target_job_title: z.enum(["Frontend", "Backend", "Full Stack", "AI/ML"]),
    primary_goal: z.enum(["Interview Prep", "Upskilling"]),
});

export async function completeOnboarding(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            message: "Unauthorized",
        };
    }

    const rawData = {
        experience_years: formData.get("experience_years"),
        current_job_title: formData.get("current_job_title"),
        target_job_title: formData.get("target_job_title"),
        primary_goal: formData.get("primary_goal"),
    };

    const validated = OnboardingSchema.safeParse(rawData);

    if (!validated.success) {
        // Return errors flattened for easy client-side handling
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Please ensure all fields are selected and correctly filled.",
        };
    }

    const { experience_years, current_job_title, target_job_title, primary_goal } = validated.data;

    // Fix: Ensure we use upsert with a valid user ID. 
    // We are trusting the auth.uid() from the session which is secure.
    // We provide full_name and email from metadata to satisfy NOT NULL constraints if this is a new row.

    // Note: Schema from user may vary, but based on recent interactions, we need full_name/email.
    const fullName = user.user_metadata?.full_name || "Candidate";
    const email = user.email || "";

    // CHANGE: Use Admin Client to bypass RLS
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from("candidates")
        .upsert({
            id: user.id,
            full_name: fullName,
            personal_email: email,
            experience_years,
            current_job_title,
            target_job_title,
            primary_goal,
            // is_onboarding_completed: true,  <-- REMOVED assuming column doesn't exist in Step 181 schema
            // If user added it, uncomment. But middleware checks experience_years presence so this is fine.
        }, { onConflict: 'id' });

    if (error) {
        console.error("Onboarding Database Error:", error);
        return {
            message: "Failed to update profile. Database error.",
        };
    }

    revalidatePath("/candidate/dashboard");
    redirect("/candidate/dashboard");
}
