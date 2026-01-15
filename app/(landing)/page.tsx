"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image" // 👈 Imported
import { 
  ArrowRight, Code2, Users, FileText, BrainCircuit, 
  Trophy, Target, Zap, CheckCircle2, Terminal, BarChart3, Globe 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function Home() {
  const [userType, setUserType] = useState<"candidate" | "recruiter">("candidate")

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black selection:bg-indigo-500/30">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 z-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10">
        <div className="container px-4 md:px-6 relative text-center">
          
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">The Future of Tech Hiring</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl mx-auto mb-6 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {userType === "candidate" ? (
              <>
                Master the Code.<br />
                <span className="text-indigo-600 dark:text-indigo-400">Ace the Interview.</span>
              </>
            ) : (
              <>
                Find Top Talent.<br />
                <span className="text-violet-600 dark:text-violet-400">Fast & Precise.</span>
              </>
            )}
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {userType === "candidate"
              ? "Join thousands of developers using our AI Interview Simulator, Socratic Tutor, and Gamified Problem Sets to land their dream jobs."
              : "Streamline your hiring with AI-powered resume parsing and vector-based candidate matching. Filter the best from the rest in seconds."}
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
            <div className="bg-zinc-100 dark:bg-zinc-900/80 p-1.5 rounded-full flex items-center border border-zinc-200 dark:border-zinc-800 shadow-inner">
              <button
                onClick={() => setUserType("candidate")}
                className={cn(
                  "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                  userType === "candidate" 
                    ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                I am a Developer
              </button>
              <button
                onClick={() => setUserType("recruiter")}
                className={cn(
                  "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                  userType === "recruiter" 
                    ? "bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                I am a Recruiter
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <Button size="lg" asChild className="h-14 px-8 text-base font-semibold rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25">
              <Link href={userType === "candidate" ? "/auth/signup" : "/auth/login"}>
                {userType === "candidate" ? "Start Practicing Free" : "Start Hiring Now"} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base font-semibold rounded-full bg-white/50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <Link href="/about">View Demo</Link>
            </Button>
          </div>

        </div>
      </section>

      {/* --- TRUSTED BY SECTION --- */}
      <section className="py-12 border-y border-zinc-200/50 dark:border-zinc-800/50 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm relative z-10">
        <div className="container px-4 text-center">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-8 uppercase tracking-widest">
            {userType === "candidate" ? "Developers landing jobs at" : "Trusted by hiring teams at"}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Replace with SVGs of company logos. Using text for now as placeholders */}
            {['Acme Corp', 'GlobalTech', 'Nebula AI', 'Quant Systems', 'BluePeak'].map((company) => (
              <span key={company} className="text-xl font-bold text-zinc-400 dark:text-zinc-600 cursor-default select-none">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATISTICS SECTION --- */}
      <section className="py-20 relative z-10">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">10k+</div>
                <div className="text-sm text-zinc-500 font-medium">Active Developers</div>
             </div>
             <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-violet-600 dark:text-violet-400">50k+</div>
                <div className="text-sm text-zinc-500 font-medium">Problems Solved</div>
             </div>
             <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">5k+</div>
                <div className="text-sm text-zinc-500 font-medium">Mock Interviews</div>
             </div>
             <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">92%</div>
                <div className="text-sm text-zinc-500 font-medium">Hiring Success Rate</div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 relative z-10 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-900 dark:text-white">
              Powerful Features for <span className="text-indigo-600 dark:text-indigo-400">{userType === "candidate" ? "Growth" : "Scale"}</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
              Everything you need to {userType === "candidate" ? "supercharge your coding skills and interview readiness" : "automate your recruitment pipeline and find hidden gems"}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userType === "candidate" ? (
              <>
                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                      <BrainCircuit className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">AI Interview Simulator</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Practice with realistic personas (Friendly, Neutral, Ruthless). Get real-time feedback on your answers and demeanor.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
                      <Code2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Socratic Code Tutor</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Don't just get the answer. Our AI guides you with hints and helps you build deep problem-solving intuition.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                      <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Global Leaderboard</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Compete with peers, maintain streaks, and earn badges. Track your ranking in the global developer community.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                      <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Smart Resume Scan</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Analyze your resume against Job Descriptions. Find missing keywords and get actionable advice.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 backdrop-blur-sm hover:border-rose-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
                      <Target className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Goal Tracking</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Set a target role (e.g., "Google L4"). We'll curate a personalized roadmap and track your readiness percentage.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-6">
                      <Zap className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">System Design</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Tackle complex architecture problems. Draw diagrams and explain your choices to our AI architect.
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Recruiter Cards
              <>
                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Bulk Resume Parsing</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Upload hundreds of resumes. Our AI extracts skills, experience, and education instantly.
                    </p>
                  </CardContent>
                </Card>
                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Vector Matching</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Semantic search that goes beyond keywords. Find candidates who truly match the job description context.
                    </p>
                  </CardContent>
                </Card>
                <Card className="group border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-6">
                      <BrainCircuit className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Auto-Screening</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Let AI conduct the first round of screening calls and code tests, shortlisting only the top 5% for you.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION (Simple Steps) --- */}
      <section className="py-24 relative z-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-900 dark:text-white">
              How Prashne Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
             <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-800">
                   <Terminal className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Practice</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Solve curated problems in our LeetCode-style editor with Socratic AI help.</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-800">
                   <BarChart3 className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Analyze</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Get detailed breakdown of your code quality, efficiency, and interview soft skills.</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-800">
                   <Globe className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Get Hired</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Match with top companies looking for your specific skill set and verified performance.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[200%] bg-violet-600/50 blur-[150px] rotate-12"></div>
        </div>
        <div className="container px-4 md:px-6 relative text-center">
           <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
              Ready to {userType === "candidate" ? "level up your career?" : "transform your hiring?"}
           </h2>
           <p className="text-indigo-100 max-w-2xl mx-auto text-lg mb-10">
              Join the platform that is redefining how developers prepare and how companies hire.
           </p>
           <Button size="lg" asChild className="h-14 px-8 text-base font-semibold rounded-full bg-white text-indigo-600 hover:bg-zinc-100 shadow-xl">
              <Link href="/auth/signup">Get Started Now</Link>
           </Button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-3 mb-4 group">
                {/* LOGO IMPORTED HERE */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden">
                  <Image 
                    src="/logo.png" 
                    alt="Prashne Logo" 
                    width={22} 
                    height={22} 
                    className="object-contain" 
                  />
                </div>
                <span className="text-zinc-900 dark:text-white">Prashne</span>
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                The comprehensive AI platform for developers to master their craft and recruiters to find the perfect match.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">For Candidates</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">For Recruiters</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              © {new Date().getFullYear()} Prashne Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}