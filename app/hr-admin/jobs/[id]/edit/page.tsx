import { getJobById } from "@/actions/hr-jobs";
import { notFound } from "next/navigation";
import { EditJobForm } from "./edit-form"; // We will create this next

export default async function EditJobPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) return notFound();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Pass job data to the client form */}
      <EditJobForm job={job} />
    </div>
  );
}