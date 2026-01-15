"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, Check, Briefcase, 
  Code2, Users, CheckCircle2, Loader2, Plus, 
  Search, Sparkles, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createInterviewAction } from "@/actions/interview";
import { toast } from "sonner";
import Link from "next/link";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

// --- REAL WORLD API SERVICE (Datamuse) ---
const JobService = {
  // 1. Job Titles Autocomplete
  searchTitles: async (query: string) => {
    if (!query) return [];
    try {
      // 'ml' means "means like" - good for finding related concepts
      // 's' means "starts with" - standard autocomplete
      const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=6`);
      const data = await res.json();
      return data.map((item: any) => 
        item.word.charAt(0).toUpperCase() + item.word.slice(1)
      );
    } catch (e) {
      return [];
    }
  },
  
  // 2. Skills Autocomplete
  searchSkills: async (query: string) => {
    if (!query) return [];
    try {
      const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=6`);
      const data = await res.json();
      // Filter out very short words to reduce noise
      return data
        .filter((item: any) => item.word.length > 2)
        .map((item: any) => item.word.charAt(0).toUpperCase() + item.word.slice(1));
    } catch (e) {
      return [];
    }
  },

  // 3. Contextual Suggestions (Mock logic for "Smart" feel)
  getSuggestedSkillsForRole: async (role: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const r = role.toLowerCase();
    if (r.includes("front") || r.includes("react") || r.includes("web")) return ["React", "TypeScript", "Tailwind CSS", "Next.js", "Redux"];
    if (r.includes("back") || r.includes("node") || r.includes("api")) return ["Node.js", "PostgreSQL", "Redis", "Docker", "Microservices"];
    if (r.includes("data") || r.includes("python")) return ["Python", "Pandas", "SQL", "PyTorch", "AWS"];
    if (r.includes("java") || r.includes("spring")) return ["Java", "Spring Boot", "Hibernate", "Kafka", "System Design"];
    return ["Git", "Agile", "Communication", "Problem Solving", "JIRA"];
  }
};

const STEPS = [
  { id: 1, title: "Target Role", icon: Briefcase },
  { id: 2, title: "Tech Stack", icon: Code2 },
  { id: 3, title: "Persona", icon: Users },
  { id: 4, title: "Review", icon: Check },
];

export default function NewInterviewWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    skills: [] as string[],
    focusAreas: [] as string[],
    difficulty: 50,
    companyStyle: "faang"
  });

  // --- AUTOCOMPLETE STATES ---
  const [jobQuery, setJobQuery] = useState("");
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [openJobCombobox, setOpenJobCombobox] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const [skillQuery, setSkillQuery] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [openSkillCombobox, setOpenSkillCombobox] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  
  // Contextual skills (displayed as "Recommended")
  const [contextualSkills, setContextualSkills] = useState<string[]>([]);

  // --- EFFECT: Job Search ---
  useEffect(() => {
    const fetchJobs = async () => {
      if (jobQuery.length > 1) {
        setIsLoadingJobs(true);
        const results = await JobService.searchTitles(jobQuery);
        setJobSuggestions(results);
        setIsLoadingJobs(false);
      } else {
        setJobSuggestions([]);
      }
    };
    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [jobQuery]);

  // --- EFFECT: Skill Search ---
  useEffect(() => {
    const fetchSkills = async () => {
      if (skillQuery.length > 1) {
        setIsLoadingSkills(true);
        const results = await JobService.searchSkills(skillQuery);
        setSkillSuggestions(results);
        setIsLoadingSkills(false);
      } else {
        setSkillSuggestions([]);
      }
    };
    const timer = setTimeout(fetchSkills, 300);
    return () => clearTimeout(timer);
  }, [skillQuery]);

  // --- EFFECT: Fetch Contextual Skills when Step 2 loads ---
  useEffect(() => {
    if (currentStep === 2 && formData.jobTitle && contextualSkills.length === 0) {
      JobService.getSuggestedSkillsForRole(formData.jobTitle).then(setContextualSkills);
    }
  }, [currentStep, formData.jobTitle]);

  // --- HANDLERS ---
  const handleNext = () => {
    if (currentStep === 1 && !formData.jobTitle) return toast.error("Please select a job title");
    if (currentStep === 2 && formData.skills.length === 0) return toast.error("Select at least one skill");
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setSkillQuery("");
    setOpenSkillCombobox(false);
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const difficultyLabel = formData.difficulty < 33 ? "Friendly" : formData.difficulty < 66 ? "Neutral" : "Ruthless";
    
    const result = await createInterviewAction({
      jobTitle: formData.jobTitle,
      jobDescription: formData.jobDescription,
      difficulty: difficultyLabel,
      focusAreas: [...formData.skills, ...formData.focusAreas, `Style: ${formData.companyStyle}`]
    });

    if (result.success) {
      toast.success("Interview generated!");
      router.push(`/candidate/interview`);
    } else {
      toast.error("Failed to create session");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 sm:px-0">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-4 pt-6">
        <Link href="/candidate/interview">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ArrowLeft className="size-5 text-zinc-500" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">New Simulation</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Configure your AI interviewer context.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex justify-between relative px-2">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -z-10 transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }} 
          />

          {STEPS.map((step) => {
            const isActive = step.id <= currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-zinc-50 dark:bg-black px-2">
                <div 
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                    isActive 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                  )}
                >
                  {isActive ? <Check className="size-4" /> : step.id}
                </div>
                <span className={cn("text-[10px] uppercase tracking-wider font-semibold", isActive ? "text-indigo-600" : "text-zinc-400")}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* --- STEP 1: TARGET ROLE --- */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Target Job Title</label>
                
                <Popover open={openJobCombobox} onOpenChange={setOpenJobCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openJobCombobox}
                      className="w-full justify-between bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-12 text-base px-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left"
                    >
                      <span className={formData.jobTitle ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-500"}>
                        {formData.jobTitle || "Select or type your role..."}
                      </span>
                      <Briefcase className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false} className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                      <CommandInput 
                        placeholder="Search API (e.g. React Developer)..." 
                        value={jobQuery}
                        onValueChange={setJobQuery}
                        className="h-11"
                      />
                      <CommandList>
                        {isLoadingJobs && (
                           <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
                              <Loader2 className="size-4 animate-spin mr-2" /> Searching...
                           </div>
                        )}
                        
                        <CommandGroup heading="Suggestions">
                            {jobSuggestions.map((job) => (
                              <CommandItem
                                key={job}
                                value={job}
                                onSelect={(val) => {
                                  setFormData({ ...formData, jobTitle: job }); // use 'job' directly for correct casing
                                  setOpenJobCombobox(false);
                                  setJobQuery("");
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.jobTitle === job ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {job}
                              </CommandItem>
                            ))}
                        </CommandGroup>

                        {/* Custom Create Option */}
                        {jobQuery.length > 0 && (
                           <CommandGroup heading="Custom">
                              <CommandItem
                                onSelect={() => {
                                    setFormData({ ...formData, jobTitle: jobQuery });
                                    setOpenJobCombobox(false);
                                    setJobQuery("");
                                }}
                                className="text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
                              >
                                <Plus className="mr-2 size-4" />
                                Create "{jobQuery}"
                              </CommandItem>
                           </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Job Description (Optional)</label>
                <Textarea 
                  placeholder="Paste the Job Description here. The AI will extract key requirements to tailor the interview..."
                  className="min-h-[150px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 resize-none text-sm focus-visible:ring-indigo-500"
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- STEP 2: TECH STACK & SKILLS --- */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Tech Stack & Skills
                </label>
                
                {/* 1. Selected Skills List */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-indigo-900 dark:hover:text-indigo-100">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-sm text-zinc-400 italic">No skills selected yet.</span>
                  )}
                </div>

                {/* 2. API Skill Search Combobox */}
                <Popover open={openSkillCombobox} onOpenChange={setOpenSkillCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSkillCombobox}
                      className="w-full justify-between bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">Search skills (e.g. JavaScript, AWS)...</span>
                      <Search className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false} className="bg-white dark:bg-zinc-950">
                      <CommandInput 
                        placeholder="Type skill name..." 
                        value={skillQuery}
                        onValueChange={setSkillQuery}
                        className="h-11"
                      />
                      <CommandList>
                        {isLoadingSkills && (
                           <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
                              <Loader2 className="size-4 animate-spin mr-2" /> Finding skills...
                           </div>
                        )}
                        
                        <CommandGroup heading="API Suggestions">
                            {skillSuggestions.map((skill) => (
                              <CommandItem
                                key={skill}
                                value={skill}
                                onSelect={() => addSkill(skill)}
                                className="cursor-pointer"
                              >
                                <Plus className="mr-2 h-4 w-4 opacity-50" />
                                {skill}
                              </CommandItem>
                            ))}
                        </CommandGroup>

                        {skillQuery.length > 0 && (
                           <CommandGroup heading="Custom">
                              <CommandItem
                                onSelect={() => addSkill(skillQuery)}
                                className="text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
                              >
                                <Plus className="mr-2 size-4" />
                                Add "{skillQuery}"
                              </CommandItem>
                           </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* 3. Smart Recommendations */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                    Recommended for {formData.jobTitle || "your role"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {contextualSkills.length > 0 ? contextualSkills.map((skill) => {
                      const isSelected = formData.skills.includes(skill);
                      if (isSelected) return null; // Don't show if already added
                      return (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-zinc-900"
                          onClick={() => addSkill(skill)}
                        >
                          + {skill}
                        </Badge>
                      )
                    }) : (
                      <p className="text-xs text-zinc-400">Enter a job title in step 1 to see recommendations.</p>
                    )}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- STEP 3: PERSONA --- */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardContent className="p-6 space-y-8">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Interviewer Strictness</label>
                  <Badge variant="secondary" className="font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {formData.difficulty < 33 ? "Friendly" : formData.difficulty < 66 ? "Neutral" : "Ruthless"}
                  </Badge>
                </div>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={1} 
                  value={[formData.difficulty]} 
                  onValueChange={(val) => setFormData({...formData, difficulty: val[0]})}
                  className="py-2"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formData.difficulty < 33 ? "Provides hints, patient, educational tone. Best for learning." : 
                   formData.difficulty < 66 ? "Professional, standard timing, some hints. Realistic mock." : 
                   "Zero hints, strict timing, probing questions. Stress testing."}
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* --- STEP 4: REVIEW --- */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
          <Card className="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                <Sparkles className="size-5 text-indigo-500" /> Ready to Start?
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider mb-1">Role</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formData.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider mb-1">Mode</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{formData.companyStyle} Style</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider mb-1">Difficulty</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formData.difficulty}% Strictness</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-wider mb-1">Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {formData.skills.map(s => (
                        <span key={s} className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-indigo-200/50 dark:border-indigo-800/30">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    The AI will simulate a 45-minute session tailored to this profile. It has analyzed your provided context and will challenge you accordingly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 z-10 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="w-24 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            Back
          </Button>
          
          {currentStep === 4 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-40 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 rounded-full"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>Start Session <Sparkles className="ml-2 size-4" /></>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="w-32 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full"
            >
              Next <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}