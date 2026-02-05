import React from "react";
import ClientSidebar from "./sidebar";

export default async function ClientLayout({
children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
    const { clientId } = await params;
    return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar clientId={clientId} />

      <main className="flex-1 p-6 md:p-10 bg-[#FAD2C8]">{children}</main>
    </div>
  );
}