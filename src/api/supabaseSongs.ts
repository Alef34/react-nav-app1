import { Song, SongVerse, Udaje } from "../types/myTypes";
import { supabase } from "./supabaseClient";
import { getDataMode } from "./dataMode";

const LOCAL_DB_STORAGE_KEY = "songs.localDb.v1";

type DbSongRow = {
  cislo_p: string;
  nazov: string;
  source: string | null;
  kategoria: string | null;
  poradie_sloh: string[] | null;
  slohy: SongVerse[];
  updated_at?: string;
};

type DbSongKeyRow = {
  cislo_p: string;
  nazov: string;
};

type LocalDbSongRow = {
  id: number;
  cislo_p: string;
  nazov: string;
  source: string;
  kategoria: string;
  poradie_sloh: string[];
  slohy: SongVerse[];
  updated_at: string;
};

type LocalDbState = {
  nextId: number;
  songs: LocalDbSongRow[];
};

function getDefaultLocalDbState(): LocalDbState {
  return {
    nextId: 1,
    songs: [],
  };
}

function readLocalDb(): LocalDbState {
  if (typeof window === "undefined") {
    return getDefaultLocalDbState();
  }

  const raw = window.localStorage.getItem(LOCAL_DB_STORAGE_KEY);
  if (!raw) {
    return getDefaultLocalDbState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalDbState>;
    const songs = Array.isArray(parsed.songs)
      ? parsed.songs.map((row) => ({
          id: Number(row?.id ?? 0),
          cislo_p: String(row?.cislo_p ?? ""),
          nazov: String(row?.nazov ?? ""),
          source: String(row?.source ?? ""),
          kategoria: String(row?.kategoria ?? "Nabozenske"),
          poradie_sloh: Array.isArray(row?.poradie_sloh)
            ? row.poradie_sloh.map((item) => String(item ?? "").trim()).filter((item) => item.length > 0)
            : [],
          slohy: Array.isArray(row?.slohy) ? row.slohy : [],
          updated_at: String(row?.updated_at ?? ""),
        }))
      : [];

    const maxId = songs.reduce((acc, row) => Math.max(acc, row.id), 0);
    const nextIdFromState = Number(parsed.nextId ?? maxId + 1);

    return {
      nextId: Number.isFinite(nextIdFromState)
        ? Math.max(1, nextIdFromState)
        : maxId + 1,
      songs,
    };
  } catch {
    return getDefaultLocalDbState();
  }
}

function writeLocalDb(state: LocalDbState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_DB_STORAGE_KEY, JSON.stringify(state));
}

function sortSongsByNumberThenTitle<T extends { cislo_p: string; nazov: string }>(
  songs: T[],
): T[] {
  return [...songs].sort((a, b) => {
    const byNumber = a.cislo_p.localeCompare(b.cislo_p, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (byNumber !== 0) {
      return byNumber;
    }

    return a.nazov.localeCompare(b.nazov, undefined, {
      sensitivity: "base",
    });
  });
}

function mapLocalRowToSong(row: LocalDbSongRow): Song {
  return normalizeSong({
    cisloP: row.cislo_p,
    nazov: row.nazov,
    source: row.source,
    kategoria: row.kategoria,
    poradieSloh: row.poradie_sloh,
    slohy: row.slohy,
  });
}

function shouldUseOfflineDb(): boolean {
  return getDataMode() === "offline" || !supabase;
}

async function loadSongsFromLocalDb(filter: string): Promise<Song[]> {
  const state = readLocalDb();
  const songs = sortSongsByNumberThenTitle(state.songs).map(mapLocalRowToSong);

  if (!filter) {
    return songs;
  }

  const lowered = filter.toLowerCase();
  return songs.filter((song) =>
    Object.values(song).some(
      (value) => typeof value === "string" && value.toLowerCase().includes(lowered),
    ),
  );
}

async function upsertSongsToLocalDb(payload: Udaje): Promise<number> {
  const songs = (payload.piesne ?? []).map((song) => normalizeSong(song));
  const rows = songs.filter(
    (song) =>
      song.cisloP.length > 0 &&
      song.nazov.length > 0 &&
      song.slohy.length > 0,
  );

  if (rows.length === 0) {
    throw new Error("Import neobsahuje ziadne validne skladby.");
  }

  const state = readLocalDb();
  const existingKeys = new Set(
    state.songs.map((row) => `${row.cislo_p}|${row.nazov}`),
  );

  const now = new Date().toISOString();
  let inserted = 0;

  rows.forEach((song) => {
    const key = `${song.cisloP}|${song.nazov}`;
    if (existingKeys.has(key)) {
      return;
    }

    state.songs.push({
      id: state.nextId,
      cislo_p: song.cisloP,
      nazov: song.nazov,
      source: song.source ?? "",
      kategoria: song.kategoria ?? "Nabozenske",
      poradie_sloh: song.poradieSloh ?? [],
      slohy: song.slohy,
      updated_at: now,
    });
    state.nextId += 1;
    inserted += 1;
    existingKeys.add(key);
  });

  writeLocalDb(state);
  return inserted;
}

async function replaceSongsInLocalDb(payload: Udaje): Promise<number> {
  writeLocalDb(getDefaultLocalDbState());
  return upsertSongsToLocalDb(payload);
}

async function loadAllSongsForAdminFromLocalDb(): Promise<SongWithId[]> {
  const state = readLocalDb();
  return sortSongsByNumberThenTitle(state.songs).map((row) => ({
    id: row.id,
    cisloP: row.cislo_p,
    nazov: row.nazov,
    kategoria: row.kategoria,
    source: row.source,
  }));
}

async function deleteSongsFromLocalDb(ids: number[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }

  const state = readLocalDb();
  const before = state.songs.length;
  const wantedIds = new Set(ids);
  state.songs = state.songs.filter((row) => !wantedIds.has(row.id));

  writeLocalDb(state);
  return before - state.songs.length;
}

async function loadSongForEditFromLocalDb(
  id: number,
): Promise<Song & { id: number }> {
  const state = readLocalDb();
  const row = state.songs.find((song) => song.id === id);

  if (!row) {
    throw new Error("Nacitanie skladby zlyhalo: nenajdena");
  }

  return {
    id: row.id,
    cisloP: row.cislo_p,
    nazov: row.nazov,
    kategoria: row.kategoria,
    source: row.source,
    poradieSloh: row.poradie_sloh,
    slohy: Array.isArray(row.slohy) ? row.slohy : [],
  };
}

async function updateSongInLocalDb(id: number, song: Song): Promise<void> {
  const normalized = normalizeSong(song);
  const state = readLocalDb();
  const index = state.songs.findIndex((row) => row.id === id);

  if (index === -1) {
    throw new Error("Ukladanie zlyhalo: skladba neexistuje.");
  }

  state.songs[index] = {
    ...state.songs[index],
    cislo_p: normalized.cisloP,
    nazov: normalized.nazov,
    source: normalized.source ?? "",
    kategoria: normalized.kategoria ?? "Nabozenske",
    poradie_sloh: normalized.poradieSloh ?? [],
    slohy: normalized.slohy,
    updated_at: new Date().toISOString(),
  };

  writeLocalDb(state);
}

async function updateSongOrderInLocalDbByKey(
  cisloP: string,
  nazov: string,
  poradieSloh?: string[],
): Promise<void> {
  const state = readLocalDb();
  const index = state.songs.findIndex(
    (row) => row.cislo_p === cisloP && row.nazov === nazov,
  );

  if (index === -1) {
    throw new Error("Skladba pre ulozenie poradia neexistuje.");
  }

  const normalizedOrder = Array.isArray(poradieSloh)
    ? poradieSloh
        .map((item) => String(item ?? "").trim())
        .filter((item) => item.length > 0)
    : [];

  state.songs[index] = {
    ...state.songs[index],
    poradie_sloh: normalizedOrder,
    updated_at: new Date().toISOString(),
  };

  writeLocalDb(state);
}

function normalizeVerse(verse: SongVerse, index: number): SongVerse {
  return {
    cisloS: String(verse?.cisloS ?? `V${index + 1}`),
    textik: String(verse?.textik ?? ""),
  };
}

function normalizeSong(song: Song): Song {
  const normalizedOrder = Array.isArray(song?.poradieSloh)
    ? song.poradieSloh
        .map((item) => String(item ?? "").trim())
        .filter((item) => item.length > 0)
    : [];

  return {
    cisloP: String(song?.cisloP ?? "").trim(),
    nazov: String(song?.nazov ?? "").trim(),
    source: song?.source ? String(song.source) : "",
    kategoria: song?.kategoria ? String(song.kategoria) : "Nabozenske",
    poradieSloh: normalizedOrder.length > 0 ? normalizedOrder : undefined,
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

async function loadSongsFromSupabaseDirect(filter: string): Promise<Song[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("songs")
    .select("cislo_p, nazov, source, kategoria, poradie_sloh, slohy")
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
      poradieSloh: Array.isArray(row.poradie_sloh) ? row.poradie_sloh : [],
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

export async function loadSongsFromSupabase(filter: string): Promise<Song[]> {
  if (shouldUseOfflineDb()) {
    return loadSongsFromLocalDb(filter);
  }

  return loadSongsFromSupabaseDirect(filter);
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

async function upsertSongsToSupabaseDirect(payload: Udaje): Promise<number> {
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
      poradie_sloh: song.poradieSloh ?? null,
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

export async function upsertSongsToSupabase(payload: Udaje): Promise<number> {
  if (shouldUseOfflineDb()) {
    return upsertSongsToLocalDb(payload);
  }

  return upsertSongsToSupabaseDirect(payload);
}

async function replaceSongsInSupabaseDirect(payload: Udaje): Promise<number> {
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

  return upsertSongsToSupabaseDirect(payload);
}

export async function replaceSongsInSupabase(payload: Udaje): Promise<number> {
  if (shouldUseOfflineDb()) {
    return replaceSongsInLocalDb(payload);
  }

  return replaceSongsInSupabaseDirect(payload);
}

export type SongWithId = {
  id: number;
  cisloP: string;
  nazov: string;
  kategoria: string;
  source: string;
};

export async function syncSupabaseToLocal(replaceAll: boolean): Promise<number> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const songs = await loadSongsFromSupabaseDirect("");
  const payload: Udaje = {
    verzia: new Date().toISOString(),
    piesne: songs,
  };

  return replaceAll
    ? replaceSongsInLocalDb(payload)
    : upsertSongsToLocalDb(payload);
}

export async function syncLocalToSupabase(replaceAll: boolean): Promise<number> {
  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const songs = await loadSongsFromLocalDb("");
  const payload: Udaje = {
    verzia: new Date().toISOString(),
    piesne: songs,
  };

  return replaceAll
    ? replaceSongsInSupabaseDirect(payload)
    : upsertSongsToSupabaseDirect(payload);
}

export async function loadAllSongsForAdmin(): Promise<SongWithId[]> {
  if (shouldUseOfflineDb()) {
    return loadAllSongsForAdminFromLocalDb();
  }

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
  if (shouldUseOfflineDb()) {
    return deleteSongsFromLocalDb(ids);
  }

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
  if (shouldUseOfflineDb()) {
    return loadSongForEditFromLocalDb(id);
  }

  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const { data, error } = await supabase
    .from("songs")
    .select("id, cislo_p, nazov, kategoria, source, poradie_sloh, slohy")
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
    poradieSloh: Array.isArray(data.poradie_sloh)
      ? (data.poradie_sloh as string[])
      : [],
    slohy: Array.isArray(data.slohy) ? (data.slohy as SongVerse[]) : [],
  };
}

export async function updateSongInSupabase(
  id: number,
  song: Song,
): Promise<void> {
  if (shouldUseOfflineDb()) {
    return updateSongInLocalDb(id, song);
  }

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
      poradie_sloh:
        Array.isArray(song.poradieSloh) && song.poradieSloh.length > 0
          ? song.poradieSloh
          : null,
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

export async function updateSongOrderByKey(
  cisloP: string,
  nazov: string,
  poradieSloh?: string[],
): Promise<void> {
  const normalizedOrder = Array.isArray(poradieSloh)
    ? poradieSloh
        .map((item) => String(item ?? "").trim())
        .filter((item) => item.length > 0)
    : [];

  if (shouldUseOfflineDb()) {
    return updateSongOrderInLocalDbByKey(cisloP, nazov, normalizedOrder);
  }

  if (!supabase) {
    throw new Error("Supabase nie je nakonfigurovany.");
  }

  const { error } = await supabase
    .from("songs")
    .update({
      poradie_sloh: normalizedOrder.length > 0 ? normalizedOrder : null,
      updated_at: new Date().toISOString(),
    })
    .eq("cislo_p", cisloP)
    .eq("nazov", nazov);

  if (error) {
    const parts = [error.message, error.details, error.hint, error.code]
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .map(String);

    throw new Error(
      parts.length > 0
        ? `Ukladanie poradia zlyhalo: ${parts.join(" | ")}`
        : "Ukladanie poradia zlyhalo.",
    );
  }
}
