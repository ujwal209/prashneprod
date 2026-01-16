"use server";

import { createClient } from "@supabase/supabase-js";

export async function getCandidateProfile(userId: string) {
  try {
    // Initialize Supabase Admin Client
    // Ensure you have these in your .env.local file
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const { data, error } = await supabaseAdmin
      .from("candidates")
      .select("avatar_url, full_name")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}