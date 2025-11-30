"use client";

import UseScrollTop from "../../../hooks/useScrollTop";
import { ModeToggle } from "@/components/mode-toggle";
import Logo from "./logo";
import { cn } from "@/lib/utils";
// import Logo from "./logo";
export default function Navbar() {
  const scrolled = UseScrollTop();
  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1f1f1f] fixed flex items-center w-full p-6",
        scrolled && "border-b shadow-sm border-gray-50"
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between flex items-center gap-x-2">
        <ModeToggle />
      </div>
    </div>
  );
}
