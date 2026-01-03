"use client";

import { useState, useEffect, useMemo } from "react";
import { File, FileText } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { api } from "@/convex/_generated/api";

// Helper function to extract plain text from BlockNote JSON content
function extractTextFromContent(content: string | undefined): string {
  if (!content) return "";

  try {
    const blocks = JSON.parse(content);

    const extractText = (items: any[]): string => {
      let text = "";

      for (const item of items) {
        // Extract text from content array (for paragraphs, headings, lists, etc.)
        if (item.content && Array.isArray(item.content)) {
          for (const contentItem of item.content) {
            if (contentItem.type === "text" && contentItem.text) {
              text += contentItem.text + " ";
            }
          }
        }

        // Handle table content (content is an object with tableContent type)
        if (
          item.content &&
          item.content.type === "tableContent" &&
          item.content.rows
        ) {
          for (const row of item.content.rows) {
            if (row.cells && Array.isArray(row.cells)) {
              for (const cell of row.cells) {
                // Each cell has content array with text items
                if (cell.content && Array.isArray(cell.content)) {
                  for (const cellContent of cell.content) {
                    if (cellContent.type === "text" && cellContent.text) {
                      text += cellContent.text + " ";
                    }
                  }
                }
              }
            }
          }
        }

        // Recursively extract from children
        if (item.children && Array.isArray(item.children)) {
          text += extractText(item.children);
        }
      }

      return text;
    };

    return extractText(blocks).toLowerCase().trim();
  } catch {
    return "";
  }
}

export function SearchCommand() {
  const { user } = useUser();
  const router = useRouter();
  const documents = useQuery(api.documents.getSearch);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);
  const setSearchHighlight = useSearch((store) => store.setSearchHighlight);

  // Process documents to include searchable content
  const processedDocuments = useMemo(() => {
    if (!documents) return [];

    return documents.map((doc) => ({
      ...doc,
      searchableContent: extractTextFromContent(doc.content),
    }));
  }, [documents]);

  // Filter documents based on search query (title and content)
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return processedDocuments;

    const query = searchQuery.toLowerCase();

    return processedDocuments.filter((doc) => {
      const titleMatch = doc.title.toLowerCase().includes(query);
      const contentMatch = doc.searchableContent.includes(query);
      return titleMatch || contentMatch;
    });
  }, [processedDocuments, searchQuery]);

  const onSelect = (id: string, isContentMatchResult: boolean) => {
    // If matched by content, set the search highlight for scrolling
    if (isContentMatchResult && searchQuery.trim()) {
      setSearchHighlight(searchQuery.trim());
    }
    router.push(`/documents/${id}`);
    onClose();
    setSearchQuery("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery("");
      onClose();
    }
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        // mac and win
        event.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Check if a document matched by content (not title)
  const isContentMatch = (doc: (typeof filteredDocuments)[0]) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(query);
    return !titleMatch && doc.searchableContent.includes(query);
  };

  // Get a snippet of matching content with parts for highlighting
  const getContentSnippet = (doc: (typeof filteredDocuments)[0]) => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    const content = doc.searchableContent;
    const index = content.indexOf(query);

    if (index === -1) return null;

    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + query.length + 30);

    const prefix = (start > 0 ? "..." : "") + content.slice(start, index);
    const match = content.slice(index, index + query.length);
    const suffix =
      content.slice(index + query.length, end) +
      (end < content.length ? "..." : "");

    return { prefix, match, suffix };
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder={`Search ${user?.fullName}'s Nota...`}
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents">
          {filteredDocuments.map((document) => {
            const contentMatch = isContentMatch(document);
            const snippet = getContentSnippet(document);

            return (
              <CommandItem
                key={document._id}
                value={`${document._id}-${document.title}-${document.searchableContent}`}
                title={document.title}
                onSelect={() => onSelect(document._id, contentMatch)}
                className="flex flex-col items-start gap-1"
              >
                <div className="flex items-center w-full">
                  {document.icon ? (
                    <p className="mr-2 text-[18px]">{document.icon}</p>
                  ) : (
                    <File className="mr-2 h-4 w-4" />
                  )}
                  <span>{document.title}</span>
                  {contentMatch && (
                    <FileText className="ml-auto h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                {contentMatch && snippet && (
                  <p className="text-xs text-muted-foreground pl-6 truncate w-full">
                    {snippet.prefix}
                    <span className="font-bold text-foreground bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
                      {snippet.match}
                    </span>
                    {snippet.suffix}
                  </p>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
