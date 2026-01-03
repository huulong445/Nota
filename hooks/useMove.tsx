import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

type MoveStore = {
  isOpen: boolean;
  documentId: Id<"documents"> | null;
  documentTitle: string;
  onOpen: (documentId: Id<"documents">, documentTitle: string) => void;
  onClose: () => void;
};

export const useMove = create<MoveStore>((set) => ({
  isOpen: false,
  documentId: null,
  documentTitle: "",
  onOpen: (documentId, documentTitle) =>
    set({ isOpen: true, documentId, documentTitle }),
  onClose: () => set({ isOpen: false, documentId: null, documentTitle: "" }),
}));
