"use client";

import { useActionState, useState } from "react";
import { updateJobAction, generateAiJobDescription } from "@/actions/hr-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ArrowLeft, Wand2, Save } from "lucide-react";
import Link from "next/link";

export function EditJobForm({ job }: { job: any }) {
  const [state, formAction, isPending] = useActionState(updateJobAction, { message: "" });

  // Initialize state with existing data
  const [jobTitle, setJobTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  
  // AI State
  const [skills, setSkills] = useState(""); 
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!jobTitle) return alert("Please ensure Job Title is set.");
    
    // Confirm before overwriting existing description
    if (description.length > 50 && !confirm("This will overwrite the current description. Continue?")) {
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAiJobDescription(jobTitle, skills);
      if (result.success && result.description) {
        setDescription(result.description);
      } else {
        alert(result.message);
      }
    } catch (e) {
      console.error(e);
      alert("AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <Link href={`/hr-admin/jobs/${job.id}`} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-4 transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Job Details
        </Link>
        
        {/* Responsive Header Container */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Edit Job Listing
                </h1>
                <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-1 md:mt-2">
                Update job details, status, or description.
                </p>
            </div>
            
            {/* Status Badge - Now visible and stacked on mobile */}
            <div className="self-start sm:self-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    job.status === 'active' 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                }`}>
                    Current Status: {job.status}
                </span>
            </div>
        </div>
      </div>

      <form action={formAction} className="bg-white dark:bg-[#09090b] p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 md:space-y-8">
        
        {/* Hidden ID field for the server action */}
        <input type="hidden" name="jobId" value={job.id} />

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-semibold">Job Title</Label>
          <Input 
            id="title"
            name="title" 
            required 
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="h-11 md:h-12 text-base bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-black transition-all"
          />
        </div>

        {/* Row 1 - Stacks on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" name="department" defaultValue={job.department} className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={job.location} className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800" />
          </div>
        </div>

        {/* Row 2 - Stacks on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="type">Employment Type</Label>
            <Select name="type" defaultValue={job.employment_type || "Full-time"}>
              <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input id="salary" name="salary" defaultValue={job.salary_range} className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800" />
          </div>
        </div>

        {/* Status Selector */}
        <div className="space-y-2">
            <Label htmlFor="status">Listing Status</Label>
            <Select name="status" defaultValue={job.status || "active"}>
              <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (Visible to Candidates)</SelectItem>
                <SelectItem value="closed">Closed (Hidden)</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* AI Generator Box - Responsive Padding & Layout */}
        <div className="relative overflow-hidden p-4 md:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Label className="text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-2 text-base">
              <Sparkles size={18} className="text-indigo-500" /> 
              Regenerate Description
            </Label>
            <Button 
              type="button" 
              onClick={handleAiGenerate}
              disabled={isGenerating || !jobTitle}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20 transition-all disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {isGenerating ? "Rewriting..." : "Rewrite with AI"}
            </Button>
          </div>
          
          <div className="relative">
              <Input 
                placeholder="Add new skills to focus on..." 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="bg-white/80 dark:bg-black/40 border-indigo-200 dark:border-indigo-800 h-11 text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">Job Description</Label>
          <Textarea 
            id="description"
            name="description" 
            required 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            // Adjusted min-height for mobile vs desktop
            className="min-h-[250px] md:min-h-[400px] bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 leading-relaxed font-mono text-sm focus:bg-white dark:focus:bg-black transition-all resize-y"
          />
        </div>

        {/* Error Message */}
        {state?.message && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
            {state.message}
          </div>
        )}

        {/* Actions - Stacks reverse on mobile for better thumb reach */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <Link href={`/hr-admin/jobs/${job.id}`} className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full sm:w-32 h-11 md:h-12">Cancel</Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full sm:w-auto sm:min-w-[160px] h-11 md:h-12 text-base font-medium bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg"
          >
            {isPending ? (
                <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Saving...
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}