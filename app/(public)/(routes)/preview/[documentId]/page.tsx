"use client";
import { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Editor } from "@/components/editor";
import { Cover } from "@/components/cover";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Logo from "@/app/(landing)/_components/logo";
interface DocumentIdPageProps {
  params: Promise<{
    documentId: Id<"documents">; // params is now a promise and needs to be unwrapped with React.use()
  }>;
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const router = useRouter();
  const { documentId } = use(params);
  const update = useMutation(api.documents.update);
  const onChange = (content: string) => {
    update({
      id: documentId,
      content,
    });
  };

  const document = useQuery(api.documents.getById, {
    documentId,
  });

  if (document === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="h-screen w-full relative">
        <div className="absolute top-6 ml-3">
          <Logo />
        </div>

        <div className="h-full flex flex-col items-center justify-center space-y-4 px-4">
          <h1 className="text-3xl font-bold text-center">
            This page couldn&apos;t be found
          </h1>
          <p className="text-muted-foreground text-center max-w-md">
            You may not have access, or it might have been deleted or moved.
            Check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40 h-screen w-full">
      <Cover preview url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar preview initialData={document} />
        <Editor
          editable={false}
          onChange={onChange}
          initialContent={document.content}
        />
      </div>
    </div>
  );
}
