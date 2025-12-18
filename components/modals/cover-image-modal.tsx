"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/useCoverImage";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { SingleImageDropzoneUsage } from "@/components/single-image-dropzone";
import { useState } from "react";
export function CoverImageModal() {
  const coverImage = useCoverImage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useParams();
  const update = useMutation(api.documents.update);

  const onClose = () => {
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const onChange = async (url: string) => {
    setIsSubmitting(true);
    try {
      await update({
        id: params.documentId as Id<"documents">,
        coverImage: url,
      });
      toast.success("Cover image uploaded!");
      onClose();
    } catch (error) {
      toast.error("Failed to update cover");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Cover Image
          </DialogTitle>
        </DialogHeader>
        <SingleImageDropzoneUsage
          className="w-full outline-none"
          disabled={isSubmitting}
          onChange={onChange}
          replaceTargetUrl={coverImage.url}
        />
      </DialogContent>
    </Dialog>
  );
}
