
import { create } from 'zustand';

type VersionStore= {
    verziaDb: string;
    setVerziaDb: (filters: string) => void;
  };
  
  export const useVersionStore = create<VersionStore>((set) => ({
    verziaDb: "",
    setVerziaDb: (verziaDb) => set({ verziaDb }),
  }));