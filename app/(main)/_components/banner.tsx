"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useOrigin } from "@/hooks/useOrigin";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ExternalLink, Settings } from "lucide-react";

interface BannerProps {
  documentId: Id<"documents">;
  isArchived?: boolean;
  isPublished?: boolean;
}

export const Banner = ({
  documentId,
  isArchived,
  isPublished,
}: BannerProps) => {
  const router = useRouter();
  const origin = useOrigin();
  const siteSettings = useSiteSettings();

  const remove = useMutation(api.documents.remove);
  const restore = useMutation(api.documents.restore);

  const onRemove = () => {
    const promise = remove({ id: documentId });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted",
      error: "Failed to delete note",
    });
    router.push("/documents");
  };

  const onRestore = () => {
    const promise = restore({ id: documentId });

    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored",
      error: "Failed to restore note",
    });
  };

  const onViewSite = () => {
    window.open(`${origin}/preview/${documentId}`, "_blank");
  };

  const onSiteSettings = () => {
    siteSettings.onOpen(documentId);
  };

  // Published banner (green)
  if (isPublished && !isArchived) {
    const publishUrl = `${origin}/preview/${documentId}`;
    return (
      <div className="w-full bg-emerald-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
        <p>
          This document is live on{" "}
          <span className="font-semibold underline">{publishUrl}</span>
        </p>
        <Button
          size="sm"
          onClick={onViewSite}
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View site
        </Button>
        <Button
          size="sm"
          onClick={onSiteSettings}
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          <Settings className="h-3 w-3 mr-1" />
          Site settings
        </Button>
      </div>
    );
  }

  // Archived banner (red) - default
  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This page is in the trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore page
      </Button>

      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
};
