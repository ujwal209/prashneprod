"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Code2, Users, FileText, BrainCircuit, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [userType, setUserType] = useState<"candidate" | "recruiter">("candidate")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm">
              The Two-Sided AI Recruitment Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 pb-2">
              {userType === "candidate"
                ? "Master the Code. "
                : "Find Top Talent. "}
              <span className="text-primary block mt-2">
                {userType === "candidate" ? "Ace the Interview." : "Fast & Precise."}
              </span>
            </h1>

            <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground">
              {userType === "candidate"
                ? "Join thousands of developers practicing with our Socratic AI Tutor. Get real-time hints, not just answers, and build deep intuition."
                : "Streamline your hiring with AI-powered resume parsing and vector-based candidate matching. Filter the best from the rest in seconds."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center">
              <div className="bg-muted p-1 rounded-full flex items-center border border-border">
                <button
                  onClick={() => setUserType("candidate")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${userType === "candidate" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  I am a Developer
                </button>
                <button
                  onClick={() => setUserType("recruiter")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${userType === "recruiter" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  I am a Recruiter
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                <Link href={userType === "candidate" ? "/practice" : "/dashboard"}>
                  {userType === "candidate" ? "Start Practicing" : "Start Hiring"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-10 opacity-50 dark:opacity-20 animate-pulse" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Platform Features
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Everything you need to {userType === "candidate" ? "supercharge your coding skills" : "streamline your recruitment process"}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userType === "candidate" ? (
              <>
                <Card className="border-border/60 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <BrainCircuit className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Socratic AI Tutor</CardTitle>
                    <CardDescription>
                      Get guided hints instead of direct answers. Build problem-solving intuition effectively.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border/60 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <Code2 className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>LeetCode-style Editor</CardTitle>
                    <CardDescription>
                      Practice in a familiar environment with support for multiple languages and test cases.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border/60 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <Terminal className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                      Track your progress, identify weak spots, and improve systematically.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-border/60 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <FileText className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Bulk Resume Parsing</CardTitle>
                    <CardDescription>
                      Upload hundreds of resumes at once and let our AI extract key details automatically.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border/60 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Vector Matching</CardTitle>
                    <CardDescription>
                      Match candidates to Job Descriptions using advanced semantic search for high relevance.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border/60 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <BrainCircuit className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Automated Screening</CardTitle>
                    <CardDescription>
                      Let AI handle the initial screening to shortlist the most promising talent for you.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                <span className="text-primary text-2xl">Prashne</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Bridging the gap between talent and opportunity with AI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">For Candidates</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">For Recruiters</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Prashne. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {/* Socials placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
