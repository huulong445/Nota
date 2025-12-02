"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import Link from "next/link";
export default function Heading() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
        One workspace. Zero busywork.
      </h1>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
        Welcome to <span className="underline">Nota</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Nota is the connected workspace where better, faster work happens.
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button size="lg">
            Join Nota now <ArrowRight />
          </Button>
        </SignInButton>
      )}

      {isAuthenticated && !isLoading && (
        <>
          <Button size="lg" asChild>
            <Link href="/documents">Enter Nota</Link>
          </Button>
        </>
      )}
    </div>
  );
}
