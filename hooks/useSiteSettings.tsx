import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

type SiteSettingsStore = {
  isOpen: boolean;
  documentId?: Id<"documents">;
  onOpen: (documentId: Id<"documents">) => void;
  onClose: () => void;
};

export const useSiteSettings = create<SiteSettingsStore>((set) => ({
  isOpen: false,
  documentId: undefined,
  onOpen: (documentId: Id<"documents">) => set({ isOpen: true, documentId }),
  onClose: () => set({ isOpen: false, documentId: undefined }),
}));
