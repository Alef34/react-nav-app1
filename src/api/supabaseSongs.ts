import { Song, SongVerse, Udaje } from "../types/myTypes";
import { supabase } from "./supabaseClient";

type DbSongRow = {
  cislo_p: string;
  nazov: string;
  source: string | null;
  kategoria: string | null;
  slohy: SongVerse[];
  updated_at?: string;
};

function normalizeVerse(verse: SongVerse, index: number): SongVerse {
  return {
    cisloS: String(verse?.cisloS ?? `V${index + 1}`),
    textik: String(verse?.textik ?? ""),
  };
}

function normalizeSong(song: Song): Song {
  return {
    cisloP: String(song?.cisloP ?? "").trim(),
    nazov: String(song?.nazov ?? "").trim(),
    source: song?.source ? String(song.source) : "",
    kategoria: song?.kategoria ? String(song.kategoria) : "Nabozenske",
    slohy: Array.isArray(song?.slohy)
      ? song.slohy.map((verse, verseIndex) => normalizeVerse(verse, verseIndex)).filter((v) => v.textik.trim().length > 0)
      : [
          {
            cisloS: "V1",
            textik: "",
          },
        ],
  };
}

export async function loadSongsFromSupabase(filter: string): Promise<Song[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("songs")
    .select("cislo_p, nazov, source, kategoria, slohy")
    .order("cislo_p", { ascending: true });

  if (error) {
    throw error;
  }

  const songs = ((data ?? []) as DbSongRow[]).map((row) =>
    normalizeSong(
      {
        cisloP: row.cislo_p,
        nazov: row.nazov,
        source: row.source ?? "",
        kategoria: row.kategoria ?? "Nabozenske",
        slohy: Array.isArray(row.slohy) ? row.slohy : [],
      }
    )
  );

  if (!filter) {
    return songs;
  }

  const lowered = filter.toLowerCase();
  return songs.filter((song) =>
    Object.values(song).some((value) => typeof value === "string" && value.toLowerCase().includes(lowered))
  );
}

export async function upsertSongsToSupabase(payload: Udaje): Promise<number> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const songs = (payload.piesne ?? []).map((song) => normalizeSong(song));
  const rows = songs
    .filter((song) => song.cisloP.length > 0 && song.nazov.length > 0 && song.slohy.length > 0)
    .map((song) => ({
      cislo_p: song.cisloP,
      nazov: song.nazov,
      source: song.source ?? "",
      kategoria: song.kategoria ?? "Nabozenske",
      slohy: song.slohy,
      updated_at: new Date().toISOString(),
    }));

  if (rows.length === 0) {
    throw new Error("Import neobsahuje ziadne validne skladby.");
  }

  const { error } = await supabase.from("songs").upsert(rows, {
    onConflict: "cislo_p,nazov",
  });

  if (error) {
    throw error;
  }

  return rows.length;
}
