"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
export default function Heading() {
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
      <Button>
        Join Nota now <ArrowRight />
      </Button>
    </div>
  );
}
