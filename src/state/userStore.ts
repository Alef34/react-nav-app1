
import { create } from 'zustand';

type UserStore = {
  mojFilter: string;
  setFilter: (filters: string) => void;
};



export const useUserStore = create<UserStore>((set) => ({
  mojFilter: "",
  setFilter: (mojFilter) => set({ mojFilter }),
}));


