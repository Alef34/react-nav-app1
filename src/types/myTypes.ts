export type User = {
  id: number;
  name: string;
};

export interface SongVerse {
  cisloS: string;
  textik: string;
}

export interface Song {
  id?: number;
  cisloP: string;
  nazov: string;
  kategoria?: string;
  source?: string;
  poradieSloh?: string[];
  verseFontMultipliers?: Record<string, number>;
  slohy: SongVerse[];
}

export interface Udaje {
  verzia: string;
  piesne: Song[];
}
export type SongsData = Song[];
