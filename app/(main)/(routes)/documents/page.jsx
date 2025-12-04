"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
// import { title } from "process";
export default function DocumentPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const create = useMutation(api.documents.create);
  // console.log("User data:", { user, isLoaded, isSignedIn });
  const onCreate = () => {
    const promise = create({ title: "Unititled" });
    toast.promise(promise, {
      loading: "Creating new note...",
      success: "New note created",
      error: "Failed to create a new note",
    });
  };
  return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.svg"
        height="300"
        width="300"
        alt="Empty"
        className="dark:hidden"
      />
      <Image
        src="/empty.svg"
        height="300"
        width="300"
        alt="Empty Dark"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName || user?.username || "User"}&apos;s Nota
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  );
}
