import Link from "next/link";
import Sidebar from "./sidebar";

export default async function TherapistLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ therapistId: string }>;
}) {
  const { therapistId } = await params;

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* SIDEBAR */}
      <Sidebar therapistId={therapistId} />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">


        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 bg-[#FAD2C8]">
          {children}
        </main>
      </div>
    </div>
  );
}