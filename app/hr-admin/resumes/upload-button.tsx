"use client";

import { useActionState } from "react"; // Hook for Server Actions
import { uploadResumeAction } from "@/actions/hr-resumes";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
// import { toast } from "sonner"; 

export function UploadButton() {
  const [state, formAction, isPending] = useActionState(uploadResumeAction, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-submit form when file is selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      formRef.current?.requestSubmit();
    }
  };

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
         // toast.success(state.message);
         // Reset form
         formRef.current?.reset();
      } else {
         alert(state.message);
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <input 
        type="file" 
        name="file"
        accept=".pdf" // We are only parsing PDF for now in the server action
        onChange={handleFileChange}
        className="hidden" 
        id="resume-upload" 
        disabled={isPending}
      />
      <label htmlFor="resume-upload">
        <Button 
          type="button" // This is just a trigger for the label
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 cursor-pointer pointer-events-auto"
          onClick={() => document.getElementById('resume-upload')?.click()}
        >
          {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
          {isPending ? "Parsing & Vectorizing..." : "Upload PDF Resume"}
        </Button>
      </label>
    </form>
  );
}   