"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTemplate } from "@/hooks/useTemplate";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

interface Template {
  _id: Id<"templates">;
  icon?: string;
  title: string;
  description?: string;
}

export function TemplateModal() {
  const template = useTemplate();
  const router = useRouter();
  const templates = useQuery(
    api.templates.getTemplates,
    template.isOpen ? {} : "skip"
  );
  const createFromTemplate = useMutation(api.templates.createFromTemplate);

  const onSelectTemplate = async (templateId: Id<"templates">) => {
    try {
      const documentId = await createFromTemplate({ templateId });
      toast.success("Document created from template!");
      router.push(`/documents/${documentId}`);
      template.onClose();
    } catch (error) {
      toast.error("Failed to create document from template");
    }
  };

  return (
    <Dialog open={template.isOpen} onOpenChange={template.onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {templates?.map((temp: Template) => (
            <div
              key={temp._id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-accent"
              onClick={() => onSelectTemplate(temp._id)}
            >
              <div className="flex items-center gap-2 mb-2">
                {temp.icon && <span className="text-2xl">{temp.icon}</span>}
                <h3 className="font-semibold">{temp.title}</h3>
              </div>
              {temp.description && (
                <p className="text-sm text-muted-foreground">
                  {temp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
