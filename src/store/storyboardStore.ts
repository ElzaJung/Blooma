import { create } from "zustand";

type StoryCard = {
  id: string;
  text: string;
  imageUrl: string | null;
};

type Store = {
  cards: StoryCard[];
  addCard: () => void;
  removeCard: (id: string) => void;
};

export const useStoryboardStore = create<Store>((set) => ({
  cards: [],
  addCard: () => set((state) => ({
    cards: [...state.cards, { id: crypto.randomUUID(), text: "Text", imageUrl: null }]
  })),
  removeCard: (id: string) => set((state) => ({
    cards: state.cards.filter((card) => card.id !== id)
  })),
}));
