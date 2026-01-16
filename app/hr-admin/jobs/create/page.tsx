"use client";

import { useActionState, useState } from "react";
import { createJobAction, generateAiJobDescription } from "@/actions/hr-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  const [state, formAction, isPending] = useActionState(createJobAction, { message: "" });
  
  // AI State
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // --- HANDLER: AI GENERATION ---
  const handleAiGenerate = async () => {
    if (!jobTitle) {
        alert("Please enter a Job Title first."); 
        return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateAiJobDescription(jobTitle, skills);
      
      if (result.success && result.description) {
        setDescription(result.description);
      } else {
        alert(result.message || "Failed to generate description.");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong with the AI generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <Link href="/hr-admin/jobs" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-4 transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          Post a New Job
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Create a detailed job listing to attract the best candidates.
        </p>
      </div>

      {/* --- MAIN FORM --- */}
      <form action={formAction} className="bg-white dark:bg-[#09090b] p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
        
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-semibold">Job Title <span className="text-red-500">*</span></Label>
          <Input 
            id="title"
            name="title" 
            placeholder="e.g. Senior React Developer" 
            required 
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="h-12 text-base bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-black transition-all"
          />
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" name="department" placeholder="e.g. Engineering" className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-black transition-all" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="e.g. Remote / New York" className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-black transition-all" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type">Employment Type</Label>
            <Select name="type" defaultValue="Full-time">
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
            <Input id="salary" name="salary" placeholder="e.g. $80k - $120k" className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-black transition-all" />
          </div>
        </div>

        {/* AI CONTEXT INPUT (Client Only, not sent to DB) */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Label className="text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-2 text-base">
              <Sparkles size={18} className="text-indigo-500" /> 
              AI Description Generator
            </Label>
            <Button 
              type="button" 
              onClick={handleAiGenerate}
              disabled={isGenerating || !jobTitle}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/20 transition-all disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Description"}
            </Button>
          </div>
          
          <div className="relative">
              <Input 
                placeholder="Required Skills (e.g. React, Node.js, Leadership)" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="bg-white/80 dark:bg-black/40 border-indigo-200 dark:border-indigo-800 h-11 text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-2 font-medium">
                Enter the job title above, add skills here, and click Generate.
              </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">Job Description <span className="text-red-500">*</span></Label>
          <Textarea 
            id="description"
            name="description" 
            placeholder="Describe the role, responsibilities, and requirements..." 
            required 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[400px] bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 leading-relaxed font-mono text-sm focus:bg-white dark:focus:bg-black transition-all resize-y"
          />
        </div>

        {/* Error Message */}
        {state?.message && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
            {state.message}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full h-12 text-base font-medium bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-500/10 dark:shadow-none"
          >
            {isPending ? (
                <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Publishing...
                </>
            ) : (
                "Publish Job Listing"
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}