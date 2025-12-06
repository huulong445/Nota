"use client";

import { useConvexAuth } from "convex/react";
import { useConvex } from "convex/react";
import { redirect } from "next/navigation";

import Navigation from "./_components/navigation";
import { Spinner } from "@/components/spinner";
import { SearchCommand } from "@/components/search-command";
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return redirect("/");
  }
  return (
    <div className="h-screen flex dark:bg-[#1f1f1f]">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto flex">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
