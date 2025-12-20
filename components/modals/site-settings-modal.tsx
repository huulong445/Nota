"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTemplate } from "@/hooks/useTemplate";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export function SiteSettingsModal() {
  const siteSettings = useSiteSettings();
  const template = useTemplate();

  const onAllowDuplicate = () => {
    siteSettings.onClose();
    template.onOpen();
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
            <Button onClick={onAllowDuplicate} size="sm" variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
