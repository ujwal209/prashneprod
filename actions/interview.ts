"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getInterviews() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("interviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function createInterviewAction(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: newInterview, error } = await supabase
    .from("interviews")
    .insert({
      user_id: user.id,
      job_title: data.jobTitle,
      job_description: data.jobDescription,
      difficulty: data.difficulty, // Enum: 'Friendly', 'Neutral', 'Ruthless'
      focus_areas: data.focusAreas,
      status: 'Ready'
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/candidate/interview");
  // Redirect to the actual session page (we'll build this later)
  // redirect(`/candidate/interview/${newInterview.id}/room`);
  return { success: true, id: newInterview.id };
}