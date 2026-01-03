"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { File, FolderInput } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useMove } from "@/hooks/useMove";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// SSR-safe way to check if mounted
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function MoveCommand() {
  const { user } = useUser();
  const documents = useQuery(api.documents.getSearch);
  const moveDocument = useMutation(api.documents.moveDocument);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [searchQuery, setSearchQuery] = useState("");

  const isOpen = useMove((store) => store.isOpen);
  const onClose = useMove((store) => store.onClose);
  const documentId = useMove((store) => store.documentId);
  const documentTitle = useMove((store) => store.documentTitle);

  // Filter out the current document and its descendants from the list
  const availableDocuments = useMemo(() => {
    if (!documents || !documentId) return [];

    // Filter by search query and exclude current document
    return documents.filter((doc) => {
      // Exclude the document being moved
      if (doc._id === documentId) return false;

      // Filter by search query if present
      if (searchQuery.trim()) {
        return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    });
  }, [documents, documentId, searchQuery]);

  const handleMove = (targetId: string | undefined) => {
    if (!documentId) return;

    const promise = moveDocument({
      id: documentId,
      parentDocument: targetId as Id<"documents"> | undefined,
    });

    toast.promise(promise, {
      loading: "Moving document...",
      success: "Document moved successfully",
      error: "Failed to move document",
    });

    setSearchQuery("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery("");
      onClose();
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder={`Move "${documentTitle}" to...`}
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No documents found.</CommandEmpty>
        <CommandGroup heading="Move to root">
          <CommandItem
            onSelect={() => handleMove(undefined)}
            className="flex items-center gap-2"
          >
            <FolderInput className="h-4 w-4 text-muted-foreground" />
            <span>Move to root level</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Move inside document">
          {availableDocuments.map((document) => (
            <CommandItem
              key={document._id}
              value={`${document._id}-${document.title}`}
              onSelect={() => handleMove(document._id)}
            >
              {document.icon ? (
                <p className="mr-2 text-[18px]">{document.icon}</p>
              ) : (
                <File className="mr-2 h-4 w-4" />
              )}
              <span>{document.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
