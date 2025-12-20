import { create } from "zustand";

type TemplateStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};
export const useTemplate = create<TemplateStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
