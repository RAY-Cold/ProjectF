import { create } from 'zustand';
import { Portfolio } from '@/lib/types/user';

interface UserStore {
  portfolio: Portfolio | null;
  setPortfolio: (portfolio: Portfolio) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  portfolio: null,
  setPortfolio: (portfolio: Portfolio) => set({ portfolio }),
  isLoading: false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

