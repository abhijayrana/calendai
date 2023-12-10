import React from "react";
import Provider from "../_trpc/Provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full grow p-6 md:overflow-y-auto md:p-12">
      <Provider>
      {children}
      </Provider>
    </div>
  );
}
