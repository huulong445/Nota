"use client";
import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Cover } from "@/components/cover";
import { Toolbar } from "@/components/toolbar";
import { Editor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplatePageProps {
  params: Promise<{
    templateId: Id<"documents">;
  }>;
}

export default function TemplatePage({ params }: TemplatePageProps) {
  const router = useRouter();
  const { templateId } = use(params);

  const template = useQuery(api.documents.getById, {
    documentId: templateId,
  });

  const createFromTemplate = useMutation(api.documents.createFromTemplate);

  const handleCreateFromTemplate = async () => {
    try {
      const documentId = await createFromTemplate({
        templateId: templateId,
      });
      toast.success("Document created from template!");
      router.push(`/documents/${documentId}`);
    } catch (error) {
      toast.error("Failed to create document from template");
    }
  };

  const handleViewPublished = () => {
    if (template?.isPublished) {
      window.open(`/preview/${templateId}`, "_blank");
    }
  };

  if (template === undefined) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Skeleton className="h-12 w-[600px] mb-4" />
          <Skeleton className="h-10 w-[400px] mb-8" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>
      </div>
    );
  }

  if (template === null || !template.isTemplate) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    );
  }

  return (
    <div className="  h-full flex items-center justify-center p-8">
      <div className="flex gap-8 items-start max-w-6xl">
        {/* Left Panel - Template Info & Actions */}
        <div className="w-[400px] flex flex-col space-y-6">
          <div className="space-y-4">
            {template.icon && (
              <div className="flex justify-start">
                <span className="text-6xl">{template.icon}</span>
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{template.title}</h1>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCreateFromTemplate}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>

            {template.isPublished && (
              <Button
                onClick={handleViewPublished}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
          </div>
        </div>

        {/* Right Panel - Preview as Image */}
        <div
          className="w-[784px] h-[490px] bg-background rounded-lg shadow-lg border overflow-hidden relative"
          style={{
            transform: "scale(1)",
            transformOrigin: "top left",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {template.coverImage && (
              <div className="h-32 w-full overflow-hidden">
                <img
                  src={template.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onClick={handleViewPublished}
                />
              </div>
            )}

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                {template.icon && (
                  <span className="text-4xl">{template.icon}</span>
                )}
                <h2 className="text-2xl font-bold line-clamp-1">
                  {template.title}
                </h2>
              </div>

              <div className="text-sm text-muted-foreground line-clamp-6 overflow-hidden">
                <Editor
                  editable={false}
                  onChange={() => {}}
                  initialContent={template.content}
                />
              </div>
            </div>
          </div>

          {/* Overlay gradient to fade content */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
