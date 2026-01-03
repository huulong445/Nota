import { create } from "zustand";

type SearchStore = {
  isOpen: boolean;
  searchHighlight: string | null;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
  setSearchHighlight: (query: string | null) => void;
  clearSearchHighlight: () => void;
};

export const useSearch = create<SearchStore>((set, get) => ({
  isOpen: false,
  searchHighlight: null,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
  setSearchHighlight: (query) => set({ searchHighlight: query }),
  clearSearchHighlight: () => set({ searchHighlight: null }),
}));
