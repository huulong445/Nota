"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import Item from "./item";
import { FileIcon, FileText } from "lucide-react";

interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
}

export default function DocumentList({
  parentDocumentId,
  level = 0,
}: DocumentListProps) {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const moveDocument = useMutation(api.documents.moveDocument);

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: parentDocumentId,
  });

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const hasContent = (content: string | undefined | null) => {
    if (!content || content.trim().length === 0) return false;

    try {
      const parsed = JSON.parse(content);
      // Check if it's an empty array or array with only empty blocks
      if (Array.isArray(parsed)) {
        return parsed.some((block) => {
          // Check if block has meaningful content
          if (block.content) {
            return Array.isArray(block.content)
              ? block.content.some(
                  (item: { text?: string }) =>
                    item.text && item.text.trim().length > 0
                )
              : false;
          }
          return false;
        });
      }
      return false;
    } catch {
      // If not JSON, treat as plain text
      return content.trim().length > 0;
    }
  };

  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  // Drop handlers for moving document to root level
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.types.includes("documentid");
    if (draggedId && level === 0) {
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDropToRoot = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const draggedId = e.dataTransfer.getData("documentId") as Id<"documents">;

    if (!draggedId) return;

    const promise = moveDocument({
      id: draggedId,
      parentDocument: undefined,
    });

    toast.promise(promise, {
      loading: "Moving to root...",
      success: "Document moved to root",
      error: "Failed to move document",
    });
  };

  return (
    <>
      {/* Drop zone for root level - shows when dragging */}
      {level === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropToRoot}
          className={cn(
            "h-1 w-full transition-all",
            isDragOver &&
              "h-8 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded flex items-center justify-center text-xs text-blue-600 dark:text-blue-400"
          )}
        >
          {isDragOver && "Drop here to move to root"}
        </div>
      )}
      {/* no pages => display the text */}
      <p
        style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>
      {documents.map((document) => {
        return (
          <div key={document._id}>
            <Item
              id={document._id}
              onClick={() => onRedirect(document._id)}
              label={document.title}
              icon={hasContent(document.content) ? FileText : FileIcon}
              documentIcon={document.icon}
              active={params.documentId === document._id}
              level={level}
              onExpand={() => onExpand(document._id)}
              expanded={expanded[document._id]}
              isFavorite={document.isFavorite}
            />
            {expanded[document._id] && (
              <DocumentList parentDocumentId={document._id} level={level + 1} />
            )}
          </div>
        );
      })}
    </>
  );
}
