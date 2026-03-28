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

type DbSongKeyRow = {
  cislo_p: string;
  nazov: string;
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
      ? song.slohy
          .map((verse, verseIndex) => normalizeVerse(verse, verseIndex))
          .filter((v) => v.textik.trim().length > 0)
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
    normalizeSong({
      cisloP: row.cislo_p,
      nazov: row.nazov,
      source: row.source ?? "",
      kategoria: row.kategoria ?? "Nabozenske",
      slohy: Array.isArray(row.slohy) ? row.slohy : [],
    }),
  );

  if (!filter) {
    return songs;
  }

  const lowered = filter.toLowerCase();
  return songs.filter((song) =>
    Object.values(song).some(
      (value) =>
        typeof value === "string" && value.toLowerCase().includes(lowered),
    ),
  );
}

export async function testSupabaseConnection() {
  if (!supabase) {
    console.error("Supabase is not configured.");
    return false;
  }

  const { data, error } = await supabase.from("songs").select("*").limit(1);
  if (error) {
    console.error("Supabase connection error:", error);
    return false;
  }
  console.log("Supabase connection OK:", data);
  return true;
}

export async function upsertSongsToSupabase(payload: Udaje): Promise<number> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  //console.log("Upserting songs with payload:", payload);
  const songs = (payload.piesne ?? []).map((song) => normalizeSong(song));
  //console.log("Normalized songs:", songs);
  const rows = songs
    .filter(
      (song) =>
        song.cisloP.length > 0 &&
        song.nazov.length > 0 &&
        song.slohy.length > 0,
    )
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
  console.log("Prepared rows for import:", rows);
  testSupabaseConnection();

  const { data: existingRows, error: selectError } = await supabase
    .from("songs")
    .select("cislo_p, nazov");

  if (selectError) {
    const parts = [
      selectError.message,
      selectError.details,
      selectError.hint,
      selectError.code,
    ]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => String(value));

    throw new Error(
      parts.length > 0
        ? `Nacitavanie existujucich skladieb zlyhalo: ${parts.join(" | ")}`
        : "Nacitavanie existujucich skladieb zlyhalo.",
    );
  }

  const existingKeys = new Set(
    ((existingRows ?? []) as DbSongKeyRow[]).map(
      (row) => `${row.cislo_p}|${row.nazov}`,
    ),
  );

  const rowsToInsert = rows.filter(
    (row) => !existingKeys.has(`${row.cislo_p}|${row.nazov}`),
  );

  if (rowsToInsert.length === 0) {
    return 0;
  }

  const { error } = await supabase.from("songs").insert(rowsToInsert);
  console.log("Insert result - error:", error);
  if (error) {
    const parts = [error.message, error.details, error.hint, error.code]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => String(value));

    throw new Error(
      parts.length > 0
        ? `Import do Supabase zlyhal: ${parts.join(" | ")}`
        : "Import do Supabase zlyhal.",
    );
  }

  return rowsToInsert.length;
}

export async function replaceSongsInSupabase(payload: Udaje): Promise<number> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const { error } = await supabase.from("songs").delete().neq("id", 0);
  if (error) {
    const parts = [error.message, error.details, error.hint, error.code]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => String(value));

    throw new Error(
      parts.length > 0
        ? `Mazanie povodnych skladieb zlyhalo: ${parts.join(" | ")}`
        : "Mazanie povodnych skladieb zlyhalo.",
    );
  }

  return upsertSongsToSupabase(payload);
}

export type SongWithId = {
  id: number;
  cisloP: string;
  nazov: string;
  kategoria: string;
  source: string;
};

export async function loadAllSongsForAdmin(): Promise<SongWithId[]> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const { data, error } = await supabase
    .from("songs")
    .select("id, cislo_p, nazov, kategoria, source")
    .order("cislo_p", { ascending: true });

  if (error) {
    throw new Error(`Nacitanie skladieb zlyhalo: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id as number,
    cisloP: (row.cislo_p as string) ?? "",
    nazov: (row.nazov as string) ?? "",
    kategoria: (row.kategoria as string | null) ?? "",
    source: (row.source as string | null) ?? "",
  }));
}

export async function deleteSongsFromSupabase(ids: number[]): Promise<number> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  if (ids.length === 0) {
    return 0;
  }

  const { error } = await supabase.from("songs").delete().in("id", ids);

  if (error) {
    const parts = [error.message, error.details, error.hint, error.code]
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .map(String);

    throw new Error(
      parts.length > 0
        ? `Mazanie zlyhalo: ${parts.join(" | ")}`
        : "Mazanie zlyhalo.",
    );
  }

  return ids.length;
}

export async function loadSongForEdit(
  id: number,
): Promise<Song & { id: number }> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const { data, error } = await supabase
    .from("songs")
    .select("id, cislo_p, nazov, kategoria, source, slohy")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error(
      `Nacitanie skladby zlyhalo: ${error?.message ?? "nenajdena"}`,
    );
  }

  return {
    id: data.id as number,
    cisloP: (data.cislo_p as string) ?? "",
    nazov: (data.nazov as string) ?? "",
    kategoria: (data.kategoria as string | null) ?? "",
    source: (data.source as string | null) ?? "",
    slohy: Array.isArray(data.slohy) ? (data.slohy as SongVerse[]) : [],
  };
}

export async function updateSongInSupabase(
  id: number,
  song: Song,
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const { error } = await supabase
    .from("songs")
    .update({
      cislo_p: song.cisloP,
      nazov: song.nazov,
      source: song.source ?? "",
      kategoria: song.kategoria ?? "Nabozenske",
      slohy: song.slohy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    const parts = [error.message, error.details, error.hint, error.code]
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .map(String);

    throw new Error(
      parts.length > 0
        ? `Ukladanie zlyhalo: ${parts.join(" | ")}`
        : "Ukladanie zlyhalo.",
    );
  }
}
