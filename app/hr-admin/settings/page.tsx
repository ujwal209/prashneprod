"use client";

import { useActionState, useEffect, useState } from "react";
import { getSettings, updateProfile, updateCompany } from "@/actions/hr-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  User, 
  Building2, 
  ShieldCheck, 
  Save, 
  Globe,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Types
type SettingsData = {
  user: {
    id: string;
    email: string;
    full_name: string;
    job_title: string;
    avatar_url: string;
  };
  company: {
    id: string;
    name: string;
    website: string;
    industry: string;
  };
};

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Data on Mount
  useEffect(() => {
    async function load() {
      const settings = await getSettings();
      // @ts-ignore
      setData(settings);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">Failed to load settings.</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Manage your account profile and company preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        
        {/* Tab Navigation */}
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-full md:w-auto flex overflow-x-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all">
            <User size={16} /> My Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all">
            <Building2 size={16} /> Company Details
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all">
            <ShieldCheck size={16} /> Security
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PROFILE --- */}
        <TabsContent value="profile">
            <ProfileForm user={data.user} />
        </TabsContent>

        {/* --- TAB 2: COMPANY --- */}
        <TabsContent value="company">
            <CompanyForm company={data.company} />
        </TabsContent>

        {/* --- TAB 3: SECURITY (Placeholder) --- */}
        <TabsContent value="security">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
              <CardDescription>Manage your password and authentication methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Password</p>
                    <p className="text-xs text-zinc-500">Last changed: Never</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>Change Password</Button>
               </div>
               <div className="text-xs text-zinc-400">
                  * Password management is handled via the login provider (Supabase Auth).
               </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

// --- SUB-COMPONENT: PROFILE FORM ---
function ProfileForm({ user }: { user: SettingsData['user'] }) {
  const [state, formAction, isPending] = useActionState(updateProfile, { message: "" });

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
        <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update how you appear to your team.</CardDescription>
        </CardHeader>
        <CardContent>
            <form action={formAction} className="space-y-6">
                
                <div className="grid gap-2">
                    <Label>Email Address</Label>
                    <Input disabled value={user.email} className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed border-zinc-200 dark:border-zinc-800" />
                    <p className="text-[10px] text-zinc-400">Email cannot be changed.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input id="fullName" name="fullName" defaultValue={user.full_name} placeholder="e.g. John Doe" className="pl-9 bg-transparent border-zinc-200 dark:border-zinc-800" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input id="jobTitle" name="jobTitle" defaultValue={user.job_title} placeholder="e.g. HR Manager" className="pl-9 bg-transparent border-zinc-200 dark:border-zinc-800" />
                        </div>
                    </div>
                </div>

                {state?.message && (
                    <div className={`text-sm font-medium ${state.success ? 'text-emerald-600' : 'text-red-600'}`}>
                        {state.message}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button type="submit" disabled={isPending} className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800">
                        {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
  );
}

// --- SUB-COMPONENT: COMPANY FORM ---
function CompanyForm({ company }: { company: SettingsData['company'] }) {
  const [state, formAction, isPending] = useActionState(updateCompany, { message: "" });

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
        <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>These details appear on your job listings.</CardDescription>
        </CardHeader>
        <CardContent>
            <form action={formAction} className="space-y-6">
                
                <input type="hidden" name="companyId" value={company.id} />

                <div className="grid gap-2">
                    <Label htmlFor="name">Company Name</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input id="name" name="name" defaultValue={company.name} placeholder="e.g. Acme Inc." className="pl-9 bg-transparent border-zinc-200 dark:border-zinc-800" required />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input id="website" name="website" defaultValue={company.website} placeholder="e.g. https://acme.com" className="pl-9 bg-transparent border-zinc-200 dark:border-zinc-800" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input id="industry" name="industry" defaultValue={company.industry} placeholder="e.g. Technology" className="bg-transparent border-zinc-200 dark:border-zinc-800" />
                    </div>
                </div>

                {state?.message && (
                    <div className={`text-sm font-medium ${state.success ? 'text-emerald-600' : 'text-red-600'}`}>
                        {state.message}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button type="submit" disabled={isPending} className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800">
                        {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Update Company
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
  );
}