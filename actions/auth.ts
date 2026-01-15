"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { headers } from "next/headers";

const SignupSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function signupCandidate(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const data = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const validatedFields = SignupSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please fix the errors below.",
        };
    }

    const { email, password, fullName } = validatedFields.data;

    // Sign up with Supabase
    const origin = (await headers()).get("origin");

    // Role 'candidate' is passed in meta_data for the trigger/hooks to use if needed,
    // or simply stored in the AUTH user metadata.
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: "candidate",
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error("Signup error:", error);
        return {
            message: error.message,
        };
    }

    // Redirect to verification page
    redirect("/auth/verify-email");
}

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get("email"),
        password: formData.get("password")
    }

    const validatedFields = LoginSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            message: "Invalid inputs"
        }
    }

    const { email, password } = validatedFields.data

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        return {
            message: error.message
        }
    }

    revalidatePath('/', 'layout')
    redirect("/")
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
}
