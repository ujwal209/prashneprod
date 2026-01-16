"use client";

import { useState, useRef } from "react";
import { 
  Code2, Play, Settings, Sun, Moon, PanelLeftOpen, Terminal, 
  Maximize2, ChevronDown, Sparkles, CheckCircle2, ListFilter, 
  Loader2, XCircle, ChevronUp, AlertTriangle, GripHorizontal
} from "lucide-react";
import { PrashneAgentChat } from "./prashne-agent-chat";
import { ProblemDescription } from "@/components/workspace/problem-description"; // Ensure correct import path
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { runCodeAction, submitCodeAction } from "@/actions/execute";
import { toast } from "sonner"; 

// --- DEFINITIONS ---

// 1. Define the Problem Shape (Matches your DB + Server Component)
export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance_rate: number;
  topics: string[];
  description: string;
  hints: string[];
  companies: string[];
  starter_code: { python: string; javascript: string; cpp: string };
}

// 2. Define Props
interface WorkspaceWrapperProps {
  problem: Problem;
  starterCode: { python: string; javascript: string; cpp: string };
}

export function WorkspaceWrapper({ problem, starterCode }: WorkspaceWrapperProps) {
  // State
  const [language, setLanguage] = useState<"python" | "javascript" | "cpp">("python");
  const [code, setCode] = useState(starterCode.python || ""); // Initialize with Python default
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Refs for Imperative Resizing
  const consolePanelRef = useRef<ImperativePanelHandle>(null);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  const { theme, setTheme } = useTheme();

  // --- HANDLERS ---

  const handleLanguageChange = (newLang: string) => {
    const lang = newLang as "python" | "javascript" | "cpp";
    setLanguage(lang);
    // Switch code to the starter code for that language
    // In a real app, you might want to save user's draft per language in localStorage
    setCode(starterCode[lang] || "");
  };

  const toggleConsole = () => {
    const panel = consolePanelRef.current;
    if (panel) {
      if (isConsoleCollapsed) {
        panel.expand();
        setIsConsoleCollapsed(false);
      } else {
        panel.collapse();
        setIsConsoleCollapsed(true);
      }
    }
  };

  const handleRun = async () => {
    if (isConsoleCollapsed) toggleConsole();

    setIsRunning(true);
    setSubmissionStatus(null);
    setExecutionError(null);
    setTestResults(null);
    
    try {
      // Execute Code via Server Action
      const result = await runCodeAction(code, language, problem.title);
      
      if (result.success && result.data) {
        setTestResults(result.data.testResults);
        if (result.data.status === "Accepted") {
            toast.success("Run Successful: All basic tests passed.");
        } else {
            toast.warning("Run Complete: Some tests failed.");
        }
      } else {
        const errorMsg = result.error || "Unknown execution error";
        setExecutionError(errorMsg);
        toast.error("Execution failed.");
      }
    } catch (err) {
      setExecutionError("Failed to connect to execution server.");
      toast.error("Network error.");
    }
    
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (isConsoleCollapsed) toggleConsole();

    setIsSubmitting(true);
    setExecutionError(null);
    setTestResults(null);
    
    try {
        // Submit Code via Server Action (Records to DB)
        const result = await submitCodeAction(code, language, problem.id, problem.title);
        
        if (result.success && result.data) {
          setTestResults(result.data.testResults);
          setSubmissionStatus(result.data.status);
          if (result.data.status === "Accepted") {
            toast.success("Problem Solved! Submission Saved.");
          } else {
            toast.error(`Submission Failed: ${result.data.status}`);
          }
        } else {
          const errorMsg = result.error || "Submission failed";
          setExecutionError(errorMsg);
          toast.error(errorMsg);
        }
    } catch (err) {
        setExecutionError("Failed to submit.");
    }
    setIsSubmitting(false);
  };

  // --- RENDER ---

  return (
    <div className="h-screen w-full flex flex-col bg-[#FAFAFA] dark:bg-[#09090b] overflow-hidden font-sans selection:bg-indigo-500/20">
      
      {/* --- Top Navigation Bar --- */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 shadow-lg shadow-indigo-500/20 p-1.5 rounded-lg transition-transform hover:scale-105">
               <Code2 className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hidden sm:block tracking-tight">
              {problem.title}
            </h1>
          </div>
          {submissionStatus === "Accepted" && (
             <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                Solved
             </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center bg-zinc-100 dark:bg-[#18181b] rounded-lg p-1 border border-zinc-200 dark:border-[#27272a]">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={isRunning || isSubmitting}
                onClick={handleRun}
                className="h-7 px-3 text-xs gap-2 hover:bg-white dark:hover:bg-[#27272a] hover:shadow-sm transition-all text-zinc-600 dark:text-zinc-400 rounded-md"
              >
                {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} className="fill-current opacity-70" />}
                Run
              </Button>
              <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
              <Button 
                size="sm" 
                disabled={isRunning || isSubmitting}
                onClick={handleSubmit}
                className={cn(
                    "h-7 px-4 text-xs font-medium gap-2 text-white shadow-md transition-all rounded-md",
                    isSubmitting 
                        ? "bg-zinc-500 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                )}
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Submit
              </Button>
           </div>

          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
               <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <div className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          
          {/* --- LEFT PANEL (Problem Context) --- */}
          <ResizablePanel 
            defaultSize={40} 
            minSize={25} 
            collapsible={true} 
            onCollapse={() => setIsSidebarOpen(false)} 
            onExpand={() => setIsSidebarOpen(true)} 
            className={cn(
                "bg-white dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out relative flex flex-col", 
                !isSidebarOpen && "min-w-0 w-0 hidden"
            )}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="flex-none px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-[#0c0c0e]/50 backdrop-blur-sm z-10 sticky top-0">
                <TabsList className="w-full justify-start h-9 bg-zinc-100/80 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                  <TabsTrigger value="description" className="flex-1 text-xs font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all duration-200">
                    <ListFilter className="h-3.5 w-3.5 mr-2 opacity-70" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1 text-xs font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all duration-200">
                    <Sparkles className="h-3.5 w-3.5 mr-2 opacity-70" />
                    AI Tutor
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="description" className="flex-1 h-full m-0 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                  {/* FIX: Pass the full problem object */}
                  <ProblemDescription problem={problem} />
              </TabsContent>
              <TabsContent value="chat" className="flex-1 h-full m-0 overflow-hidden relative bg-zinc-50/50 dark:bg-[#0c0c0e]">
                  <PrashneAgentChat currentCode={code} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle className="w-[1px] bg-zinc-200 dark:bg-zinc-800 hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-colors z-20 hover:w-[4px]" />

          {/* --- RIGHT PANEL (Editor & Console) --- */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              
              {/* TOP: Code Editor */}
              <ResizablePanel defaultSize={70} minSize={20} className="flex flex-col bg-white dark:bg-[#0c0c0e] relative">
                  <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 backdrop-blur-sm">
                    
                    <div className="flex items-center gap-3">
                      {!isSidebarOpen && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-200 dark:hover:bg-zinc-800" onClick={() => setIsSidebarOpen(true)}>
                           <PanelLeftOpen size={14} className="text-zinc-500" />
                        </Button>
                      )}
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                         <Code2 size={13} className="opacity-70" />
                         <span className="font-mono font-medium">solution.{language === "python" ? "py" : language === "cpp" ? "cpp" : "js"}</span>
                      </div>
                    </div>

                    <div className="relative group">
                       <select 
                         value={language} 
                         onChange={(e) => handleLanguageChange(e.target.value)} 
                         className="appearance-none bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-300 pr-6 focus:outline-none cursor-pointer hover:text-indigo-500 transition-colors"
                       >
                           <option value="python">Python 3.10</option>
                           <option value="javascript">Node.js 18</option>
                           <option value="cpp">C++ 20</option>
                       </select>
                       <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-indigo-500 transition-colors"/>
                    </div>
                  </div>

                  <div className="flex-1 relative">
                     <Editor 
                        height="100%" 
                        language={language === "cpp" ? "cpp" : language} 
                        value={code} 
                        onChange={(val) => setCode(val || "")}
                        theme={theme === "dark" || theme === "system" ? "vs-dark" : "light"}
                        options={{ 
                          minimap: { enabled: false }, 
                          fontSize: 14, 
                          fontFamily: "'Geist Mono', 'Fira Code', monospace",
                          fontLigatures: true,
                          automaticLayout: true, 
                          padding: { top: 20 },
                          scrollBeyondLastLine: false,
                        }}
                    />
                  </div>
              </ResizablePanel>

              {/* --- RESIZABLE HANDLE --- */}
              <ResizableHandle withHandle className="bg-zinc-100 dark:bg-zinc-800 h-[6px] transition-colors hover:bg-indigo-500 dark:hover:bg-indigo-500" />

              {/* BOTTOM: Execution Console */}
              <ResizablePanel 
                ref={consolePanelRef}
                defaultSize={30} 
                minSize={5} 
                collapsible={true} 
                onCollapse={() => setIsConsoleCollapsed(true)}
                onExpand={() => setIsConsoleCollapsed(false)}
                className={cn(
                    "bg-zinc-50 dark:bg-[#09090b] flex flex-col transition-all duration-300"
                )}
              >
                
                {/* Console Header */}
                <div className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e]">
                    <div className="flex items-center gap-6 h-full">
                       <button className="h-full border-b-2 border-indigo-500 text-xs font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 transition-colors">
                         <CheckCircle2 size={13} className={submissionStatus === "Accepted" ? "text-emerald-500" : "text-zinc-500"} />
                         Test Results
                       </button>
                    </div>
                    <div className="flex items-center gap-1">
                       <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-100" onClick={toggleConsole}>
                           {isConsoleCollapsed ? <ChevronUp size={12} /> : <Maximize2 size={12} />}
                       </Button>
                    </div>
                </div>

                {/* Console Body */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                    
                    {/* 1. Loading State */}
                    {(isRunning || isSubmitting) && (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                            <span className="text-xs font-medium">
                                {isSubmitting ? "Running strict submission tests..." : "Compiling and running..."}
                            </span>
                        </div>
                    )}

                    {/* 2. Error State */}
                    {!isRunning && !isSubmitting && executionError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                <AlertTriangle size={16} />
                                <span className="font-bold text-xs uppercase tracking-wider">Execution Error</span>
                            </div>
                            <p className="text-xs text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap">
                                {executionError}
                            </p>
                        </div>
                    )}

                    {/* 3. Results State */}
                    {!isRunning && !isSubmitting && testResults && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {/* Status Banner */}
                            {submissionStatus && (
                                <div className={cn(
                                    "p-3 rounded-lg border text-xs font-medium mb-4 flex items-center gap-2",
                                    submissionStatus === "Accepted" 
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                                )}>
                                    {submissionStatus === "Accepted" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    <div className="flex flex-col">
                                        <span className="uppercase tracking-wider font-bold">{submissionStatus}</span>
                                        <span className="font-normal opacity-80">
                                             Passed {testResults.filter((t: any) => t.passed).length} / {testResults.length} test cases
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Test Cases List */}
                            <div className="flex flex-col gap-3">
                                {testResults.map((result: any, idx: number) => (
                                    <div key={idx} className="group p-4 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                                            <div className="flex items-center justify-between mb-3">
                                                 <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                                   <div className={cn("w-2 h-2 rounded-full ring-2 ring-offset-1 dark:ring-offset-[#0c0c0e]", result.passed ? "bg-emerald-500 ring-emerald-500/30" : "bg-red-500 ring-red-500/30")} />
                                                   Test Case {idx + 1}
                                                 </span>
                                                 <Badge variant="secondary" className={cn("border-0 h-5 text-[10px]", result.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                                                   {result.passed ? "Passed" : "Failed"}
                                                 </Badge>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                 <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800">
                                                     <div className="text-[10px] text-zinc-400 mb-1 uppercase tracking-wider font-semibold">Input</div>
                                                     <div className="text-xs text-zinc-700 dark:text-zinc-300 font-mono break-all">{result.input}</div>
                                                 </div>

                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                     <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800">
                                                         <div className="text-[10px] text-zinc-400 mb-1 uppercase tracking-wider font-semibold">Your Output</div>
                                                         <div className={cn("text-xs font-mono break-all", result.passed ? "text-zinc-700 dark:text-zinc-300" : "text-red-600")}>
                                                             {result.actualOutput}
                                                         </div>
                                                     </div>
                                                     {!result.passed && (
                                                         <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800">
                                                             <div className="text-[10px] text-zinc-400 mb-1 uppercase tracking-wider font-semibold">Expected</div>
                                                             <div className="text-xs text-emerald-600 font-mono break-all">{result.expectedOutput}</div>
                                                         </div>
                                                     )}
                                                 </div>
                                            </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. Empty State */}
                    {!isRunning && !isSubmitting && !testResults && !executionError && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3 opacity-60">
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                               <Terminal size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Ready to execute</p>
                                <p className="text-xs">Click Run to test your logic or Submit to finalize.</p>
                            </div>
                        </div>
                    )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}