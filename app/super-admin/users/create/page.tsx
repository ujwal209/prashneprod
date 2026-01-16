// This is a Server Component to fetch data
import { getCompanyOptions } from "@/actions/super-admin";
import { CreateAdminFormClient } from "./form-client"; // Separate client component for interactivity

export default async function CreateAdminPage() {
  const companies = await getCompanyOptions();

  return (
    <div className="flex-1 flex flex-col p-8 max-w-2xl mx-auto w-full justify-center">
        <CreateAdminFormClient companies={companies} />
    </div>
  );
}