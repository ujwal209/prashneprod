import { createClient } from "@/utils/supabase/server";
import { ProfileView } from "@/components/profile/profile-view";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch Candidate Data
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch Submission Stats for the Activity Graph
  const { data: submissions } = await supabase
    .from("submissions")
    .select("created_at")
    .eq("user_id", user.id);

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 md:px-6">
      <ProfileView 
        candidate={candidate} 
        activityData={submissions || []} 
      />
    </div>
  );
}