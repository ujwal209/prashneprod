"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ProblemDescription } from "./problem-description";
import { CodeEditor } from "./code-editor";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  CloudUpload, 
  Settings, 
  ChevronDown, 
  Terminal, 
  ListChecks, 
  Code2, 
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemWorkspaceProps {
  problem: any;
}

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(problem.starter_code?.[language] || "");
  const [activeTab, setActiveTab] = useState("description");
  const [consoleTab, setConsoleTab] = useState("testcases");

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // In a real app, you might want to preserve code if switching back and forth
    setCode(problem.starter_code?.[newLang] || "");
  };

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col">
      
      {/* --- Main Resizable Layout --- */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-none border-0">
        
        {/* --- LEFT PANEL: Problem Context --- */}
        <ResizablePanel defaultSize={40} minSize={25} className="bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
          <div className="flex h-full flex-col">
            
            {/* Left Header */}
            <div className="flex-none h-12 flex items-center px-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="h-9 bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-lg gap-1 w-auto inline-flex">
                  <TabsTrigger 
                    value="description" 
                    className="h-7 px-3 text-xs font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm transition-all"
                  >
                    <ListChecks size={14} className="mr-2" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger 
                    value="editorial" 
                    className="h-7 px-3 text-xs font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm transition-all"
                  >
                    Editorial
                  </TabsTrigger>
                  <TabsTrigger 
                    value="submissions" 
                    className="h-7 px-3 text-xs font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm transition-all"
                  >
                    Submissions
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Left Content */}
            <div className="flex-1 overflow-hidden relative">
               {activeTab === "description" && <ProblemDescription content={problem.description} />}
               {/* Placeholders for other tabs */}
               {activeTab !== "description" && (
                 <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                   Content for {activeTab}
                 </div>
               )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-zinc-800 hover:bg-indigo-500 transition-colors" />

        {/* --- RIGHT PANEL: Coding Environment --- */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <ResizablePanelGroup direction="vertical">

            {/* --- TOP: Code Editor --- */}
            <ResizablePanel defaultSize={70} minSize={20} className="flex flex-col bg-zinc-950">
              
              {/* Editor Toolbar */}
              <div className="flex-none h-12 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50">
                
                {/* Language Selector */}
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                      <Code2 size={14} className="text-zinc-400 group-hover:text-indigo-400 transition-colors"/>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="h-8 pl-8 pr-8 appearance-none bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-xs font-medium text-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer w-[140px]"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"/>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                      <Settings size={16} />
                   </Button>
                   <div className="h-4 w-[1px] bg-zinc-700 mx-1" />
                   
                   <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                   >
                     <Play size={14} className="mr-2 text-emerald-500 fill-emerald-500/20" />
                     Run
                   </Button>
                   
                   <Button 
                    size="sm" 
                    className="h-8 bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                   >
                     <CloudUpload size={14} className="mr-2" />
                     Submit
                   </Button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 relative">
                <CodeEditor 
                    value={code} 
                    language={language} 
                    onChange={(val) => setCode(val || "")} 
                    // No filename prop here to keep it cleaner inside the workspace
                />
              </div>
            </ResizablePanel>

            <ResizableHandle className="h-[1px] bg-zinc-800 hover:bg-indigo-500 transition-colors" />

            {/* --- BOTTOM: Console / Test Cases --- */}
            <ResizablePanel defaultSize={30} minSize={10} className="bg-zinc-950 flex flex-col">
              
              {/* Console Header */}
              <div className="flex-none h-10 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/30">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setConsoleTab("testcases")}
                        className={cn(
                            "flex items-center gap-2 text-xs font-medium h-10 border-b-2 transition-colors",
                            consoleTab === "testcases" 
                                ? "text-zinc-100 border-indigo-500" 
                                : "text-zinc-500 border-transparent hover:text-zinc-300"
                        )}
                    >
                        <ListChecks size={14} />
                        Test Cases
                    </button>
                    <button 
                        onClick={() => setConsoleTab("output")}
                        className={cn(
                            "flex items-center gap-2 text-xs font-medium h-10 border-b-2 transition-colors",
                            consoleTab === "output" 
                                ? "text-zinc-100 border-indigo-500" 
                                : "text-zinc-500 border-transparent hover:text-zinc-300"
                        )}
                    >
                        <Terminal size={14} />
                        Console Output
                    </button>
                 </div>
                 <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-300">
                    <Maximize2 size={12} />
                 </Button>
              </div>

              {/* Console Body */}
              <div className="flex-1 overflow-auto p-4">
                {consoleTab === "testcases" ? (
                    <div className="flex gap-3">
                        {/* Mock Test Case Tabs */}
                        {[1, 2, 3].map(num => (
                            <div key={num} className="space-y-3">
                                <button className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                    num === 1 
                                        ? "bg-zinc-800 border-zinc-700 text-zinc-200" 
                                        : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900"
                                )}>
                                    Case {num}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-zinc-500 text-sm font-mono p-2">
                        {/* Empty state for output */}
                        Click "Run" to see output...
                    </div>
                )}

                {/* Example Content for Test Cases (Visible only if case 1 is selected) */}
                {consoleTab === "testcases" && (
                    <div className="mt-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Input</label>
                            <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 font-mono text-sm text-zinc-300">
                                nums = [2,7,11,15], target = 9
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Expected Output</label>
                            <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 font-mono text-sm text-zinc-300">
                                [0,1]
                            </div>
                        </div>
                    </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}