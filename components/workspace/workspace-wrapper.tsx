"use client";

import { useState, useRef } from "react";
import { 
  Code2, Play, Sun, Moon, PanelLeftOpen, Terminal, 
  Maximize2, ChevronDown, CheckCircle2, ListFilter, Sparkles, 
  Loader2, XCircle, ChevronUp, AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { runCodeAction, submitCodeAction } from "@/actions/execute";
import { ProblemDescription } from "./problem-description";
import { PrashneAgentChat } from "./prashne-agent-chat";
import { CodeEditor } from "./code-editor";

// --- Types ---
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

interface WorkspaceWrapperProps {
  problem: Problem;
  starterCode: { python: string; javascript: string; cpp: string };
}

export function WorkspaceWrapper({ problem, starterCode }: WorkspaceWrapperProps) {
  // --- State ---
  const [language, setLanguage] = useState<"python" | "javascript" | "cpp">("python");
  const [code, setCode] = useState(starterCode.python || ""); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);

  // Layout Refs
  const consolePanelRef = useRef<ImperativePanelHandle>(null);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  const { theme, setTheme } = useTheme();

  // --- Handlers ---

  const handleLanguageChange = (newLang: "python" | "javascript" | "cpp") => {
    setLanguage(newLang);
    setCode(starterCode[newLang] || "");
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

  const resetConsole = () => {
    setSubmissionStatus(null);
    setExecutionError(null);
    setTestResults(null);
    setRawOutput(null);
    if (isConsoleCollapsed) {
        consolePanelRef.current?.expand();
        setIsConsoleCollapsed(false);
    }
  };

  const handleRun = async () => {
    resetConsole();
    setIsRunning(true);
    
    try {
      const result = await runCodeAction(code, language, problem.title);
      
      if (result.success && result.data) {
        if (result.data.testResults) {
            setTestResults(result.data.testResults);
            if (result.data.status === "Accepted") {
                toast.success("Run Successful");
            } else {
                toast.warning("Check your logic");
            }
        } 
        if (result.data.output) {
            setRawOutput(result.data.output);
        }
      } else {
        const errorMsg = result.error || "Unknown execution error";
        setExecutionError(errorMsg);
        toast.error("Execution failed");
      }
    } catch (err) {
      setExecutionError("Failed to connect to execution server.");
      toast.error("Network error");
    }
    
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    resetConsole();
    setIsSubmitting(true);
    
    try {
        const result = await submitCodeAction(code, language, problem.id, problem.title);
        
        if (result.success && result.data) {
          setTestResults(result.data.testResults);
          setSubmissionStatus(result.data.status);
          if (result.data.status === "Accepted") {
            toast.success("Accepted!");
          } else {
            toast.error(`Result: ${result.data.status}`);
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

  // --- Helper: Render Safe Values ---
  // Guarantees SOMETHING is always visible
  const renderOutputValue = (val: any) => {
    if (val === null || val === "null") return <span className="text-zinc-400 italic opacity-75">(null)</span>;
    if (val === undefined || val === "undefined") return <span className="text-zinc-400 italic opacity-75">(undefined)</span>;
    if (val === "") return <span className="text-zinc-400 italic opacity-75">(empty string)</span>;
    return <span className="whitespace-pre-wrap">{val}</span>;
  };

  const renderConsoleContent = () => {
    if (isRunning || isSubmitting) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-500 min-h-[100px]">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span className="text-xs font-medium">
                    {isSubmitting ? "Running all test cases..." : "Compiling and running..."}
                </span>
            </div>
        );
    }

    if (executionError) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <AlertTriangle size={16} />
                    <span className="font-bold text-xs uppercase tracking-wider">Execution Error</span>
                </div>
                <pre className="text-xs text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {executionError}
                </pre>
            </div>
        );
    }

    if (testResults && testResults.length > 0) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {submissionStatus && (
                    <div className={cn(
                        "p-3 rounded-lg border text-xs font-medium flex items-center gap-3",
                        submissionStatus === "Accepted" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                    )}>
                        {submissionStatus === "Accepted" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        <div className="flex flex-col">
                            <span className="uppercase tracking-wider font-bold">{submissionStatus}</span>
                            <span className="font-normal opacity-80">
                                Passed {testResults.filter((t: any) => t.passed).length} / {testResults.length} cases
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid gap-3">
                    {testResults.map((result: any, idx: number) => (
                        <div key={idx} className="group p-3 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-indigo-500/30 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                 <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                   <div className={cn("w-2 h-2 rounded-full ring-2 ring-offset-1 dark:ring-offset-[#18181b]", result.passed ? "bg-emerald-500 ring-emerald-500/20" : "bg-red-500 ring-red-500/20")} />
                                   Case {idx + 1}
                                 </span>
                                 <Badge variant="outline" className={cn("text-[10px] h-5 border-0", result.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                                   {result.passed ? "Passed" : "Failed"}
                                 </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                 <div>
                                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Input</div>
                                    <div className="text-xs font-mono bg-zinc-50 dark:bg-[#0c0c0e] p-2 rounded border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 break-all">
                                      {result.input}
                                    </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Output</div>
                                        {/* Apply Helper Here */}
                                        <div className={cn("text-xs font-mono bg-zinc-50 dark:bg-[#0c0c0e] p-2 rounded border border-zinc-100 dark:border-zinc-800 break-all min-h-[34px] flex items-center", result.passed ? "text-zinc-600 dark:text-zinc-300" : "text-red-600 dark:text-red-400")}>
                                            {renderOutputValue(result.actualOutput || result.actual)} 
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Expected</div>
                                        {/* Apply Helper Here */}
                                        <div className="text-xs font-mono bg-zinc-50 dark:bg-[#0c0c0e] p-2 rounded border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 break-all min-h-[34px] flex items-center">
                                            {renderOutputValue(result.expectedOutput || result.expected)}
                                        </div>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (rawOutput) {
        return (
            <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300 animate-in fade-in">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Standard Output</div>
                <pre className="whitespace-pre-wrap bg-zinc-50 dark:bg-[#18181b] p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {rawOutput}
                </pre>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3 opacity-60 min-h-[100px]">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
               <Terminal size={20} />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Ready</p>
                <p className="text-xs">Run your code to see results here.</p>
            </div>
        </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="h-screen w-full flex flex-col bg-[#FAFAFA] dark:bg-[#09090b] font-sans">
      
      {/* Top Nav */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105">
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
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          
          {/* Left Panel */}
          <ResizablePanel 
            defaultSize={40} 
            minSize={25} 
            collapsible={true} 
            onCollapse={() => setIsSidebarOpen(false)} 
            onExpand={() => setIsSidebarOpen(true)} 
            className={cn(
                "bg-white dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 relative flex flex-col", 
                !isSidebarOpen && "min-w-0 w-0 hidden"
            )}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="flex-none px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-[#0c0c0e]/50 backdrop-blur-sm z-10">
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
                  <ProblemDescription problem={problem} />
              </TabsContent>
              <TabsContent value="chat" className="flex-1 h-full m-0 overflow-hidden relative bg-zinc-50/50 dark:bg-[#0c0c0e]">
                  <PrashneAgentChat currentCode={code} problemSlug={problem.slug} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle className="w-[1px] bg-zinc-200 dark:bg-zinc-800 hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-colors z-20 hover:w-[4px]" />

          {/* Right Panel */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              
              {/* Editor */}
              <ResizablePanel defaultSize={70} minSize={20} className="flex flex-col bg-white dark:bg-[#0c0c0e] relative">
                  {!isSidebarOpen && (
                    <div className="absolute left-4 top-3 z-10">
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm" onClick={() => setIsSidebarOpen(true)}>
                           <PanelLeftOpen size={14} className="text-zinc-600 dark:text-zinc-400" />
                        </Button>
                    </div>
                  )}
                  <CodeEditor 
                    value={code} 
                    language={language} 
                    onChange={(val) => setCode(val || "")}
                    onLanguageChange={handleLanguageChange}
                  />
              </ResizablePanel>

              {/* Large Hit Area for Console Resize */}
              <ResizableHandle withHandle className="bg-transparent h-4 -my-2 z-20 flex items-center justify-center hover:bg-indigo-500/10 transition-colors cursor-row-resize group">
                  <div className="h-[4px] w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-indigo-400 transition-colors" />
              </ResizableHandle>

              {/* Console */}
              <ResizablePanel 
                ref={consolePanelRef}
                defaultSize={30} 
                minSize={5}
                collapsible={true}
                collapsedSize={0}
                onCollapse={() => setIsConsoleCollapsed(true)}
                onExpand={() => setIsConsoleCollapsed(false)}
                className={cn("bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col transition-all duration-300")}
              >
                <div className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e]">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-zinc-500" />
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Console</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-100" onClick={toggleConsole}>
                        {isConsoleCollapsed ? <ChevronUp size={14} /> : <Maximize2 size={12} />}
                    </Button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                    {renderConsoleContent()}
                </div>
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  );
}