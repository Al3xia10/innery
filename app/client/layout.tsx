import React from "react";
import ClientSidebar from "./sidebar";
import GroundingDock from "./components/grounding/GroundingDock";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh bg-gray-50">
      <ClientSidebar />

      <main className="flex-1 p-6 md:p-10 bg-[#FAD2C8]">
        {children}
        <GroundingDock />
      </main>
    </div>
  );
}