"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function SiteSettingsModal() {
  const siteSettings = useSiteSettings();
  const document = useQuery(
    api.documents.getById,
    siteSettings.documentId ? { documentId: siteSettings.documentId } : "skip"
  );
  const toggleTemplate = useMutation(api.documents.toggleTemplate);

  const handleToggleTemplate = async (checked: boolean) => {
    if (!siteSettings.documentId) return;

    try {
      await toggleTemplate({
        id: siteSettings.documentId,
        isTemplate: checked,
      });
      toast.success(
        checked
          ? "Document is now available as a template"
          : "Document removed from templates"
      );
    } catch (_error) {
      toast.error("Failed to update template status");
    }
  };

  return (
    <Dialog open={siteSettings.isOpen} onOpenChange={siteSettings.onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Site Settings</DialogTitle>
          <DialogDescription>
            Manage your published document settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">Allow Duplicate as Template</h3>
              <p className="text-sm text-muted-foreground">
                Allow others to use this document as a template
              </p>
            </div>
            <Switch
              checked={document?.isTemplate ?? false}
              onCheckedChange={handleToggleTemplate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
