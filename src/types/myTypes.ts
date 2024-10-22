export type User = {
    id: number;
    name: string;
  };

  export interface SongVerse {
    cisloS: string;
    textik: string;
  }
  
  export interface Song {
    cisloP: string;
    nazov: string;
    slohy: SongVerse[];
  }

  export interface Udaje{
    verzia:string;
    piesne:Song[];
  }
  export type SongsData = Song[];

  