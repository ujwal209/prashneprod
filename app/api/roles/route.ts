import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch from a real-world external source (Open Source Job Title List)
    // This is a raw JSON file hosted on GitHub containing thousands of job titles.
    const externalResponse = await fetch(
      "https://raw.githubusercontent.com/jneidel/job-titles/master/job-titles.json",
      { next: { revalidate: 86400 } } // Cache this for 24 hours (Next.js Caching)
    );

    if (!externalResponse.ok) {
      throw new Error("Failed to fetch from external provider");
    }

    const allTitles: string[] = await externalResponse.json();

    // 2. Filter for Tech/Engineering roles only
    // Real-world lists are huge (CEO, Nurse, etc.), so we curate it for "Prashne".
    const techKeywords = ["Developer", "Engineer", "Architect", "Data", "QA", "Tester", "Security", "DevOps", "Full Stack", "Frontend", "Backend", "Product Manager", "Designer"];
    
    const techRoles = allTitles
      .filter((title) => techKeywords.some((keyword) => title.includes(keyword)))
      .slice(0, 50) // Limit to top 50 for performance (or implement search later)
      .map((title) => ({
        id: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        label: title,
        category: getCategory(title),
      }));

    return NextResponse.json(techRoles);

  } catch (error) {
    console.error("External API Error:", error);
    // Fallback data in case external API fails
    return NextResponse.json([
      { id: "fallback-fe", label: "Frontend Developer", category: "Engineering" },
      { id: "fallback-be", label: "Backend Developer", category: "Engineering" },
    ]);
  }
}

// Helper to categorize roles based on keywords
function getCategory(title: string) {
  if (title.includes("Manager") || title.includes("Lead")) return "Leadership";
  if (title.includes("Data") || title.includes("Scientist")) return "Data";
  if (title.includes("Design")) return "Design";
  if (title.includes("Security")) return "Security";
  return "Engineering";
}