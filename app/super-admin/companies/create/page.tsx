"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { createCompanyAction } from "@/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Building2, UploadCloud, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateCompanyPage() {
  const [state, formAction, isPending] = useActionState(createCompanyAction, { message: "" });
  
  // Cloudinary State
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Handle File Upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate Environment Variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Missing Cloudinary environment variables");
      alert("System configuration error: Missing Cloudinary keys.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "prashne_companies"); // Optional folder organization

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.secure_url) {
        setLogoUrl(data.secure_url);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#000000]">
      <div className="max-w-5xl mx-auto p-8 pb-20">
        
        {/* Header */}
        <div className="mb-10">
          <Link href="/super-admin/companies" className="text-sm font-medium text-zinc-500 hover:text-indigo-600 flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Companies
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Register New Company
              </h1>
              <p className="text-zinc-500 mt-2 text-base">
                Create a tenant profile and configure their subscription limits.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
              <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Enterprise Onboarding</span>
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Logo & Essentials */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <Label className="text-base font-semibold mb-4 block">Company Logo</Label>
                
                {/* Hidden Input for Form Submission */}
                <input type="hidden" name="logo_url" value={logoUrl} />

                <div className="flex flex-col items-center justify-center gap-4">
                  <div className={cn(
                    "relative h-32 w-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all bg-white dark:bg-black",
                    logoUrl ? "border-indigo-500/50" : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400"
                  )}>
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    ) : logoUrl ? (
                      <>
                        <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                        <button 
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <X className="text-white h-8 w-8" />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="h-10 w-10 text-zinc-300" />
                    )}
                  </div>
                  
                  <div className="w-full">
                    <label 
                      htmlFor="logo-upload" 
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all",
                        isUploading 
                          ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                          : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                      )}
                    >
                      <UploadCloud size={16} />
                      {logoUrl ? "Change Logo" : "Upload Image"}
                    </label>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={isUploading}
                      className="hidden" 
                    />
                    <p className="text-[10px] text-center text-zinc-400 mt-2">
                      Max 2MB. PNG or JPG recommended.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subscription Tier</Label>
                  <Select name="hr_limit" defaultValue="5">
                    <SelectTrigger className="h-11 bg-white dark:bg-[#09090b]">
                      <SelectValue placeholder="Select Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Starter (3 HRs)</SelectItem>
                      <SelectItem value="5">Growth (5 HRs)</SelectItem>
                      <SelectItem value="10">Pro (10 HRs)</SelectItem>
                      <SelectItem value="25">Enterprise (25 HRs)</SelectItem>
                      <SelectItem value="999">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Detailed Form */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Section 1: General Info */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  General Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Company Name <span className="text-red-500">*</span></Label>
                    <Input name="name" placeholder="e.g. Acme Corp" required className="h-11 bg-white dark:bg-[#09090b]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select name="industry">
                      <SelectTrigger className="h-11 bg-white dark:bg-[#09090b]">
                        <SelectValue placeholder="Select Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input name="website" placeholder="https://acme.com" className="h-11 bg-white dark:bg-[#09090b]" />
                </div>

                <div className="space-y-2">
                  <Label>About Company</Label>
                  <Textarea 
                    name="description" 
                    placeholder="Brief description of the company..." 
                    className="min-h-[100px] resize-none bg-white dark:bg-[#09090b]" 
                  />
                </div>
              </div>

              {/* Section 2: Contact Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  Contact Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input name="contact_email" type="email" placeholder="contact@acme.com" className="h-11 bg-white dark:bg-[#09090b]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input name="contact_phone" type="tel" placeholder="+1 (555) 000-0000" className="h-11 bg-white dark:bg-[#09090b]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Headquarters Address</Label>
                  <Input name="address" placeholder="123 Innovation Dr, Tech City" className="h-11 bg-white dark:bg-[#09090b]" />
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-4">
            <Link href="/super-admin/companies">
              <Button type="button" variant="outline" className="h-11 px-6">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isPending || isUploading} 
              className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
              {isPending ? "Registering..." : "Create Company"}
            </Button>
          </div>

          {state?.message && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium text-center animate-in fade-in slide-in-from-bottom-2">
              {state.message}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}