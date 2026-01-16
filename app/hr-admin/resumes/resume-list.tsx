"use client";

import { 
  FileText, 
  MoreVertical, 
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ResumeList({ initialResumes }: { initialResumes: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialResumes.map((resume) => (
        <div key={resume.id} className="group bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all relative">
          
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                 <FileText size={20} />
              </div>
              <div className="flex items-center gap-2">
                 {resume.status === 'ready' && <span className="text-emerald-500"><CheckCircle2 size={16} /></span>}
                 {resume.status === 'processing' && <span className="text-amber-500 animate-pulse"><Clock size={16} /></span>}
                 {resume.status === 'failed' && <span className="text-red-500"><AlertCircle size={16} /></span>}
              </div>
            </div>

            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1 truncate">
              {resume.candidate_name || "Processing..."}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-4">
              {resume.file_name}
            </p>

            {/* AI Extracted Skills */}
            <div className="flex flex-wrap gap-1.5 h-16 overflow-hidden content-start">
              {resume.skills && resume.skills.length > 0 ? (
                resume.skills.slice(0, 5).map((skill: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-medium rounded-md border border-zinc-200 dark:border-zinc-700">
                    {skill}
                  </span>
                ))
              ) : (
                 <span className="text-xs text-zinc-400 italic flex items-center gap-1">
                   <BrainCircuit size={12} /> extracting skills...
                 </span>
              )}
            </div>
          </div>

          <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 px-5 py-3 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">
              {new Date(resume.created_at).toLocaleDateString()}
            </span>
            <a 
              href={resume.file_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View PDF <ExternalLink size={10} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}