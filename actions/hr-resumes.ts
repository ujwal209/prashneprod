"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Gemini
const PDFParser = require("pdf2json");

// Admin Client
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Init Gemini

// --- MAIN UPLOAD ACTION ---
export async function uploadResumeAction(prevState: any, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, message: "No file provided" };

  // 1. Auth Check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // 2. Get Company ID
  let companyId = null;
  const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
  if (admin) companyId = admin.company_id;
  else {
    const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
    if (hrUser) companyId = hrUser.company_id;
  }
  if (!companyId) return { success: false, message: "Company not found" };

  try {
    // 3. Extract Text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const rawText = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent());
        });
        pdfParser.parseBuffer(buffer);
    });

    if (!rawText || rawText.length < 50) throw new Error("PDF empty.");

    // 4. Groq Analysis (Extract JSON)
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a resume parser. Return valid JSON: candidate_name (string), skills (array string), summary (string max 50 words)."
        },
        {
          role: "user",
          content: `Resume Text: ${rawText.substring(0, 15000)}` 
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // 5. Save to Resumes Table
    const { data: resume, error: dbError } = await supabaseAdmin
      .from("resumes")
      .insert({
        company_id: companyId,
        file_name: file.name,
        file_url: "stored_internally",
        candidate_name: parsedData.candidate_name || "Unknown",
        skills: parsedData.skills || [],
        summary: parsedData.summary || "",
        raw_text: rawText,
        status: 'ready'
      })
      .select()
      .single();

    if (dbError) throw new Error(dbError.message);

    // 6. Vectorize with GEMINI
    const textToVectorize = `Candidate: ${parsedData.candidate_name}. Skills: ${parsedData.skills?.join(", ")}. Summary: ${parsedData.summary}`;
    const embedding = await getGeminiEmbedding(textToVectorize);
    
    if (embedding.length > 0) {
        await supabaseAdmin.from("resume_embeddings").insert({
            resume_id: resume.id,
            embedding: embedding
        });
    }

    revalidatePath("/hr-admin/resumes");
    return { success: true, message: "Resume processed successfully!" };

  } catch (error: any) {
    console.error("Processing Error:", error);
    return { success: false, message: "Failed: " + error.message };
  }
}

// --- HELPER: GEMINI EMBEDDINGS ---
async function getGeminiEmbedding(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values; // Returns array of 768 floats
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    return [];
  }
}

// --- GET RESUMES ---
export async function getResumes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let companyId = null;
  const { data: admin } = await supabaseAdmin.from("hr_admins").select("company_id").eq("id", user.id).single();
  if (admin) companyId = admin.company_id;
  else {
    const { data: hrUser } = await supabaseAdmin.from("hr_users").select("company_id").eq("id", user.id).single();
    if (hrUser) companyId = hrUser.company_id;
  }
  if (!companyId) return [];

  const { data } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data || [];
}