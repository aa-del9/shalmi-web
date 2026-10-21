'use client';

import { create } from 'zustand';

interface AccountDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (next: boolean) => void;
}

export const useAccountDrawerStore = create<AccountDrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (next) => set({ isOpen: next }),
}));
