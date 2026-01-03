"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TitleProps {
  initialData: Doc<"documents">;
}
export const Title = ({ initialData }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useMutation(api.documents.update);

  // Fetch the full path of parent documents
  const documentPath = useQuery(api.documents.getDocumentPath, {
    documentId: initialData._id,
  });

  const [title, setTitle] = useState(initialData.title || "Untitiled");
  const [isEditing, setIsEditing] = useState(false);

  function enableInput() {
    setTitle(initialData.title);
    setIsEditing(true);
    // increase real time experience ?
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  }

  function disableInput() {
    setIsEditing(false);
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
    update({
      id: initialData._id,
      title: event.target.value || "Unititled",
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      disableInput();
    }
  }
  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1"
        >
          <span className="truncate">
            {initialData.isTemplate ? (
              <>
                <span className="text-muted-foreground">Templates</span>
                <span className="mx-1">/</span>
                {initialData?.title}
              </>
            ) : (
              <>
                {documentPath && documentPath.length > 0 && (
                  <>
                    {documentPath.map((doc, index) => (
                      <React.Fragment key={doc.id}>
                        {doc.icon && <span className="mr-1">{doc.icon}</span>}
                        {doc.title}
                        {index < documentPath.length && (
                          <span className="mx-1">/</span>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
                {initialData?.title}
              </>
            )}
          </span>
        </Button>
      )}
    </div>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-6 w-20 rounded-md" />;
};
