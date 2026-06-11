import { create } from 'zustand';

interface DeepLinkState {
  pendingActionId: string | null;
  fromDeepLink: boolean;
  inviterName: string | null;
  setPending: (actionId: string, inviterName: string) => void;
  clear: () => void;
}

export const useDeepLinkStore = create<DeepLinkState>((set) => ({
  pendingActionId: null,
  fromDeepLink: false,
  inviterName: null,
  setPending: (actionId, inviterName) =>
    set({ pendingActionId: actionId, fromDeepLink: true, inviterName }),
  clear: () => set({ pendingActionId: null, fromDeepLink: false, inviterName: null }),
}));
