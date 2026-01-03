"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FileIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildDocumentsProps {
  documentId: Id<"documents">;
}

export const ChildDocuments = ({ documentId }: ChildDocumentsProps) => {
  const children = useQuery(api.documents.getSidebar, {
    parentDocument: documentId,
  });

  const hasContent = (content: string | undefined | null) => {
    if (!content || content.trim().length === 0) return false;

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.some((block) => {
          if (block.content) {
            return Array.isArray(block.content)
              ? block.content.some(
                  (item: any) => item.text && item.text.trim().length > 0
                )
              : false;
          }
          return false;
        });
      }
      return false;
    } catch {
      return content.trim().length > 0;
    }
  };

  if (children === undefined) {
    return null;
  }

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className="pl-13">
      {children.map((child) => {
        const Icon = hasContent(child.content) ? FileText : FileIcon;
        return (
          <Link
            key={child._id}
            href={`/documents/${child._id}`}
            className={cn(
              "flex items-center gap-2 p-1 rounded-md hover:bg-muted hover:w-full transition-colors text-left group"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {child.icon ? (
              <span className="text-lg">{child.icon}</span>
            ) : (
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            <span className="text-md truncate group-hover:text-foreground transition-colors">
              {child.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

//   return (
//     <div className="mb-6 p-4 border rounded-lg bg-muted/30">
//       <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
//         Pages in this document
//       </h3>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//         {children.map((child) => {
//           const Icon = hasContent(child.content) ? FileText : FileIcon;
//           return (
//             <button
//               key={child._id}
//               onClick={() => router.push(`/documents/${child._id}`)}
//               className={cn(
//                 "flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-left group"
//               )}
//             >
//               {child.icon ? (
//                 <span className="text-lg">{child.icon}</span>
//               ) : (
//                 <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
//               )}
//               <span className="text-sm truncate group-hover:text-foreground transition-colors">
//                 {child.title}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
