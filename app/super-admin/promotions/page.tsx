"use client";

import { useActionState } from "react";
import { sendPromotionAction } from "@/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Send, Loader2, Sparkles, Users } from "lucide-react";

export default function PromotionsPage() {
  const [state, formAction, isPending] = useActionState(sendPromotionAction, { message: "" });

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
            <Megaphone size={24} />
          </div>
          Broadcast Center
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Send push notifications and promotional offers to your user base.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form action={formAction} className="bg-white dark:bg-[#09090b] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            
            {/* Target Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Target Audience</Label>
              <Select name="target" defaultValue="all">
                <SelectTrigger className="h-12 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="Select who receives this" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users size={16} /> All Users (Candidates & HR)
                    </div>
                  </SelectItem>
                  <SelectItem value="candidates">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} /> Candidates Only
                    </div>
                  </SelectItem>
                  <SelectItem value="hr">
                    <div className="flex items-center gap-2">
                      <Users size={16} /> HR Admins & Recruiters Only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Line */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Subject Line</Label>
              <Input 
                name="subject" 
                placeholder="e.g., What are you waiting for? Try Prashne now!" 
                required 
                className="h-12 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Message Content</Label>
              <Textarea 
                name="message" 
                placeholder="Write your promotional message here..." 
                required 
                className="min-h-[200px] resize-none bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 leading-relaxed p-4"
              />
              <p className="text-xs text-zinc-400 text-right">HTML not supported. Use plain text.</p>
            </div>

            {/* Feedback Message */}
            {state?.message && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                state.success 
                  ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400"
              }`}>
                {state.message}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold text-base shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.01]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Blast...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Campaign
                </>
              )}
            </Button>

          </form>
        </div>

        {/* Tips / Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Pro Tips</h3>
            <ul className="space-y-3 text-sm text-indigo-800 dark:text-indigo-300">
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Keep subject lines short and punchy (under 50 chars).
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Include a clear Call to Action (CTA) in your message.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                Avoid spammy words like "Free Money" or excessive "!!!".
              </li>
            </ul>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Safety Note</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Emails are sent via BCC to protect user privacy. Recipients cannot see each other's email addresses.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}