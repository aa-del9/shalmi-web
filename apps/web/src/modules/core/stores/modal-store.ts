import { create } from 'zustand';

export type ModalType = 'auth' | null;

interface ModalState {
  type: ModalType;
  redirectUrl: string | null;
  openAuthModal: (redirectUrl?: string | null) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  redirectUrl: null,
  openAuthModal: (redirectUrl = null) =>
    set({ type: 'auth', redirectUrl: redirectUrl ?? null }),
  closeModal: () => set({ type: null, redirectUrl: null }),
}));
