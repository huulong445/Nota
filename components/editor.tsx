"use client";
import { useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import { useEdgeStore } from "@/lib/edgestore";
import { useSearch } from "@/hooks/useSearch";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

export const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const searchHighlight = useSearch((store) => store.searchHighlight);
  const clearSearchHighlight = useSearch((store) => store.clearSearchHighlight);

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({
      file,
    });
    return response.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  // Scroll to and highlight search match
  useEffect(() => {
    if (!searchHighlight || !editor) return;

    const scrollToMatch = () => {
      // Wait for editor to be fully rendered
      setTimeout(() => {
        const editorElement = document.querySelector(".bn-editor");
        if (!editorElement) return;

        const searchText = searchHighlight.toLowerCase();

        // Find all text nodes in the editor
        const walker = document.createTreeWalker(
          editorElement,
          NodeFilter.SHOW_TEXT,
          null
        );

        let node: Text | null;
        while ((node = walker.nextNode() as Text | null)) {
          const text = node.textContent?.toLowerCase() || "";
          const index = text.indexOf(searchText);

          if (index !== -1) {
            // Found the match - scroll to it
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + searchHighlight.length);

            const element = node.parentElement;

            if (element) {
              // Scroll to the element
              element.scrollIntoView({ behavior: "smooth", block: "center" });

              // Create temporary highlight
              const mark = document.createElement("mark");
              mark.style.backgroundColor =
                resolvedTheme === "dark" ? "#854d0e" : "#fef08a";
              mark.style.borderRadius = "2px";
              mark.style.padding = "1px 2px";

              range.surroundContents(mark);

              // Remove highlight after x seconds
              setTimeout(() => {
                const parent = mark.parentNode;
                if (parent) {
                  while (mark.firstChild) {
                    parent.insertBefore(mark.firstChild, mark);
                  }
                  parent.removeChild(mark);
                }
              }, 3000);
            }

            break;
          }
        }

        // Clear the search highlight after processing
        clearSearchHighlight();
      }, 500);
    };

    scrollToMatch();
  }, [searchHighlight, editor, clearSearchHighlight, resolvedTheme]);

  const handleEditorChange = useCallback(() => {
    try {
      // Check if editor and document are still valid before accessing
      if (editor && editor.document) {
        onChange(JSON.stringify(editor.document, null, 2));
      }
    } catch (error) {
      // Silently handle the error when blocks are deleted via keyboard
      // prevents crashes when deleting tables or other complex blocks
      console.warn("Editor change handler caught an error:", error);
    }
  }, [editor, onChange]);

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={editable}
        onChange={handleEditorChange}
      />
    </div>
  );
};
