"use client";

import UseScrollTop from "../../../hooks/useScrollTop";
import { ModeToggle } from "@/components/mode-toggle";
import Logo from "./logo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useConvexAuth } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import Link from "next/link";
export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const scrolled = UseScrollTop();
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1f1f1f] fixed flex items-center w-full p-6",
        scrolled && "border-b shadow-sm border-gray-50"
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between flex items-center gap-x-2">
        {isLoading && <Spinner />}

        {/* not logged in */}
        {!isAuthenticated && !isLoading && (
          <>
            <SignInButton>
              <Button size="sm">Sign in</Button>
            </SignInButton>
            {/* <SignInButton>
              <Button size="sm">Get Nota free</Button>
            </SignInButton> */}
          </>
        )}

        {/* logged in */}

        {isAuthenticated && !isLoading && (
          <>
            {/* <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">Enter Nota</Link>
            </Button> */}
            Welcome, {user?.firstName || user?.username || "User"}
            <UserButton afterSwitchSessionUrl="/" />
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
}
