"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Copy, Check, Terminal } from "lucide-react";

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  filename?: string; // Optional: to display a file name
}

export function CodeEditor({ value, language, onChange, filename }: CodeEditorProps) {
  const editorRef = useRef(null);
  const { theme } = useTheme();
  const [isCopied, setIsCopied] = useState(false);

  // Map languages to nice display titles
  const languageTitle = filename || `${language === "javascript" ? "script.js" : 
                                      language === "typescript" ? "script.ts" : 
                                      language === "python" ? "main.py" : 
                                      "untitled.txt"}`;

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* --- Toolbar / Header --- */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
        
        {/* Left: File Info */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Terminal size={14} />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 font-mono tracking-tight">
            {languageTitle}
          </span>
        </div>

        {/* Right: Actions */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
          title="Copy code"
        >
          {isCopied ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* --- Editor Area --- */}
      <div className="flex-grow relative w-full group">
        <Editor
          height="100%"
          language={language}
          value={value}
          theme={theme === "dark" || theme === "system" ? "vs-dark" : "light"}
          onChange={onChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Loading Editor...
            </div>
          }
          options={{
            minimap: { enabled: false }, // Cleaner look for small editors
            fontSize: 14,
            lineHeight: 24, // More breathing room
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            fontFamily: "Geist Mono, 'Fira Code', Consolas, monospace",
            fontLigatures: true, // Makes => look like an arrow
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "all", // Highlights the active line gutter
            
            // Clean up the scrollbar
            scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                vertical: "visible", // Always show to prevent layout shift
            },
            overviewRulerBorder: false, // Removes ugly border on right
            hideCursorInOverviewRuler: true,
          }}
        />
      </div>
    </div>
  );
}