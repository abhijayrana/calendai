import React from "react";
import Provider from "../_trpc/Provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full grow p-2 md:overflow-y-auto md:p-4">
      <Provider>
      {children}
      </Provider>
    </div>
  );
}
