import { getResumes } from "@/actions/hr-resumes";
import { UploadButton } from "./upload-button"; // We will create this
import { ResumeList } from "./resume-list";     // We will create this
import { FileText, Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const resumes = await getResumes();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Talent Vault <span className="text-sm font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{resumes.length}</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Upload resumes to build your semantic search database.
          </p>
        </div>
        <div>
          {/* Client Component for Upload Logic */}
          <UploadButton />
        </div>
      </div>

      {/* Content */}
      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-zinc-100 dark:border-zinc-700">
            <Database className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Your vault is empty
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm text-center text-sm mb-6">
            Upload PDFs or DOCX files. Our AI will parse them, extract skills, and make them searchable.
          </p>
          <UploadButton />
        </div>
      ) : (
        <ResumeList initialResumes={resumes} />
      )}
    </div>
  );
}