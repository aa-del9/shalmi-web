import { create } from 'zustand';

/**
 * The auth-modal type was retired in Batch 7 (sign-in is a full page at
 * `/auth` per buyer-signin gap-analysis Q16(a)). The store is kept so that
 * future modal-driven UI can plug in without rewiring the layout chrome.
 */
export type ModalType = null;

interface ModalState {
  type: ModalType;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  closeModal: () => set({ type: null }),
}));
