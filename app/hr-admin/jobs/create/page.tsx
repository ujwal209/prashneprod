"use client";

import { useActionState, useState } from "react";
import { createJobAction, generateFullJobWithAI } from "@/actions/hr-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ArrowLeft, Wand2, Eye, Edit3 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function CreateJobPage() {
  const [state, formAction, isPending] = useActionState(createJobAction, { message: "" });
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Form State
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [empType, setEmpType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // --- HANDLER: MAGIC AI FILL ---
  const handleMagicGenerate = async () => {
    if (!aiPrompt.trim()) {
        alert("Please enter a few keywords first (e.g. 'Senior React Dev, 150k, Remote')");
        return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateFullJobWithAI(aiPrompt);
      
      if (result.success && result.data) {
        setJobTitle(result.data.title || "");
        setDepartment(result.data.department || "");
        setLocation(result.data.location || "");
        setEmpType(result.data.employment_type || "Full-time");
        setSalary(result.data.salary_range || "");
        setDescription(result.data.description || "");
        
        // Auto-switch to preview to show off the result
        setActiveTab("preview"); 
      } else {
        alert(result.message || "Failed to generate. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full min-h-screen pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <Link href="/hr-admin/jobs" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 mb-2 transition-colors w-fit">
            <ArrowLeft size={14} /> Back to Jobs
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Post New Job</h1>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg self-start md:self-auto">
            <button 
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
                <Edit3 size={14} /> Edit
            </button>
            <button 
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
                <Eye size={14} /> Preview
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT COLUMN (FORM) --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* AI MAGIC BOX */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-indigo-600 dark:text-indigo-400 h-5 w-5" />
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Magic Auto-Fill</h3>
                </div>
                <div className="flex gap-2">
                    <Input 
                        placeholder="e.g. 'Senior Java Dev, 5 yrs exp, Hybrid, 120k'" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="bg-white dark:bg-black/50 border-indigo-200 dark:border-indigo-800 focus:ring-indigo-500/30"
                        onKeyDown={(e) => e.key === "Enter" && handleMagicGenerate()}
                    />
                    <Button 
                        onClick={handleMagicGenerate} 
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                    >
                        {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                        <span className="hidden sm:inline ml-2">Generate</span>
                    </Button>
                </div>
                <p className="text-xs text-indigo-600/70 dark:text-indigo-400/60 mt-2">
                    Tip: Enter a rough idea, and AI will fill the title, salary, and description for you.
                </p>
            </div>

            {/* MAIN FORM */}
            <form action={formAction} id="job-form" className={`space-y-6 ${activeTab === 'preview' ? 'hidden' : 'block'}`}>
                
                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                        <Input 
                            id="title" name="title" required 
                            value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Product Manager"
                            className="text-lg font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" name="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Design" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Employment Type</Label>
                            <Select name="type" value={empType} onValueChange={setEmpType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Hidden input for form submission if Select doesn't pass properly in some setups */}
                            <input type="hidden" name="type" value={empType} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary">Salary Range</Label>
                            <Input id="salary" name="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. $80k - $100k" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                            <span className="text-xs text-zinc-400">Markdown supported</span>
                        </div>
                        <Textarea 
                            id="description" name="description" required 
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed job description..."
                            className="min-h-[400px] font-mono text-sm leading-relaxed"
                        />
                    </div>
                </div>

                {state?.message && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                        {state.message}
                    </div>
                )}
            </form>

            {/* PREVIEW TAB CONTENT */}
            {activeTab === 'preview' && (
                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-6">
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{jobTitle || "Untitled Job"}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">🏢 {department || "General"}</span>
                            <span className="flex items-center gap-1">📍 {location || "Remote"}</span>
                            <span className="flex items-center gap-1">💼 {empType}</span>
                            <span className="flex items-center gap-1">💰 {salary || "Competitive"}</span>
                        </div>
                    </div>
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                         {description ? (
                            <ReactMarkdown>{description}</ReactMarkdown>
                         ) : (
                            <p className="text-zinc-400 italic">No description entered yet.</p>
                         )}
                    </div>
                </div>
            )}
        </div>

        {/* --- RIGHT COLUMN (ACTIONS) --- */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm sticky top-6">
                <h3 className="font-semibold text-lg mb-4">Publishing</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                        <span>Status</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Active</span>
                    </div>
                    <div className="text-xs text-zinc-400">
                        This job will be immediately visible on your careers board once published.
                    </div>
                    
                    <Button 
                        onClick={() => {
                            // Trigger the hidden form submit
                            const form = document.getElementById('job-form') as HTMLFormElement;
                            if(form) form.requestSubmit();
                        }} 
                        disabled={isPending} 
                        className="w-full h-12 text-base bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Publishing...
                            </>
                        ) : (
                            "Publish Now"
                        )}
                    </Button>

                    <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <h4 className="font-medium text-sm mb-2">Checklist</h4>
                <ul className="space-y-2 text-xs text-zinc-500">
                    <li className="flex gap-2">
                        <span className={jobTitle ? "text-green-500" : "text-zinc-300"}>✔</span> Title
                    </li>
                    <li className="flex gap-2">
                        <span className={description.length > 50 ? "text-green-500" : "text-zinc-300"}>✔</span> Description ({description.length} chars)
                    </li>
                    <li className="flex gap-2">
                        <span className={salary ? "text-green-500" : "text-zinc-300"}>✔</span> Salary Range
                    </li>
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
}