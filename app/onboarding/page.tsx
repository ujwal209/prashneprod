"use client";

import { useState } from "react";
import { useActionState } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import { 
  Loader2, Briefcase, Code, Zap, User, Star, Check, ChevronsUpDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>
};

// Common roles for quick selection
const frameworks = [
  { value: "frontend developer", label: "Frontend Developer" },
  { value: "backend developer", label: "Backend Developer" },
  { value: "full stack developer", label: "Full Stack Developer" },
  { value: "devops engineer", label: "DevOps Engineer" },
  { value: "mobile developer", label: "Mobile Developer" },
  { value: "data scientist", label: "Data Scientist" },
  { value: "ai/ml engineer", label: "AI/ML Engineer" },
  { value: "product manager", label: "Product Manager" },
  { value: "ui/ux designer", label: "UI/UX Designer" },
];

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(completeOnboarding, initialState);

  // Form State
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");
  
  // Combobox State
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-5">
      
      {/* --- LEFT COLUMN (Visual Context) --- */}
      <div className="hidden lg:col-span-2 lg:flex flex-col justify-between bg-zinc-900 text-white p-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950" />
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
               <div className="p-2 bg-white/10 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-400" />
               </div>
               <span className="font-semibold tracking-wide uppercase text-xs text-zinc-400">Profile Setup</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
               Let's build your <br />
               <span className="text-indigo-400">Personal Roadmap</span>
            </h1>
            <p className="text-zinc-400 leading-relaxed max-w-sm">
               We use these details to curate specific LeetCode patterns and system design problems that match your target role.
            </p>
         </div>

         {/* Dynamic "ID Card" Preview */}
         <div className="relative z-10 mt-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl transition-all duration-500">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-lg font-bold shadow-inner">
                     <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                     <div className="text-sm text-zinc-400 uppercase tracking-wider font-semibold">User Profile</div>
                     <div className="text-white font-medium">Candidate</div>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                     <span className="text-zinc-400">Target Role</span>
                     <span className={cn("font-semibold transition-all capitalize", targetRole ? "text-indigo-300" : "text-zinc-600")}>
                        {targetRole || "---"}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                     <span className="text-zinc-400">Experience</span>
                     <span className={cn("font-semibold transition-all", experience ? "text-emerald-300" : "text-zinc-600")}>
                        {experience ? `${experience} Years` : "---"}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-zinc-400">Focus</span>
                     <span className={cn("font-semibold transition-all", goal ? "text-amber-300" : "text-zinc-600")}>
                        {goal || "---"}
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* --- RIGHT COLUMN (Form Area) --- */}
      <div className="col-span-3 bg-zinc-50 dark:bg-black flex flex-col justify-center py-12 px-6 md:px-12 lg:px-24 overflow-y-auto">
         <div className="max-w-2xl mx-auto w-full">
            
            <div className="mb-8 lg:hidden">
               <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Profile Setup</h1>
               <p className="text-zinc-500">Customize your learning experience.</p>
            </div>

            <form action={formAction} className="space-y-10">
               
               {/* 1. EXPERIENCE */}
               <div className="space-y-4">
                  <Label className="text-base font-semibold text-zinc-900 dark:text-white">
                     Years of Professional Experience
                  </Label>
                  <input type="hidden" name="experience_years" value={experience} />
                  <div className="grid grid-cols-4 gap-3">
                     {["0", "1-3", "3-5", "5+"].map((exp) => (
                        <div
                           key={exp}
                           onClick={() => setExperience(exp)}
                           className={cn(
                              "cursor-pointer flex flex-col items-center justify-center py-3 rounded-lg border transition-all duration-200",
                              experience === exp
                                 ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-600 dark:ring-indigo-400"
                                 : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                           )}
                        >
                           <span className="font-bold text-lg">{exp}</span>
                        </div>
                     ))}
                  </div>
                  {state?.errors?.experience_years && <p className="text-sm text-red-500">{state.errors.experience_years[0]}</p>}
               </div>

               {/* 2. ROLE SELECTION (Combobox) */}
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <Label className="text-base font-semibold">Current Job Title</Label>
                     <Input 
                        name="current_job_title" 
                        placeholder="e.g. Student" 
                        className="h-12 bg-white dark:bg-zinc-900"
                        required
                     />
                     {state?.errors?.current_job_title && <p className="text-sm text-red-500">{state.errors.current_job_title[0]}</p>}
                  </div>
                  
                  <div className="space-y-3 flex flex-col">
                     <Label className="text-base font-semibold">Target Role</Label>
                     {/* Hidden input to submit the value */}
                     <input type="hidden" name="target_job_title" value={targetRole} />
                     
                     <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                           <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="h-12 w-full justify-between bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                           >
                              {targetRole
                                 ? (frameworks.find((framework) => framework.value === targetRole.toLowerCase())?.label || targetRole)
                                 : "Select or type role..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                           <Command>
                              <CommandInput placeholder="Search or type custom role..." />
                              <CommandList>
                                 <CommandEmpty>
                                     <button 
                                        className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                        onClick={() => {
                                           // Allow user to set what they typed as the value
                                           const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
                                           if (input?.value) {
                                              setTargetRole(input.value);
                                              setOpen(false);
                                           }
                                        }}
                                     >
                                        Use custom: <span className="font-bold">"Typing..."</span>
                                     </button>
                                 </CommandEmpty>
                                 <CommandGroup heading="Suggestions">
                                    {frameworks.map((framework) => (
                                       <CommandItem
                                          key={framework.value}
                                          value={framework.value}
                                          onSelect={(currentValue) => {
                                             setTargetRole(framework.label); // Set the display label
                                             setOpen(false);
                                          }}
                                       >
                                          <Check
                                             className={cn(
                                                "mr-2 h-4 w-4",
                                                targetRole.toLowerCase() === framework.value ? "opacity-100" : "opacity-0"
                                             )}
                                          />
                                          {framework.label}
                                       </CommandItem>
                                    ))}
                                 </CommandGroup>
                              </CommandList>
                           </Command>
                        </PopoverContent>
                     </Popover>
                     {state?.errors?.target_job_title && <p className="text-sm text-red-500">{state.errors.target_job_title[0]}</p>}
                  </div>
               </div>

               {/* 3. PRIMARY GOAL */}
               <div className="space-y-4">
                  <Label className="text-base font-semibold">Primary Goal</Label>
                  <input type="hidden" name="primary_goal" value={goal} />
                  <div className="grid md:grid-cols-2 gap-4">
                     {[
                        { value: "Interview Prep", icon: Briefcase, title: "Crack Interviews", desc: "Focus on DSA patterns." },
                        { value: "Upskilling", icon: Code, title: "Learn & Build", desc: "Focus on frameworks." }
                     ].map((item) => (
                        <div
                           key={item.value}
                           onClick={() => setGoal(item.value)}
                           className={cn(
                              "cursor-pointer flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900",
                              goal === item.value
                                 ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-600 dark:ring-indigo-400"
                                 : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                           )}
                        >
                           <div className={cn("p-2 rounded-lg", goal === item.value ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500")}>
                              <item.icon className="h-5 w-5" />
                           </div>
                           <div>
                              <div className="font-semibold text-zinc-900 dark:text-white">{item.title}</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</div>
                           </div>
                        </div>
                     ))}
                  </div>
                  {state?.errors?.primary_goal && <p className="text-sm text-red-500">{state.errors.primary_goal[0]}</p>}
               </div>

               {/* MESSAGE & BUTTON */}
               {state?.message && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                     <Star className="h-4 w-4" /> {state.message}
                  </div>
               )}

               <div className="pt-4">
                  <Button 
                     type="submit" 
                     className="w-full h-14 text-lg font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                     disabled={isPending}
                  >
                     {isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing...</>
                     ) : (
                        "Complete Profile"
                     )}
                  </Button>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
}