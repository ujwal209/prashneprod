import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MailCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyEmailPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <Card className="max-w-md w-full text-center border-border/60 shadow-lg">
                <CardHeader className="flex flex-col items-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <MailCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                    <CardDescription>
                        We've sent you a verification link. Please click on it to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Once verified, you will be redirected to the onboarding/login page.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/auth/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
