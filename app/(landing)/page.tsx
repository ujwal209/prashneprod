"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowRight, Code2, Users, FileText, BrainCircuit, 
  Trophy, Target, Zap, Terminal, BarChart3, Globe,
  CheckCircle2, Layers, Sparkles, Search, Star, Check, Quote
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function Home() {
  const [userType, setUserType] = useState<"candidate" | "recruiter">("candidate")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black selection:bg-indigo-500/20">
      
      {/* --- BACKGROUND GRIDS --- */}
      <div className="fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10">
        <div className="container px-4 md:px-6 relative text-center">
          
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
              The AI Standard for Hiring
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-5xl mx-auto mb-8 text-zinc-900 dark:text-white animate-in fade-in slide-in-from-bottom-6 duration-700">
            {userType === "candidate" ? (
              <>
                Prove your skills.<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-zinc-600 dark:from-indigo-400 dark:to-zinc-400">
                  Get the offer.
                </span>
              </>
            ) : (
              <>
                Hire the top 1%.<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-zinc-600 dark:from-indigo-400 dark:to-zinc-400">
                  Skip the noise.
                </span>
              </>
            )}
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {userType === "candidate"
              ? "The only AI-powered platform that simulates real-world interviews, grades your system design, and validates your code before you ever speak to a recruiter."
              : "Stop reading thousands of resumes. Our vector-engine matches candidates based on deep semantic understanding of your technical requirements."}
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
            <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full flex items-center border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setUserType("candidate")}
                className={cn(
                  "px-8 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  userType === "candidate" 
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                Developers
              </button>
              <button
                onClick={() => setUserType("recruiter")}
                className={cn(
                  "px-8 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  userType === "recruiter" 
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                Recruiters
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <Button size="lg" asChild className="h-12 px-8 text-sm font-medium rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              <Link href={userType === "candidate" ? "/auth/signup" : "/auth/login"}>
                {userType === "candidate" ? "Start Practice" : "Start Hiring"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-sm font-medium rounded-full bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <Link href="/about">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --- VISUAL INTERFACE DEMO (New Section) --- */}
      <section className="py-12 z-10 relative">
        <div className="container px-4 md:px-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 md:p-4 shadow-2xl">
             <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden relative aspect-[16/9] md:aspect-[21/9]">
                {/* Mock UI Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="ml-4 text-xs text-zinc-400 font-mono">prashne-ai-tutor — v2.4.0</div>
                </div>
                {/* Mock UI Body */}
                <div className="p-6 md:p-10 font-mono text-sm">
                   <div className="text-zinc-400 mb-4">$ ./start_interview_session --mode=system_design</div>
                   <div className="text-indigo-600 dark:text-indigo-400 mb-2">AI Interviewer (Ruthless Mode):</div>
                   <div className="text-zinc-800 dark:text-zinc-200 mb-6 max-w-3xl">
                     "Let's design a rate limiter for a distributed system handling 1 million requests per second. How would you handle race conditions in a Redis cluster without compromising latency?"
                   </div>
                   <div className="flex gap-2 items-center">
                      <span className="text-emerald-500">➜</span>
                      <span className="inline-block w-2 h-5 bg-zinc-400 animate-pulse"></span>
                   </div>
                </div>
                {/* Abstract overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-black dark:via-transparent dark:to-transparent opacity-50 pointer-events-none" />
             </div>
          </div>
        </div>
      </section>

      {/* --- TRUSTED BY --- */}
      <section className="py-10 border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-black/50 backdrop-blur-sm z-10">
        <div className="container px-4 text-center">
          <p className="text-xs font-medium text-zinc-500 mb-8 uppercase tracking-widest">
            {userType === "candidate" ? "Join developers from" : "Powering hiring at"}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Using text for demo, replace with SVGs */}
             {['ACME INC', 'VERCEL', 'LINEAR', 'RAYCAST', 'OPENAI'].map((company) => (
              <span key={company} className="text-lg font-bold font-mono tracking-tighter">{company}</span>
             ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES BENTO GRID --- */}
      <section className="py-24 relative z-10 bg-white dark:bg-black">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-4">
              Everything you need to <span className="text-indigo-600 dark:text-indigo-400">{userType === "candidate" ? "excel" : "scale"}</span>.
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              Powerful tools designed for the modern technical landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {userType === "candidate" ? (
              <>
                <FeatureCard 
                  icon={<BrainCircuit />}
                  title="AI Simulation"
                  desc="Practice with realistic personas (Friendly, Neutral, Ruthless). Get real-time feedback."
                />
                <FeatureCard 
                  icon={<Code2 />}
                  title="Socratic Tutor"
                  desc="Don't just get the answer. Our AI guides you with hints to build intuition."
                />
                <FeatureCard 
                  icon={<Trophy />}
                  title="Global Rank"
                  desc="Compete with peers, maintain streaks, and earn badges on the leaderboard."
                />
                <FeatureCard 
                  icon={<FileText />}
                  title="Resume Scan"
                  desc="Analyze your resume against Job Descriptions to find missing keywords."
                />
                <FeatureCard 
                  icon={<Target />}
                  title="Goal Tracking"
                  desc="Set a target role (e.g. Google L4). We create your roadmap."
                />
                <FeatureCard 
                  icon={<Zap />}
                  title="System Design"
                  desc="Draw diagrams and explain architecture choices to an AI architect."
                />
              </>
            ) : (
              <>
                <FeatureCard 
                  icon={<Layers />}
                  title="Bulk Parsing"
                  desc="Upload hundreds of resumes. Extract skills and experience instantly."
                />
                <FeatureCard 
                  icon={<Search />}
                  title="Vector Match"
                  desc="Semantic search that finds candidates based on context, not just keywords."
                />
                <FeatureCard 
                  icon={<Sparkles />}
                  title="Auto-Screen"
                  desc="AI conducts the first round of screening calls, saving you 100+ hours."
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS (New Section) --- */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 md:px-6">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold tracking-tighter mb-4 text-zinc-900 dark:text-white">Loved by Engineers</h2>
             <p className="text-zinc-500 dark:text-zinc-400">Join 10,000+ developers prepping with Prashne.</p>
           </div>
           <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard 
                quote="I failed 3 Amazon interviews before using Prashne. The 'Ruthless Mode' AI prep was actually harder than the real thing. I got the offer last week."
                author="Sarah J."
                role="SDE II at Amazon"
              />
              <TestimonialCard 
                quote="The System Design drawing tool is a game changer. Being able to sketch architecture and get AI feedback on bottlenecks is incredible."
                author="David Chen"
                role="Senior Engineer at Stripe"
              />
              <TestimonialCard 
                quote="As a recruiter, the vector matching saved me weeks. It found a candidate who didn't use the exact keywords but had the perfect experience."
                author="Elena R."
                role="Tech Recruiter at Meta"
              />
           </div>
        </div>
      </section>

      {/* --- PRICING (New Section) --- */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="container px-4 md:px-6">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold tracking-tighter mb-4 text-zinc-900 dark:text-white">Simple, Transparent Pricing</h2>
             <div className="flex items-center justify-center gap-4 mt-6">
                <span className={cn("text-sm font-medium", billingCycle === "monthly" ? "text-zinc-900 dark:text-white" : "text-zinc-500")}>Monthly</span>
                <button 
                  onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
                  className="relative w-11 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className={cn("absolute top-1 left-1 bg-white dark:bg-zinc-400 w-4 h-4 rounded-full transition-transform", billingCycle === "yearly" ? "translate-x-5" : "translate-x-0")} />
                </button>
                <span className={cn("text-sm font-medium", billingCycle === "yearly" ? "text-zinc-900 dark:text-white" : "text-zinc-500")}>Yearly <span className="text-indigo-500 text-xs ml-1 font-bold">-20%</span></span>
             </div>
           </div>

           <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {/* Free Tier */}
              <PricingCard 
                title="Free"
                price="$0"
                features={["3 AI Mock Interviews/mo", "50 Practice Problems", "Basic Resume Scan", "Community Support"]}
                buttonText="Get Started"
                variant="outline"
              />
              {/* Pro Tier (Highlighted) */}
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-10 rounded-3xl" />
                <PricingCard 
                  title="Pro"
                  price={billingCycle === "monthly" ? "$19" : "$15"}
                  period="/month"
                  features={["Unlimited AI Interviews", "Full System Design Tool", "Deep Code Analysis", "Priority Support", "Verified Badge"]}
                  buttonText="Upgrade to Pro"
                  variant="primary"
                  popular
                />
              </div>
              {/* Team Tier */}
              <PricingCard 
                title="Team"
                price="$99"
                period="/seat/mo"
                features={["For Hiring Teams", "Bulk Resume Parsing", "Auto-Screening Agents", "ATS Integration", "Dedicated Success Manager"]}
                buttonText="Contact Sales"
                variant="outline"
              />
           </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Minimal) --- */}
      <section className="py-24 z-10 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-12">
             <Step 
               number="01" 
               title="Practice" 
               desc="Solve curated problems in our LeetCode-style editor." 
             />
             <Step 
               number="02" 
               title="Analyze" 
               desc="Get detailed breakdown of your code quality & efficiency." 
             />
             <Step 
               number="03" 
               title="Succeed" 
               desc="Match with top companies looking for your specific skill set." 
             />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black z-10">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700">
                <Image 
                  src="/logo.png" 
                  alt="Prashne Logo" 
                  fill 
                  className="object-contain p-1" 
                />
              </div>
              <span className="font-bold text-zinc-900 dark:text-white">Prashne</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Twitter</Link>
            </div>
            <p className="text-xs text-zinc-400">© 2024 Prashne Inc.</p>
        </div>
      </footer>

    </div>
  )
}

// --- SUBCOMPONENTS ---

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 transition-all duration-300">
      <CardContent className="p-8">
        <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors duration-300">
          <div className="h-6 w-6">{icon}</div>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
          {desc}
        </p>
      </CardContent>
    </Card>
  )
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 hover:border-indigo-500 transition-colors duration-300">
      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 tracking-widest">{number}</span>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
      <CardContent className="p-8 flex flex-col h-full">
         <Quote className="h-8 w-8 text-indigo-200 dark:text-indigo-900/50 mb-4" />
         <p className="text-zinc-600 dark:text-zinc-300 mb-6 flex-grow leading-relaxed">"{quote}"</p>
         <div>
            <div className="font-bold text-zinc-900 dark:text-white">{author}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">{role}</div>
         </div>
      </CardContent>
    </Card>
  )
}

function PricingCard({ title, price, period, features, buttonText, variant, popular }: any) {
  return (
    <Card className={cn(
      "relative border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300",
      popular ? "border-indigo-500 dark:border-indigo-500 shadow-xl scale-105 z-10" : "hover:border-zinc-300 dark:hover:border-zinc-700"
    )}>
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
          Most Popular
        </div>
      )}
      <CardContent className="p-8">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">{title}</h3>
        <div className="flex items-baseline gap-1 mb-6">
           <span className="text-4xl font-bold text-zinc-900 dark:text-white">{price}</span>
           {period && <span className="text-zinc-500">{period}</span>}
        </div>
        <ul className="space-y-3 mb-8">
           {features.map((feat: string, i: number) => (
             <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
               <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
               {feat}
             </li>
           ))}
        </ul>
        <Button 
          className={cn(
            "w-full rounded-full", 
            variant === 'primary' 
              ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
          )}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}