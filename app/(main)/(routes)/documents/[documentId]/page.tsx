"use client";
import { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Editor } from "@/components/editor";
interface DocumentIdPageProps {
  params: Promise<{
    documentId: Id<"documents">; // params is now a promise and needs to be unwrapped with React.use()
  }>;
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
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
    return <div>Loading...</div>;
  }

  if (document === null) {
    return <div>Not found</div>;
  }

  return (
    <div className="pb-40">
      <div className="h-[35vh]"></div>
      <div className="md:max-w-3xl lg:max-x-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor onChange={onChange} initialContent={document.content} />
      </div>
    </div>
  );
}
