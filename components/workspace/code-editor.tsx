"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Copy, Check, ChevronDown, FileJson, 
  FileCode2, Terminal, Braces 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CodeEditorProps {
  value: string;
  language: "python" | "javascript" | "cpp";
  onChange: (value: string | undefined) => void;
  onLanguageChange?: (lang: "python" | "javascript" | "cpp") => void;
}

const LANGUAGES = [
  { id: "python", name: "Python 3", icon: FileJson, color: "text-yellow-500" },
  { id: "javascript", name: "JavaScript", icon: FileCode2, color: "text-yellow-400" },
  { id: "cpp", name: "C++ 20", icon: Braces, color: "text-blue-500" },
] as const;

export function CodeEditor({ value, language, onChange, onLanguageChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration fix for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-[#0c0c0e] font-sans">
      
      {/* --- Attractive Toolbar --- */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50/50 dark:bg-[#0c0c0e] border-b border-zinc-200 dark:border-zinc-800 h-12 shrink-0">
        
        {/* Language Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 px-2 pl-2 pr-3 gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all group"
            >
              <div className="p-1 rounded-md bg-zinc-200/50 dark:bg-zinc-800 group-hover:scale-105 transition-transform">
                <currentLang.icon size={14} className={currentLang.color} />
              </div>
              <span className="text-xs font-semibold tracking-tight">{currentLang.name}</span>
              <ChevronDown size={12} className="opacity-50 group-hover:translate-y-0.5 transition-transform" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40 bg-white dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800 p-1">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem 
                key={lang.id}
                onClick={() => onLanguageChange?.(lang.id)}
                className="text-xs focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer gap-2 py-2"
              >
                <lang.icon size={14} className={cn("opacity-70", lang.color)} />
                {lang.name}
                {language === lang.id && <Check size={12} className="ml-auto text-indigo-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* File Name Display */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Terminal size={10} className="text-zinc-400" />
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
              solution.{language === "python" ? "py" : language === "cpp" ? "cpp" : "js"}
            </span>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Copy code"
          >
            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* --- Editor Area --- */}
      <div className="flex-1 relative w-full group overflow-hidden">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={value}
          theme={mounted && (theme === "dark" || theme === "system") ? "vs-dark" : "light"}
          onChange={onChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
              <span className="text-xs">Initializing Environment...</span>
            </div>
          }
          options={{
            minimap: { enabled: false }, 
            fontSize: 14,
            lineHeight: 24, 
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            fontFamily: "'Geist Mono', 'Fira Code', Consolas, monospace",
            fontLigatures: true, 
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 20, bottom: 20 },
            renderLineHighlight: "all", 
            
            // Clean Scrollbar
            scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                vertical: "visible", 
                useShadows: false,
            },
            overviewRulerBorder: false, 
            hideCursorInOverviewRuler: true,
            // Colors matching the theme
            guides: {
                indentation: false
            }
          }}
        />
      </div>
    </div>
  );
}