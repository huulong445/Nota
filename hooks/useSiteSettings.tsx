import { create } from "zustand";

type SiteSettingsStore = {
  isOpen: boolean;
  documentId?: string;
  onOpen: (documentId: string) => void;
  onClose: () => void;
};

export const useSiteSettings = create<SiteSettingsStore>((set) => ({
  isOpen: false,
  documentId: undefined,
  onOpen: (documentId: string) => set({ isOpen: true, documentId }),
  onClose: () => set({ isOpen: false, documentId: undefined }),
}));
