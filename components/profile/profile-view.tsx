"use client";

import { useState } from "react";
import { 
  Briefcase, Calendar, Github, Linkedin, Globe, 
  Edit2, Camera, Flame, Trophy, Target, 
  CheckCircle2, Mail, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- ENVIRONMENT VARIABLES ---
// Ensure these are set in your .env.local file
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; 

interface ProfileViewProps {
  candidate: any;
  activityData: any[];
}

export function ProfileView({ candidate, activityData }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- Heatmap Logic ---
  const today = new Date();
  const heatmap = Array.from({ length: 365 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (364 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = activityData.filter(s => s.created_at.startsWith(dateStr)).length;
    
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2;
    if (count > 4) level = 3;
    if (count > 6) level = 4;
    
    return { date: dateStr, count, level };
  });

  // --- FIXED: Cloudinary Upload Handler ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check Config
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary config missing.");
      console.error("Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 

    try {
      // 2. Upload to Cloudinary
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }
      
      const data = await res.json();
      
      // 3. Construct Payload for Server Action
      // CRITICAL FIX: Map snake_case (DB) to camelCase (Server Action expected props)
      const payload = {
        fullName: candidate.full_name,
        personalEmail: candidate.personal_email,
        githubUrl: candidate.github_url,
        linkedinUrl: candidate.linkedin_url,
        portfolioUrl: candidate.portfolio_url,
        experienceYears: candidate.experience_years,
        currentJobTitle: candidate.current_job_title,
        targetJobTitle: candidate.target_job_title,
        primaryGoal: candidate.primary_goal,
        // Convert array back to comma-separated string for the action parser
        skills: Array.isArray(candidate.skills) ? candidate.skills.join(", ") : "",
        avatarUrl: data.secure_url // The new image URL
      };

      // 4. Save to Database
      const result = await updateProfile(payload);
      
      if (result?.error) throw new Error(result.error);

      toast.success("Profile picture updated!");
      // window.location.reload(); // Optional: Refresh to see change immediately if Next.js cache persists
    } catch (error: any) {
      console.error("Avatar Update Error:", error);
      toast.error(error.message || "Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  // --- Profile Save Handler ---
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Pass current avatarUrl to prevent it from being wiped if not in form
    const res = await updateProfile({ ...data, avatarUrl: candidate.avatar_url });
    
    if (res.success) {
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } else {
      toast.error("Error updating profile");
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative mb-20 md:mb-24">
        {/* Banner Gradient */}
        <div className="h-48 md:h-64 w-full rounded-b-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Profile Header (Floating) */}
        <div className="absolute -bottom-16 left-0 right-0 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
           
           <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white dark:border-black shadow-2xl bg-white dark:bg-zinc-900">
                  <AvatarImage src={candidate?.avatar_url} className="object-cover" />
                  <AvatarFallback className="text-5xl font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                    {candidate.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload Button */}
                <label className="absolute bottom-1 right-1 p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 border border-white/10">
                   {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                   <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              {/* Text Info */}
              <div className="mb-3 space-y-1.5 hidden md:block">
                 <h1 className="text-3xl font-bold text-white drop-shadow-md">
                    {candidate.full_name}
                 </h1>
                 <div className="flex items-center gap-2 text-indigo-100/90 font-medium">
                    <Briefcase className="size-4" />
                    <span>{candidate.current_job_title || "Software Engineer"}</span>
                 </div>
              </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-2 mr-2">
                {candidate.github_url && (
                   <a href={candidate.github_url} target="_blank" className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors border border-white/10"><Github className="size-5" /></a>
                )}
                {candidate.linkedin_url && (
                   <a href={candidate.linkedin_url} target="_blank" className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors border border-white/10"><Linkedin className="size-5" /></a>
                )}
                {candidate.portfolio_url && (
                   <a href={candidate.portfolio_url} target="_blank" className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors border border-white/10"><Globe className="size-5" /></a>
                )}
              </div>

              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button className="rounded-full h-10 px-6 bg-white text-zinc-900 hover:bg-indigo-50 border-0 font-medium shadow-lg transition-transform hover:scale-105">
                    <Edit2 className="size-4 mr-2" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-900 dark:text-zinc-100">Edit Profile</DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400">Update your professional details.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSave} className="grid gap-6 py-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
                          <Input name="fullName" defaultValue={candidate.full_name} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-700 dark:text-zinc-300">Experience (Years)</Label>
                          <Input name="experienceYears" defaultValue={candidate.experience_years} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-700 dark:text-zinc-300">Current Role</Label>
                          <Input name="currentJobTitle" defaultValue={candidate.current_job_title} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-700 dark:text-zinc-300">Target Role</Label>
                          <Input name="targetJobTitle" defaultValue={candidate.target_job_title} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-zinc-700 dark:text-zinc-300">Bio / Goal</Label>
                        <Textarea name="primaryGoal" defaultValue={candidate.primary_goal} className="resize-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-zinc-700 dark:text-zinc-300">Skills (Comma separated)</Label>
                        <Input name="skills" defaultValue={candidate.skills?.join(", ")} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-700 dark:text-zinc-300">GitHub URL</Label>
                          <Input name="githubUrl" defaultValue={candidate.github_url} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-700 dark:text-zinc-300">LinkedIn URL</Label>
                          <Input name="linkedinUrl" defaultValue={candidate.linkedin_url} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-700 dark:text-zinc-300">Portfolio URL</Label>
                          <Input name="portfolioUrl" defaultValue={candidate.portfolio_url} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                        </div>
                     </div>
                     <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Changes</Button>
                     </div>
                  </form>
                </DialogContent>
              </Dialog>
           </div>
        </div>
      </div>

      {/* --- MOBILE NAME (Visible only on small screens) --- */}
      <div className="md:hidden px-4 mb-8 text-center">
         <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {candidate.full_name}
         </h1>
         <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 mt-1">
            <Briefcase className="size-3.5" />
            <span className="text-sm">{candidate.current_job_title || "Software Engineer"}</span>
         </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 md:px-8">
        
        {/* LEFT COLUMN: Stats & About */}
        <div className="space-y-6">
           
           {/* Gamified Stats */}
           <div className="grid grid-cols-2 gap-4">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                 <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 mb-1">
                       <Flame className="size-6 fill-current animate-pulse" />
                    </div>
                    <div className="text-center">
                       <span className="text-2xl font-bold text-zinc-900 dark:text-white block">{candidate.streak_days}</span>
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Day Streak</span>
                    </div>
                 </CardContent>
              </Card>
              
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors">
                 <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                       <CheckCircle2 className="size-6" />
                    </div>
                    <div className="text-center">
                       <span className="text-2xl font-bold text-zinc-900 dark:text-white block">{candidate.problems_solved}</span>
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Solved</span>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* About Card */}
           <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-fit">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                 <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                 
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                          <Target className="size-4" />
                       </div>
                       <div>
                          <p className="text-xs text-zinc-500 font-medium uppercase">Primary Goal</p>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                             {candidate.primary_goal || "No goal set yet. Add one to stay focused!"}
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                          <Mail className="size-4" />
                       </div>
                       <div>
                          <p className="text-xs text-zinc-500 font-medium uppercase">Email</p>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{candidate.personal_email}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                          <Calendar className="size-4" />
                       </div>
                       <div>
                          <p className="text-xs text-zinc-500 font-medium uppercase">Joined</p>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">
                             {new Date(candidate.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Skills Section */}
                 <div>
                    <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase">Skills</p>
                    <div className="flex flex-wrap gap-2">
                       {candidate.skills?.length > 0 ? (
                          candidate.skills.map((skill: string) => (
                             <Badge key={skill} variant="secondary" className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-normal border border-zinc-200 dark:border-zinc-800">
                                {skill}
                             </Badge>
                          ))
                       ) : (
                          <span className="text-sm text-zinc-400 italic">No skills added.</span>
                       )}
                    </div>
                 </div>

              </CardContent>
           </Card>
        </div>

        {/* RIGHT COLUMN: Activity Graph */}
        <div className="lg:col-span-2 h-full">
           <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Contribution Activity</CardTitle>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                       <span>Less</span>
                       <div className="flex gap-1">
                          <div className="size-2.5 rounded-[2px] bg-zinc-100 dark:bg-zinc-800" />
                          <div className="size-2.5 rounded-[2px] bg-indigo-300 dark:bg-indigo-900" />
                          <div className="size-2.5 rounded-[2px] bg-indigo-500 dark:bg-indigo-700" />
                          <div className="size-2.5 rounded-[2px] bg-indigo-700 dark:bg-indigo-500" />
                       </div>
                       <span>More</span>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                 <div className="w-full overflow-x-auto pb-2">
                    <TooltipProvider delayDuration={0}>
                       <div className="flex flex-wrap gap-[3px] md:gap-1 content-start h-[160px] md:h-[200px] flex-col flex-wrap-reverse">
                          <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                             {heatmap.map((day, i) => (
                                <Tooltip key={i}>
                                   <TooltipTrigger asChild>
                                      <div 
                                         className={cn(
                                            "size-[10px] md:size-3 rounded-[2px] transition-all hover:scale-125 cursor-help",
                                            day.level === 0 ? "bg-zinc-100 dark:bg-zinc-900" : 
                                            day.level === 1 ? "bg-indigo-200 dark:bg-indigo-900" :
                                            day.level === 2 ? "bg-indigo-400 dark:bg-indigo-700" : 
                                            day.level === 3 ? "bg-indigo-600 dark:bg-indigo-500" : 
                                            "bg-indigo-800 dark:bg-indigo-400"
                                         )}
                                      />
                                   </TooltipTrigger>
                                   <TooltipContent className="text-xs bg-zinc-900 text-white dark:bg-white dark:text-black border-0">
                                      {day.count} submissions on {day.date}
                                   </TooltipContent>
                                </Tooltip>
                             ))}
                          </div>
                       </div>
                    </TooltipProvider>
                 </div>
                 
                 <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Achievements</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-lg">
                             <Trophy className="size-4" />
                          </div>
                          <div>
                             <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Early Adopter</p>
                             <p className="text-xs text-zinc-500">Joined the platform in 2025</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                          <div className="p-2 bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-500 rounded-lg">
                             <Target className="size-4" />
                          </div>
                          <div>
                             <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Goal Setter</p>
                             <p className="text-xs text-zinc-500">Defined a target career path</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}