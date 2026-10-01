import { useContext, useEffect, useMemo, useRef, useState } from "react";
//import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GiSettingsKnobs } from "react-icons/gi";
import { RxDragHandleDots2 } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router-dom";
//import { localData } from "../localData";

import FullscreenButton from "../components/FullscreenButton";

import { Song, SongsData } from "../types/myTypes";
import SongView from "../components/Song";
import { getSongs } from "../api/dataSources";
import { DataMode, getDataMode } from "../api/dataMode";
import {
  SettingsContext,
  SettingsContextType,
} from "../context/SettingsContext";
import {
  getProjectorClientId,
  getProjectorChannelConnectionState,
  getWsPayloadSyncDisabled,
  sendProjectorPayload,
  startProjectorChannel,
  subscribeProjectorConnectionState,
  subscribeProjectorPayload,
} from "../realtime/projectorChannel";
import { useVersionStore } from "../state/versionStore";
import {
  createSongInSupabase,
  updateSongInSupabase,
  updateSongOrderById,
  updateSongVerseFontMultiplierById,
} from "../api/supabaseSongs";
import { buildApiUrl } from "../api/apiBase";

const ALL_CATEGORIES = "Vsetky";
const SEARCH_QUERY_STORAGE_KEY = "home.searchQuery";
const SELECTED_CATEGORY_STORAGE_KEY = "home.selectedCategory";
const SELECTED_PLAYLIST_FILTER_STORAGE_KEY = "home.selectedPlaylistFilter";
const LITURGY_DATE_STORAGE_KEY = "home.liturgyDate";
const PLAYLISTS_STORAGE_KEY = "home.playlists.v1";
const SPLIT_BREAKPOINT = 820;
const SPLIT_MIN_HEIGHT = 600;
const COMPACT_SPLIT_BREAKPOINT = 1180;
const SPLIT_LEFT_WIDTH_STORAGE_KEY = "home.splitLeftWidthPercent";
const DEFAULT_SPLIT_LEFT_WIDTH_PERCENT = 34;
const MIN_SPLIT_LEFT_WIDTH_PERCENT = 10;
const MAX_SPLIT_LEFT_WIDTH_PERCENT = 90;
const MIN_VERSE_FONT_MULTIPLIER = 0.5;
const MAX_VERSE_FONT_MULTIPLIER = 2;
const VERSE_FONT_STEP = 0.05;
const ALL_PLAYLISTS_FILTER = "Vsetky playlisty";
const PLAYLIST_KEYS = ["Playlist 1"] as const;

type PlaylistKey = (typeof PLAYLIST_KEYS)[number];
type PlaylistsState = Record<PlaylistKey, string[]>;
const SINGLE_PLAYLIST_KEY: PlaylistKey = "Playlist 1";

type DailyLiturgyReading = {
  kind?: string;
  title?: string;
  citation?: string;
  text?: string;
};

type DailyLiturgyPayload = {
  error?: string;
  sourceUrl?: string;
  title?: string;
  citation?: string;
  readings?: DailyLiturgyReading[];
  refrain?: string;
};

function createEmptyPlaylists(): PlaylistsState {
  return {
    "Playlist 1": [],
  };
}

function getProjectorUnavailableMessage(): string {
  if (getWsPayloadSyncDisabled()) {
    return "WS sync je vypnuty (disableWsPayload).";
  }

  return "Projektor server nie je dostupny.";
}

function normalizePlaylistValue(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return Array.from(
    new Set(
      raw
        .map((item) => String(item ?? "").trim())
        .filter((item) => item.length > 0),
    ),
  );
}

function normalizePlaylistsFromPayload(raw: unknown): PlaylistsState | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const parsed = raw as Partial<Record<PlaylistKey, unknown>>;
  return {
    "Playlist 1": normalizePlaylistValue(parsed?.["Playlist 1"]),
  };
}

function arePlaylistsEqual(a: PlaylistsState, b: PlaylistsState): boolean {
  return PLAYLIST_KEYS.every((key) => {
    const left = a[key] ?? [];
    const right = b[key] ?? [];

    if (left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => item === right[index]);
  });
}

function loadPlaylistsFromStorage(): PlaylistsState {
  if (typeof window === "undefined") {
    return createEmptyPlaylists();
  }

  const raw = window.localStorage.getItem(PLAYLISTS_STORAGE_KEY);
  if (!raw) {
    return createEmptyPlaylists();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Record<PlaylistKey, unknown>>;
    return {
      "Playlist 1": normalizePlaylistValue(parsed?.["Playlist 1"]),
    };
  } catch {
    return createEmptyPlaylists();
  }
}

async function loadPlaylistsFromLocalApi(): Promise<PlaylistsState> {
  const response = await fetch(buildApiUrl("/playlists"));
  if (!response.ok) {
    throw new Error(`Lokalne playlist API chyba ${response.status}`);
  }

  const raw = (await response.json()) as Partial<Record<PlaylistKey, unknown>>;
  return {
    "Playlist 1": normalizePlaylistValue(raw?.["Playlist 1"]),
  };
}

async function savePlaylistsToLocalApi(
  playlists: PlaylistsState,
): Promise<void> {
  const response = await fetch(buildApiUrl("/playlists"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(playlists),
  });

  if (!response.ok) {
    throw new Error(`Lokalne playlist API chyba ${response.status}`);
  }
}

function shouldUseSplitView(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.innerWidth >= SPLIT_BREAKPOINT &&
    window.innerHeight >= SPLIT_MIN_HEIGHT
  );
}

function clampSplitWidth(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SPLIT_LEFT_WIDTH_PERCENT;
  }

  return Math.max(
    MIN_SPLIT_LEFT_WIDTH_PERCENT,
    Math.min(MAX_SPLIT_LEFT_WIDTH_PERCENT, Math.round(value)),
  );
}

function normalizeCategory(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function isPsalmCategory(value: string): boolean {
  return (
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase() === "zalm"
  );
}

function getSongCategory(song: Song): string {
  if (song.kategoria && song.kategoria.trim().length > 0) {
    return song.kategoria.trim();
  }

  if (song.source && /emanuel/i.test(song.source)) {
    return "Emanuel";
  }

  return "Nabozenske";
}

function getTodayDateInputValue(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function splitTextByWordLimit(text: string, maxWords: number): string[] {
  const normalized = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return [];
  }

  const safeLimit = Math.max(20, Math.min(300, Math.round(maxWords || 80)));
  const hardSplit = (input: string): string[] => {
    const words = input.split(" ");
    if (words.length <= safeLimit) {
      return [input];
    }

    const items: string[] = [];
    for (let index = 0; index < words.length; index += safeLimit) {
      items.push(words.slice(index, index + safeLimit).join(" "));
    }

    return items;
  };

  const sentenceCandidates =
    normalized.match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map((part) => part.trim()) ??
    [];
  const sentences = sentenceCandidates.filter((part) => part.length > 0);

  if (sentences.length === 0) {
    return hardSplit(normalized);
  }

  const chunks: string[] = [];
  let current = "";

  const flushCurrent = () => {
    const compact = current.trim();
    if (compact.length > 0) {
      chunks.push(compact);
    }
    current = "";
  };

  sentences.forEach((sentence) => {
    const sentenceWordCount = sentence.split(" ").length;

    if (sentenceWordCount > safeLimit) {
      flushCurrent();
      chunks.push(...hardSplit(sentence));
      return;
    }

    if (!current) {
      current = sentence;
      return;
    }

    const combined = `${current} ${sentence}`;
    if (combined.split(" ").length <= safeLimit) {
      current = combined;
      return;
    }

    flushCurrent();
    current = sentence;
  });

  flushCurrent();

  if (chunks.length === 0) {
    return hardSplit(normalized);
  }

  return chunks;
}

function buildLiturgyVerses(
  payload: DailyLiturgyPayload,
  maxWordsPerVerse: number,
): Song["slohy"] {
  const readings = Array.isArray(payload.readings) ? payload.readings : [];
  const normalized = readings
    .map((reading) => String(reading?.text ?? "").trim())
    .filter((text) => text.length > 0)
    .flatMap((text) => splitTextByWordLimit(text, maxWordsPerVerse));

  if (normalized.length > 0) {
    return normalized.map((text, index) => ({
      cisloS: `V${index + 1}`,
      textik: text,
    }));
  }

  const fallback = String(payload.refrain ?? "").trim();
  return fallback.length > 0 ? [{ cisloS: "R", textik: fallback }] : [];
}

async function fetchTodayLiturgy(date: string): Promise<DailyLiturgyPayload> {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : getTodayDateInputValue();
  const query = new URLSearchParams({ den: safeDate });
  const response = await fetch(
    `${buildApiUrl("/liturgy/zalm-today")}?${query.toString()}`,
  );
  const payload = (await response.json()) as DailyLiturgyPayload;

  if (!response.ok) {
    const message =
      typeof payload.error === "string" && payload.error.trim().length > 0
        ? payload.error
        : `Nacitanie liturgie zlyhalo (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return payload;
}

function getCategoryBadge(song: Song): string {
  const category = getSongCategory(song);
  const compact = category.replace(/\s+/g, "").slice(0, 3).toLocaleUpperCase();
  return compact.length > 0 ? compact : "?";
}

function normalizeSongNumber(value: string | undefined | null): string {
  return (value ?? "").trim().replace(/\.$/, "").toLocaleLowerCase();
}

function getSongId(song: Song | null | undefined): number | undefined {
  if (!song) {
    return undefined;
  }

  const parsed = Number(song.id);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.trunc(parsed);
}

function getLegacySongIdentity(song: Song): string {
  return `legacy:${song.cisloP}|${song.nazov}|${song.kategoria ?? ""}|${
    song.source ?? ""
  }`;
}

function getSongIdentityAliases(song: Song): string[] {
  const id = getSongId(song);
  const legacy = getLegacySongIdentity(song);

  if (id !== undefined) {
    return [`id:${id}`, legacy];
  }

  return [legacy];
}

function getSongCoreIdentity(song: Song): string {
  return `${normalizeSongNumber(song.cisloP)}|${song.nazov
    .trim()
    .toLocaleLowerCase()}`;
}

function getSongCoreIdentityFromLegacy(
  playlistIdentity: string,
): string | null {
  if (!playlistIdentity.startsWith("legacy:")) {
    return null;
  }

  const body = playlistIdentity.slice("legacy:".length);
  const parts = body.split("|");
  if (parts.length < 2) {
    return null;
  }

  const number = normalizeSongNumber(parts[0] ?? "");
  const title = String(parts[1] ?? "")
    .trim()
    .toLocaleLowerCase();

  if (number.length === 0 || title.length === 0) {
    return null;
  }

  return `${number}|${title}`;
}

function songMatchesPlaylistIdentity(
  song: Song,
  playlistIdentity: string,
): boolean {
  const aliases = getSongIdentityAliases(song);
  if (aliases.includes(playlistIdentity)) {
    return true;
  }

  const numericId = Number(playlistIdentity);
  if (Number.isFinite(numericId) && numericId > 0) {
    return getSongId(song) === Math.trunc(numericId);
  }

  const legacyCore = getSongCoreIdentityFromLegacy(playlistIdentity);
  if (!legacyCore) {
    return false;
  }

  return getSongCoreIdentity(song) === legacyCore;
}

function resolveSongsForPlaylist(
  songs: Song[],
  playlistEntries: string[],
): Song[] {
  if (playlistEntries.length === 0 || songs.length === 0) {
    return [];
  }

  const matched = songs
    .map((song) => ({
      song,
      position: playlistEntries.findIndex((entry) =>
        songMatchesPlaylistIdentity(song, entry),
      ),
    }))
    .filter((item) => item.position >= 0)
    .sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position;
      }

      return compareSongsByNumberAndTitle(left.song, right.song);
    });

  return matched.map((item) => item.song);
}

function getSongIdentity(song: Song): string {
  const id = getSongId(song);
  if (id !== undefined) {
    return `id:${id}`;
  }

  return getLegacySongIdentity(song);
}

function getVerseFontMultiplierSignature(
  song: Song | null | undefined,
): string {
  if (!song?.verseFontMultipliers) {
    return "";
  }

  return Object.entries(song.verseFontMultipliers)
    .map(([key, value]) => {
      const safeKey = String(key ?? "")
        .trim()
        .toLocaleLowerCase();
      const numeric = Number(value);

      if (!safeKey || !Number.isFinite(numeric)) {
        return "";
      }

      return `${safeKey}:${Number(
        Math.min(2, Math.max(0.5, numeric)).toFixed(2),
      )}`;
    })
    .filter((entry) => entry.length > 0)
    .sort()
    .join("|");
}

function buildProjectorSongPayload(song: Song): {
  songId?: number;
  song?: Song;
  verseFontMultipliers?: Record<string, number>;
} {
  const songId = getSongId(song);
  const verseFontMultipliers =
    song.verseFontMultipliers &&
    Object.keys(song.verseFontMultipliers).length > 0
      ? song.verseFontMultipliers
      : undefined;

  if (songId !== undefined) {
    return {
      songId,
      verseFontMultipliers,
    };
  }

  return {
    song,
    verseFontMultipliers,
  };
}

function applyVerseFontMultipliersFromPayload(
  song: Song,
  multipliers: Record<string, number> | undefined,
): Song {
  if (!multipliers || Object.keys(multipliers).length === 0) {
    return song;
  }

  return {
    ...song,
    verseFontMultipliers: {
      ...(song.verseFontMultipliers ?? {}),
      ...multipliers,
    },
  };
}

function isSameSong(left: Song, right: Song): boolean {
  return getSongIdentity(left) === getSongIdentity(right);
}

function parseCommaSeparatedQuery(query: string): string[] {
  return query
    .split(",")
    .map((part) => normalizeSongNumber(part))
    .filter((part) => part.length > 0);
}

function compareSongsByNumberAndTitle(left: Song, right: Song): number {
  const byNumber = left.cisloP.localeCompare(right.cisloP, undefined, {
    numeric: true,
    sensitivity: "base",
  });

  if (byNumber !== 0) {
    return byNumber;
  }

  return left.nazov.localeCompare(right.nazov, undefined, {
    sensitivity: "base",
  });
}

function getSongFilterRank(song: Song, query: string): number {
  const normalizedSongNumber = normalizeSongNumber(song.cisloP);
  const normalizedTitle = song.nazov.toLocaleLowerCase();

  if (normalizedSongNumber === query || normalizedTitle === query) {
    return 0;
  }

  if (normalizedSongNumber.startsWith(query)) {
    return 1;
  }

  if (normalizedTitle.startsWith(query)) {
    return 2;
  }

  if (normalizedTitle.split(/\s+/).some((word) => word.startsWith(query))) {
    return 3;
  }

  if (normalizedSongNumber.includes(query)) {
    return 4;
  }

  if (normalizedTitle.includes(query)) {
    return 5;
  }

  return 6;
}

function sortSongsByFilter(items: SongsData, query: string): SongsData {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (normalizedQuery.length === 0) {
    return [...items].sort(compareSongsByNumberAndTitle);
  }

  const commaSeparatedTerms = parseCommaSeparatedQuery(normalizedQuery);
  const shouldUseCommaFilter =
    normalizedQuery.includes(",") && commaSeparatedTerms.length > 0;

  if (shouldUseCommaFilter) {
    return [...items].sort((left, right) => {
      const leftNumber = normalizeSongNumber(left.cisloP);
      const rightNumber = normalizeSongNumber(right.cisloP);
      const leftTitle = left.nazov.toLocaleLowerCase();
      const rightTitle = right.nazov.toLocaleLowerCase();
      const leftTermIndex = commaSeparatedTerms.findIndex(
        (term) => leftNumber === term || leftTitle.includes(term),
      );
      const rightTermIndex = commaSeparatedTerms.findIndex(
        (term) => rightNumber === term || rightTitle.includes(term),
      );

      if (leftTermIndex !== rightTermIndex) {
        return leftTermIndex - rightTermIndex;
      }

      const leftExactNumberMatch = Number(
        leftNumber === commaSeparatedTerms[leftTermIndex],
      );
      const rightExactNumberMatch = Number(
        rightNumber === commaSeparatedTerms[rightTermIndex],
      );

      if (leftExactNumberMatch !== rightExactNumberMatch) {
        return rightExactNumberMatch - leftExactNumberMatch;
      }

      return compareSongsByNumberAndTitle(left, right);
    });
  }

  return [...items].sort((left, right) => {
    const rankDiff =
      getSongFilterRank(left, normalizedQuery) -
      getSongFilterRank(right, normalizedQuery);

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return compareSongsByNumberAndTitle(left, right);
  });
}

function parseVerseOrderInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function formatVerseOrderInput(song: Song | null): string {
  if (!song || !Array.isArray(song.poradieSloh)) {
    return "";
  }

  return song.poradieSloh.join(", ");
}

function normalizeOrderSignatureFromRaw(raw: string): string {
  return parseVerseOrderInput(raw)
    .map((item) => item.toLocaleLowerCase())
    .join("|");
}

function buildVersePreviewText(rawText: string, maxChars = 30): string {
  const lyricsOnly = rawText.replace(/\[[^\]]*\]/g, " ");
  const compact = lyricsOnly.replace(/\s+/g, " ").trim();
  if (compact.length <= maxChars) {
    return compact;
  }

  return `${compact.slice(0, maxChars)}...`;
}

function hasCustomVerseOrder(song: Song): boolean {
  return Array.isArray(song.poradieSloh) && song.poradieSloh.length > 0;
}

function normalizeVerseLabel(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function getVerseMultiplierKey(song: Song | null, verseIndex: number): string {
  if (!song || !Array.isArray(song.slohy) || song.slohy.length === 0) {
    return "";
  }

  const boundedIndex = Math.max(0, Math.min(verseIndex, song.slohy.length - 1));
  const verseLabel = normalizeVerseLabel(
    song.slohy[boundedIndex]?.cisloS ?? "",
  );
  return verseLabel || `index:${boundedIndex}`;
}

function resolveVerseFontMultiplier(
  song: Song | null,
  verseIndex: number,
  fallbackMultiplier: number,
): number {
  const fallback = Number(
    Math.min(
      MAX_VERSE_FONT_MULTIPLIER,
      Math.max(MIN_VERSE_FONT_MULTIPLIER, fallbackMultiplier || 1),
    ).toFixed(2),
  );

  if (!song) {
    return fallback;
  }

  const verseKey = getVerseMultiplierKey(song, verseIndex);
  if (!verseKey) {
    return fallback;
  }

  const raw = song.verseFontMultipliers?.[verseKey];
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Number(
    Math.min(
      MAX_VERSE_FONT_MULTIPLIER,
      Math.max(MIN_VERSE_FONT_MULTIPLIER, numeric),
    ).toFixed(2),
  );
}

function buildVersePlaybackOrder(song: Song | null): number[] {
  if (!song || !Array.isArray(song.slohy) || song.slohy.length === 0) {
    return [];
  }

  const fallback = song.slohy.map((_, index) => index);
  const rawOrder = Array.isArray(song.poradieSloh) ? song.poradieSloh : [];

  if (rawOrder.length === 0) {
    return fallback;
  }

  const verseIndexByLabel = new Map<string, number>();
  song.slohy.forEach((verse, index) => {
    verseIndexByLabel.set(normalizeVerseLabel(verse.cisloS), index);
  });

  const resolved = rawOrder
    .map((label) => verseIndexByLabel.get(normalizeVerseLabel(label)))
    .filter((index): index is number => typeof index === "number");

  return resolved.length > 0 ? resolved : fallback;
}

function resolveVerseCursor(
  playbackOrder: number[],
  verseIndex: number,
  previousCursor: number,
): number {
  if (playbackOrder.length === 0) {
    return 0;
  }

  if (
    previousCursor >= 0 &&
    previousCursor < playbackOrder.length &&
    playbackOrder[previousCursor] === verseIndex
  ) {
    return previousCursor;
  }

  const firstMatch = playbackOrder.indexOf(verseIndex);
  return firstMatch >= 0 ? firstMatch : 0;
}

function getSongBoundaryState(
  song: Song,
  direction: -1 | 1,
): {
  verseIndex: number;
  cursor: number;
} {
  const playbackOrder = buildVersePlaybackOrder(song);
  if (playbackOrder.length === 0) {
    return {
      verseIndex: 0,
      cursor: 0,
    };
  }

  const cursor = direction === 1 ? 0 : playbackOrder.length - 1;
  return {
    verseIndex: playbackOrder[cursor],
    cursor,
  };
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    fontSize,
    showAkordy,
    chordSizeMultiplier,
    projectorFontSizeMultiplier,
    homeChordColor,
    liturgyWordsPerVerse,
  } = useContext(SettingsContext) as SettingsContextType;
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem(SEARCH_QUERY_STORAGE_KEY) ?? "";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return (
      localStorage.getItem(SELECTED_CATEGORY_STORAGE_KEY) ?? ALL_CATEGORIES
    );
  });
  const [selectedPlaylistFilter, setSelectedPlaylistFilter] = useState(() => {
    return (
      localStorage.getItem(SELECTED_PLAYLIST_FILTER_STORAGE_KEY) ??
      ALL_PLAYLISTS_FILTER
    );
  });
  const [liturgyDate, setLiturgyDate] = useState(() => {
    const stored = localStorage.getItem(LITURGY_DATE_STORAGE_KEY) ?? "";
    return /^\d{4}-\d{2}-\d{2}$/.test(stored)
      ? stored
      : getTodayDateInputValue();
  });
  const [dataMode, setDataMode] = useState<DataMode>(() => getDataMode());
  const [playlists, setPlaylists] = useState<PlaylistsState>(() =>
    loadPlaylistsFromStorage(),
  );
  const [playlistsReady, setPlaylistsReady] = useState(false);
  const [dragSongIdentity, setDragSongIdentity] = useState<string | null>(null);
  const dragSongIdentityRef = useRef<string | null>(null);
  const dragPlaylistKeyRef = useRef<PlaylistKey | null>(null);
  const [selectedSongIdentity, setSelectedSongIdentity] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedVerse, setSelectedVerse] = useState(0);
  const [selectedVerseCursor, setSelectedVerseCursor] = useState(0);
  const [verseOrderInput, setVerseOrderInput] = useState("");
  const [isSavingVerseOrder, setIsSavingVerseOrder] = useState(false);
  const [isSavingVerseFont, setIsSavingVerseFont] = useState(false);
  const [isFillingPsalm, setIsFillingPsalm] = useState(false);
  const [psalmFillFeedback, setPsalmFillFeedback] = useState<{
    message: string;
    tone: "ok" | "warn";
  } | null>(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth,
  );
  const [isSplitView, setIsSplitView] = useState(() => shouldUseSplitView());
  const [splitLeftWidthPercent, setSplitLeftWidthPercent] = useState(() => {
    const stored = Number(localStorage.getItem(SPLIT_LEFT_WIDTH_STORAGE_KEY));
    return clampSplitWidth(stored);
  });
  const [isProjectorConnected, setIsProjectorConnected] = useState(false);
  const [isProjectorBlackout, setIsProjectorBlackout] = useState(false);
  const [isProjectorInfo, setIsProjectorInfo] = useState(false);
  const applyingRemotePayloadRef = useRef(false);
  const applyingRemoteUiSyncRef = useRef(false);
  const lastSentSongIdRef = useRef<string | undefined>(undefined);
  const lastSentVerseFontSignatureRef = useRef<string>("");
  const contentBoxRef = useRef<HTMLDivElement | null>(null);
  const [projectorFeedback, setProjectorFeedback] = useState<{
    message: string;
    tone: "ok" | "warn";
  } | null>(null);
  const { verziaDb } = useVersionStore();
  const queryClient = useQueryClient();

  const { data, error, isLoading, isSuccess } = useQuery({
    queryKey: ["songs", verziaDb],
    queryFn: () => getSongs(""),
  });

  const songsData: SongsData = isSuccess && data ? data : [];

  const categories = useMemo(() => {
    const fromData = songsData
      .map(getSongCategory)
      .filter((category) => category && category !== ALL_CATEGORIES);

    const dynamicCategories = Array.from(new Set(fromData)).sort((a, b) =>
      a.localeCompare(b),
    );

    return [ALL_CATEGORIES, ...dynamicCategories];
  }, [songsData]);

  useEffect(() => {
    localStorage.setItem(SEARCH_QUERY_STORAGE_KEY, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem(SELECTED_CATEGORY_STORAGE_KEY, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem(
      SELECTED_PLAYLIST_FILTER_STORAGE_KEY,
      selectedPlaylistFilter,
    );
  }, [selectedPlaylistFilter]);

  useEffect(() => {
    localStorage.setItem(LITURGY_DATE_STORAGE_KEY, liturgyDate);
  }, [liturgyDate]);

  useEffect(() => {
    const handleDataModeChanged = (event: Event) => {
      const nextMode = (event as CustomEvent<DataMode>).detail;
      if (nextMode === "online" || nextMode === "local") {
        setDataMode(nextMode);
      }
    };

    window.addEventListener("data-mode-changed", handleDataModeChanged);
    return () =>
      window.removeEventListener("data-mode-changed", handleDataModeChanged);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydratePlaylists() {
      setPlaylistsReady(false);

      if (dataMode === "online") {
        if (!cancelled) {
          setPlaylists(loadPlaylistsFromStorage());
          setPlaylistsReady(true);
        }
        return;
      }

      try {
        const fromApi = await loadPlaylistsFromLocalApi();
        if (!cancelled) {
          setPlaylists(fromApi);
          setPlaylistsReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Lokalne playlisty fallback to localStorage", error);
          setPlaylists(loadPlaylistsFromStorage());
          setPlaylistsReady(true);
        }
      }
    }

    hydratePlaylists();

    return () => {
      cancelled = true;
    };
  }, [dataMode]);

  useEffect(() => {
    if (!playlistsReady) {
      return;
    }

    if (dataMode === "online") {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
      return;
    }

    savePlaylistsToLocalApi(playlists).catch((error) => {
      console.warn("Lokalne playlisty save failed", error);
    });
  }, [dataMode, playlists, playlistsReady]);

  useEffect(() => {
    localStorage.setItem(
      SPLIT_LEFT_WIDTH_STORAGE_KEY,
      String(splitLeftWidthPercent),
    );
  }, [splitLeftWidthPercent]);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    if (categories.includes(selectedCategory)) {
      return;
    }

    setSelectedCategory(ALL_CATEGORIES);
  }, [categories, isSuccess, selectedCategory]);

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setIsSplitView(shouldUseSplitView());
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    startProjectorChannel("controller");
    const ownClientId = getProjectorClientId();
    setIsProjectorConnected(getProjectorChannelConnectionState());
    const unsubscribeConnection = subscribeProjectorConnectionState(
      (connected) => {
        setIsProjectorConnected(connected);
      },
    );

    const unsubscribePayload = subscribeProjectorPayload((payload) => {
      if (payload.source && payload.source === ownClientId) {
        return;
      }

      const incomingSearchQuery =
        typeof payload.searchQuery === "string" ? payload.searchQuery : null;
      const incomingCategory =
        typeof payload.selectedCategory === "string"
          ? payload.selectedCategory
          : null;
      const incomingPlaylistFilter =
        typeof payload.selectedPlaylistFilter === "string"
          ? payload.selectedPlaylistFilter
          : null;
      const incomingPlaylists = normalizePlaylistsFromPayload(
        payload.playlists,
      );

      const hasUiSyncPayload =
        incomingSearchQuery !== null ||
        incomingCategory !== null ||
        incomingPlaylistFilter !== null ||
        incomingPlaylists !== null;

      if (hasUiSyncPayload) {
        applyingRemoteUiSyncRef.current = true;

        if (incomingSearchQuery !== null) {
          setSearchQuery((previous) =>
            previous === incomingSearchQuery ? previous : incomingSearchQuery,
          );
        }

        if (incomingCategory !== null) {
          setSelectedCategory((previous) =>
            previous === incomingCategory ? previous : incomingCategory,
          );
        }

        if (incomingPlaylistFilter !== null) {
          setSelectedPlaylistFilter((previous) => {
            if (previous === incomingPlaylistFilter) {
              return previous;
            }

            if (
              incomingPlaylistFilter !== ALL_PLAYLISTS_FILTER &&
              !PLAYLIST_KEYS.includes(incomingPlaylistFilter as PlaylistKey)
            ) {
              return previous;
            }

            return incomingPlaylistFilter;
          });
        }

        if (incomingPlaylists !== null) {
          setPlaylists((previous) =>
            arePlaylistsEqual(previous, incomingPlaylists)
              ? previous
              : incomingPlaylists,
          );
        }
      }

      setIsProjectorBlackout(payload.blackout === true);
      setIsProjectorInfo(payload.showInfo === true);

      const incomingSongId =
        typeof payload.songId === "number"
          ? Math.trunc(payload.songId)
          : undefined;
      const incomingSong =
        payload.song ??
        (incomingSongId
          ? songsData.find((song) => getSongId(song) === incomingSongId)
          : undefined);

      if (!incomingSong) {
        return;
      }

      applyingRemotePayloadRef.current = true;

      if (incomingSong) {
        const resolvedSongId = getSongId(incomingSong);
        const resolvedSong =
          songsData.find((song) => {
            if (resolvedSongId !== undefined) {
              return getSongId(song) === resolvedSongId;
            }

            return isSameSong(song, incomingSong);
          }) ?? incomingSong;

        const syncedSong = applyVerseFontMultipliersFromPayload(
          resolvedSong,
          payload.verseFontMultipliers,
        );

        setSelectedSongIdentity(getSongIdentity(syncedSong));
        setSelectedSong(syncedSong);
        setVerseOrderInput(formatVerseOrderInput(syncedSong));

        if (typeof payload.selectedView === "number") {
          const playbackOrder = buildVersePlaybackOrder(syncedSong);
          const safeIndex = Math.max(
            0,
            Math.min(
              payload.selectedView,
              Math.max(0, syncedSong.slohy.length - 1),
            ),
          );
          setSelectedVerseCursor((previousCursor) =>
            resolveVerseCursor(playbackOrder, safeIndex, previousCursor),
          );
          setSelectedVerse(safeIndex);
        }
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribePayload();
    };
  }, [songsData]);

  useEffect(() => {
    if (!playlistsReady) {
      return;
    }

    if (applyingRemoteUiSyncRef.current) {
      applyingRemoteUiSyncRef.current = false;
      return;
    }

    sendProjectorPayload({
      searchQuery,
      selectedCategory,
      selectedPlaylistFilter,
      playlists,
    });
  }, [
    playlists,
    playlistsReady,
    searchQuery,
    selectedCategory,
    selectedPlaylistFilter,
  ]);

  function contains(song: Song, formatedQuery: string): boolean {
    return (
      song.cisloP.toLowerCase().includes(formatedQuery?.toLowerCase()) ||
      song.nazov.toLowerCase().includes(formatedQuery?.toLowerCase())
    );
  }

  const activePlaylistSet = useMemo<Set<string> | null>(() => {
    if (selectedPlaylistFilter === ALL_PLAYLISTS_FILTER) {
      return null;
    }

    if (!PLAYLIST_KEYS.includes(selectedPlaylistFilter as PlaylistKey)) {
      return null;
    }

    return new Set(playlists[selectedPlaylistFilter as PlaylistKey] ?? []);
  }, [playlists, selectedPlaylistFilter]);

  const activePlaylistOrder = useMemo(() => {
    if (!PLAYLIST_KEYS.includes(selectedPlaylistFilter as PlaylistKey)) {
      return [];
    }

    return playlists[selectedPlaylistFilter as PlaylistKey] ?? [];
  }, [playlists, selectedPlaylistFilter]);

  const activePlaylistKey = useMemo<PlaylistKey | null>(() => {
    if (!PLAYLIST_KEYS.includes(selectedPlaylistFilter as PlaylistKey)) {
      return null;
    }

    return selectedPlaylistFilter as PlaylistKey;
  }, [selectedPlaylistFilter]);

  const playlistResolvedCounts = useMemo(() => {
    const counts = {
      "Playlist 1": 0,
    } as Record<PlaylistKey, number>;

    PLAYLIST_KEYS.forEach((playlistKey) => {
      const entries = playlists[playlistKey] ?? [];
      counts[playlistKey] = resolveSongsForPlaylist(songsData, entries).length;
    });

    return counts;
  }, [playlists, songsData]);

  const filteredData: SongsData = useMemo(() => {
    const formattedQuery = searchQuery.toLocaleLowerCase().trim();
    const commaSeparatedTerms = parseCommaSeparatedQuery(formattedQuery);
    const shouldUseCommaFilter =
      formattedQuery.includes(",") && commaSeparatedTerms.length > 0;
    const normalizedSelectedCategory = normalizeCategory(selectedCategory);
    const isSpecificPlaylistActive = activePlaylistSet !== null;

    if (isSpecificPlaylistActive) {
      return resolveSongsForPlaylist(songsData, activePlaylistOrder);
    }

    const matchingSongs = songsData.filter((song) => {
      // Ignoruj piesne bez čísla alebo názvu
      if (!song || !(song.cisloP ?? "").trim() || !(song.nazov ?? "").trim()) {
        return false;
      }
      const normalizedSongNumber = normalizeSongNumber(song.cisloP);
      const songTitleLower = (song.nazov ?? "").toLocaleLowerCase();
      const queryMatch = isSpecificPlaylistActive
        ? true
        : shouldUseCommaFilter
        ? commaSeparatedTerms.some(
            (term) =>
              normalizedSongNumber === term || songTitleLower.includes(term),
          )
        : contains(song, formattedQuery);
      const normalizedSongCategory = normalizeCategory(getSongCategory(song));
      const categoryMatch =
        selectedCategory === ALL_CATEGORIES ||
        normalizedSongCategory === normalizedSelectedCategory;
      const playlistMatch =
        activePlaylistSet === null
          ? true
          : [...activePlaylistSet].some((playlistIdentity) =>
              songMatchesPlaylistIdentity(song, playlistIdentity),
            );

      return queryMatch && categoryMatch && playlistMatch;
    });

    return sortSongsByFilter(matchingSongs, formattedQuery);
  }, [
    songsData,
    searchQuery,
    selectedCategory,
    activePlaylistSet,
    activePlaylistOrder,
  ]);

  const playlistMembershipByIdentity = useMemo(() => {
    const membership = new Set<string>();
    const playlistEntries = playlists[SINGLE_PLAYLIST_KEY] ?? [];

    songsData.forEach((song) => {
      const matches = playlistEntries.some((entry) =>
        songMatchesPlaylistIdentity(song, entry),
      );
      if (!matches) {
        return;
      }

      membership.add(getSongIdentity(song));
    });

    return membership;
  }, [playlists, songsData]);

  function togglePlaylistMembership(song: Song) {
    const isInPlaylist = playlistMembershipByIdentity.has(
      getSongIdentity(song),
    );

    setPlaylists((previous) => {
      const current = previous[SINGLE_PLAYLIST_KEY] ?? [];

      if (isInPlaylist) {
        return {
          ...previous,
          [SINGLE_PLAYLIST_KEY]: current.filter(
            (item) => !songMatchesPlaylistIdentity(song, item),
          ),
        };
      }

      const nextSet = new Set(
        current.filter((item) => !songMatchesPlaylistIdentity(song, item)),
      );
      nextSet.add(getSongIdentity(song));
      return {
        ...previous,
        [SINGLE_PLAYLIST_KEY]: Array.from(nextSet),
      };
    });
  }

  function reorderPlaylistBySongIdentity(
    playlistKey: PlaylistKey,
    draggedIdentity: string,
    targetIdentity: string,
  ) {
    setPlaylists((previous) => {
      const resolved = resolveSongsForPlaylist(
        songsData,
        previous[playlistKey] ?? [],
      );
      const fromIndex = resolved.findIndex(
        (song) => getSongIdentity(song) === draggedIdentity,
      );
      const toIndex = resolved.findIndex(
        (song) => getSongIdentity(song) === targetIdentity,
      );

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return previous;
      }

      const reordered = [...resolved];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      return {
        ...previous,
        [playlistKey]: reordered.map((song) => getSongIdentity(song)),
      };
    });
  }

  function handleDragHandlePointerDown(
    event: React.PointerEvent,
    songIdentity: string,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (activePlaylistKey === null) {
      setSelectedPlaylistFilter(SINGLE_PLAYLIST_KEY);
      setProjectorFeedback({
        message: "Prepnuté do playlistu — potiahnutím zmeň poradie.",
        tone: "ok",
      });
      window.setTimeout(() => setProjectorFeedback(null), 2500);
      return;
    }

    dragSongIdentityRef.current = songIdentity;
    dragPlaylistKeyRef.current = activePlaylistKey;
    setDragSongIdentity(songIdentity);
  }

  useEffect(() => {
    if (!dragSongIdentity) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragSongIdentityRef.current || !dragPlaylistKeyRef.current) {
        return;
      }

      const listBox = document.getElementById("listBox");
      if (listBox) {
        const rect = listBox.getBoundingClientRect();
        if (event.clientY < rect.top + 45) {
          listBox.scrollTop -= 10;
        } else if (event.clientY > rect.bottom - 45) {
          listBox.scrollTop += 10;
        }
      }

      const elementUnderPointer = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      const targetRow = elementUnderPointer?.closest("[data-song-identity]");
      const targetIdentity = targetRow?.getAttribute("data-song-identity");

      if (!targetIdentity || targetIdentity === dragSongIdentityRef.current) {
        return;
      }

      reorderPlaylistBySongIdentity(
        dragPlaylistKeyRef.current,
        dragSongIdentityRef.current,
        targetIdentity,
      );
    };

    const finishDrag = () => {
      dragSongIdentityRef.current = null;
      dragPlaylistKeyRef.current = null;
      setDragSongIdentity(null);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [dragSongIdentity]);

  useEffect(() => {
    if (filteredData.length === 0) {
      setSelectedSong(null);
      setSelectedSongIdentity("");
      setSelectedVerse(0);
      setSelectedVerseCursor(0);
      setVerseOrderInput("");
      return;
    }

    const selectedInFiltered = filteredData.find(
      (song) => getSongIdentity(song) === selectedSongIdentity,
    );

    if (selectedInFiltered) {
      setSelectedSong(selectedInFiltered);
      setVerseOrderInput(formatVerseOrderInput(selectedInFiltered));
      return;
    }

    const firstSong = filteredData[0];
    setSelectedSong(firstSong);
    setSelectedSongIdentity(getSongIdentity(firstSong));
    setSelectedVerse(0);
    setSelectedVerseCursor(0);
    setVerseOrderInput(formatVerseOrderInput(firstSong));
  }, [filteredData, selectedSongIdentity]);

  useEffect(() => {
    if (!selectedSong || selectedSong.slohy.length === 0) {
      return;
    }

    if (applyingRemotePayloadRef.current) {
      applyingRemotePayloadRef.current = false;
      return;
    }

    const nextVerse = Math.max(
      0,
      Math.min(selectedVerse, selectedSong.slohy.length - 1),
    );
    if (nextVerse !== selectedVerse) {
      const playbackOrder = buildVersePlaybackOrder(selectedSong);
      const nextCursor = resolveVerseCursor(
        playbackOrder,
        nextVerse,
        selectedVerseCursor,
      );

      setSelectedVerseCursor(nextCursor);
      setSelectedVerse(nextVerse);
      return;
    }

    if (!isProjectorBlackout) {
      const songIdentity = getSongIdentity(selectedSong);
      const verseFontSignature = getVerseFontMultiplierSignature(selectedSong);
      const songChanged = lastSentSongIdRef.current !== songIdentity;
      const verseFontChanged =
        lastSentVerseFontSignatureRef.current !== verseFontSignature;

      lastSentSongIdRef.current = songIdentity;
      lastSentVerseFontSignatureRef.current = verseFontSignature;

      if (songChanged || verseFontChanged) {
        sendProjectorPayload({
          ...buildProjectorSongPayload(selectedSong),
          selectedView: selectedVerse,
          showAkordy,
          blackout: false,
        });
      } else {
        sendProjectorPayload({ selectedView: selectedVerse, blackout: false });
      }
    }
  }, [
    selectedSong,
    selectedVerse,
    selectedVerseCursor,
    showAkordy,
    isProjectorBlackout,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  function handleShowSetting() {
    navigate("modal", { state: { background: location } });
  }

  function handleGoToAdmin() {
    navigate("/admin-import");
  }

  function handleClearSearch() {
    setSearchQuery("");
    setSelectedSongIdentity("");
  }

  const handleClickSkokNaPiesen = (item: Song) => {
    setSelectedSongIdentity(getSongIdentity(item));
    const piesen: Song = {
      id: item.id,
      cisloP: item.cisloP,
      nazov: item.nazov,
      slohy: item.slohy,
      source: item.source,
      kategoria: item.kategoria,
      poradieSloh: item.poradieSloh,
      verseFontMultipliers: item.verseFontMultipliers,
    };
    setSelectedSong(piesen);
    setSelectedVerse(0);
    setSelectedVerseCursor(0);
    setVerseOrderInput(formatVerseOrderInput(piesen));

    if (!isProjectorBlackout) {
      lastSentSongIdRef.current = getSongIdentity(piesen);
      lastSentVerseFontSignatureRef.current =
        getVerseFontMultiplierSignature(piesen);
      sendProjectorPayload({
        ...buildProjectorSongPayload(piesen),
        selectedView: 0,
        showAkordy,
        blackout: false,
      });
    }
  };

  function selectVerse(index: number) {
    if (!selectedSong || selectedSong.slohy.length === 0) {
      return;
    }

    const maxIndex = selectedSong.slohy.length - 1;
    const next = Math.max(0, Math.min(index, maxIndex));
    const playbackOrder = buildVersePlaybackOrder(selectedSong);
    const nextCursor = resolveVerseCursor(
      playbackOrder,
      next,
      selectedVerseCursor,
    );

    setSelectedVerseCursor(nextCursor);
    setSelectedVerse(next);
  }

  function moveVerse(step: -1 | 1) {
    if (!selectedSong || selectedSong.slohy.length === 0) {
      return;
    }

    const playbackOrder = buildVersePlaybackOrder(selectedSong);
    if (playbackOrder.length === 0) {
      return;
    }

    const currentCursor = resolveVerseCursor(
      playbackOrder,
      selectedVerse,
      selectedVerseCursor,
    );

    const canMoveInsideSong =
      (step === 1 && currentCursor < playbackOrder.length - 1) ||
      (step === -1 && currentCursor > 0);

    if (canMoveInsideSong) {
      const nextCursor = currentCursor + step;
      setSelectedVerseCursor(nextCursor);
      setSelectedVerse(playbackOrder[nextCursor]);
      return;
    }

    if (filteredData.length === 0) {
      return;
    }

    const currentSongIndex = filteredData.findIndex((song) =>
      isSameSong(song, selectedSong),
    );

    if (currentSongIndex === -1) {
      return;
    }

    const nextSongIndex =
      (currentSongIndex + step + filteredData.length) % filteredData.length;
    const nextSong = filteredData[nextSongIndex];

    if (!nextSong) {
      return;
    }

    const boundary = getSongBoundaryState(nextSong, step);
    setSelectedSongIdentity(getSongIdentity(nextSong));
    setSelectedSong(nextSong);
    setSelectedVerse(boundary.verseIndex);
    setSelectedVerseCursor(boundary.cursor);
    setVerseOrderInput(formatVerseOrderInput(nextSong));

    if (!isProjectorBlackout) {
      lastSentSongIdRef.current = getSongIdentity(nextSong);
      lastSentVerseFontSignatureRef.current =
        getVerseFontMultiplierSignature(nextSong);
      sendProjectorPayload({
        ...buildProjectorSongPayload(nextSong),
        selectedView: boundary.verseIndex,
        showAkordy,
        blackout: false,
      });
    }
  }

  function handleOpenProjector() {
    if (!selectedSong) {
      return;
    }

    if (isProjectorBlackout) {
      setProjectorFeedback({
        message: "BLACK rezim je aktivny. Vypni BLACK pre obnovenie projekcie.",
        tone: "warn",
      });
      window.setTimeout(() => {
        setProjectorFeedback(null);
      }, 2200);
      return;
    }

    lastSentSongIdRef.current = getSongIdentity(selectedSong);
    lastSentVerseFontSignatureRef.current =
      getVerseFontMultiplierSignature(selectedSong);
    sendProjectorPayload({
      ...buildProjectorSongPayload(selectedSong),
      selectedView: selectedVerse,
      showAkordy,
      blackout: false,
    });

    const connected = getProjectorChannelConnectionState();
    setProjectorFeedback(
      connected
        ? { message: "Odoslane do projektora.", tone: "ok" }
        : { message: getProjectorUnavailableMessage(), tone: "warn" },
    );

    window.setTimeout(() => {
      setProjectorFeedback(null);
    }, 2200);
  }

  function handleProjectorBlackoutToggle(checked: boolean) {
    setIsProjectorBlackout(checked);

    if (checked) {
      sendProjectorPayload({ blackout: true });

      const connected = getProjectorChannelConnectionState();
      setProjectorFeedback(
        connected
          ? { message: "Projektor prepnuty na ciernu obrazovku.", tone: "ok" }
          : { message: getProjectorUnavailableMessage(), tone: "warn" },
      );
    } else if (selectedSong) {
      lastSentSongIdRef.current = getSongIdentity(selectedSong);
      lastSentVerseFontSignatureRef.current =
        getVerseFontMultiplierSignature(selectedSong);
      sendProjectorPayload({
        ...buildProjectorSongPayload(selectedSong),
        selectedView: selectedVerse,
        showAkordy,
        blackout: false,
      });

      setProjectorFeedback({ message: "BLACK rezim vypnuty.", tone: "ok" });
    } else {
      sendProjectorPayload({ blackout: false });
      setProjectorFeedback({ message: "BLACK rezim vypnuty.", tone: "ok" });
    }

    window.setTimeout(() => {
      setProjectorFeedback(null);
    }, 2200);
  }

  function handleProjectorInfoToggle(checked: boolean) {
    setIsProjectorInfo(checked);
    sendProjectorPayload({ showInfo: checked });

    const connected = getProjectorChannelConnectionState();
    setProjectorFeedback(
      checked
        ? {
            message: connected
              ? "Projektor prepnuty na uvodnu obrazovku (siet/IP)."
              : getProjectorUnavailableMessage(),
            tone: connected ? "ok" : "warn",
          }
        : { message: "Navrat k premietaniu skladby.", tone: "ok" },
    );

    window.setTimeout(() => {
      setProjectorFeedback(null);
    }, 2200);
  }

  function handleOpenFullAkordy() {
    if (!selectedSong) {
      return;
    }

    navigate("/akordy", { state: { song: selectedSong } });
  }

  function handleSplitDividerDragStart(clientX: number) {
    const container = contentBoxRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();

    const applyClientX = (x: number) => {
      const percent = ((x - rect.left) / rect.width) * 100;
      setSplitLeftWidthPercent(clampSplitWidth(percent));
    };

    applyClientX(clientX);

    const handleMouseMove = (event: MouseEvent) => applyClientX(event.clientX);
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        applyClientX(touch.clientX);
      }
    };
    const stopDragging = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", stopDragging);
  }

  function handleSplitDividerMouseDown(event: React.MouseEvent) {
    event.preventDefault();
    handleSplitDividerDragStart(event.clientX);
  }

  function handleSplitDividerTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    handleSplitDividerDragStart(touch.clientX);
  }

  function handleVerseOrderInputChange(raw: string) {
    setVerseOrderInput(raw);
  }

  function applyVerseOrderLocally(order?: string[]) {
    if (!selectedSong) {
      return;
    }

    const nextSong: Song = {
      ...selectedSong,
      poradieSloh: order && order.length > 0 ? order : undefined,
    };

    const playbackOrder = buildVersePlaybackOrder(nextSong);
    const nextCursor = resolveVerseCursor(
      playbackOrder,
      selectedVerse,
      selectedVerseCursor,
    );

    setSelectedSong(nextSong);
    setSelectedVerseCursor(nextCursor);
  }

  function updateSongOrderInCache(order?: string[]) {
    if (!selectedSong) {
      return;
    }

    const selectedId = getSongId(selectedSong);

    queryClient.setQueryData<SongsData | undefined>(
      ["songs", verziaDb],
      (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((song) => {
          if (selectedId !== undefined) {
            if (getSongId(song) !== selectedId) {
              return song;
            }
          } else if (!isSameSong(song, selectedSong)) {
            return song;
          }

          return {
            ...song,
            poradieSloh: order && order.length > 0 ? order : undefined,
          };
        });
      },
    );
  }

  function updateSongVerseFontInCache(verseKey: string, multiplier: number) {
    if (!selectedSong) {
      return;
    }

    const selectedId = getSongId(selectedSong);

    queryClient.setQueryData<SongsData | undefined>(
      ["songs", verziaDb],
      (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((song) => {
          if (selectedId !== undefined) {
            if (getSongId(song) !== selectedId) {
              return song;
            }
          } else if (!isSameSong(song, selectedSong)) {
            return song;
          }

          return {
            ...song,
            verseFontMultipliers: {
              ...(song.verseFontMultipliers ?? {}),
              [verseKey]: multiplier,
            },
          };
        });
      },
    );
  }

  async function handleAdjustSelectedVerseFont(step: -1 | 1) {
    if (!selectedSong || isSavingVerseFont) {
      return;
    }

    const selectedId = getSongId(selectedSong);
    if (selectedId === undefined) {
      console.error(
        "Ukladanie velkosti pisma zlyhalo: skladba nema stabilne id.",
      );
      return;
    }

    const verseKey = getVerseMultiplierKey(selectedSong, selectedVerse);
    if (!verseKey) {
      return;
    }

    const currentMultiplier = resolveVerseFontMultiplier(
      selectedSong,
      selectedVerse,
      projectorFontSizeMultiplier,
    );

    const nextMultiplier = Number(
      Math.min(
        MAX_VERSE_FONT_MULTIPLIER,
        Math.max(
          MIN_VERSE_FONT_MULTIPLIER,
          currentMultiplier + step * VERSE_FONT_STEP,
        ),
      ).toFixed(2),
    );

    if (nextMultiplier === currentMultiplier) {
      return;
    }

    setIsSavingVerseFont(true);
    try {
      await updateSongVerseFontMultiplierById(
        selectedId,
        verseKey,
        nextMultiplier,
      );

      setSelectedSong((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          verseFontMultipliers: {
            ...(previous.verseFontMultipliers ?? {}),
            [verseKey]: nextMultiplier,
          },
        };
      });

      lastSentVerseFontSignatureRef.current = "";

      updateSongVerseFontInCache(verseKey, nextMultiplier);
    } catch (error) {
      console.error("Ukladanie velkosti pisma zlyhalo:", error);
    } finally {
      setIsSavingVerseFont(false);
    }
  }

  async function handleSaveVerseOrder() {
    if (!selectedSong || isSavingVerseOrder) {
      return;
    }

    const parsed = parseVerseOrderInput(verseOrderInput);
    const selectedId = getSongId(selectedSong);

    if (selectedId === undefined) {
      console.error("Ukladanie poradia zlyhalo: skladba nema stabilne id.");
      return;
    }

    setIsSavingVerseOrder(true);
    try {
      await updateSongOrderById(
        selectedId,
        parsed.length > 0 ? parsed : undefined,
      );

      applyVerseOrderLocally(parsed);
      updateSongOrderInCache(parsed);

      // Resetujeme input aby sa ukaze aktualne poradie z DB
      const savedSong: Song = {
        ...selectedSong,
        poradieSloh: parsed.length > 0 ? parsed : undefined,
      };
      setVerseOrderInput(formatVerseOrderInput(savedSong));
    } catch (error) {
      console.error("Ukladanie poradia zlyhalo:", error);
    } finally {
      setIsSavingVerseOrder(false);
    }
  }

  async function handleClearVerseOrder() {
    if (!selectedSong || isSavingVerseOrder) {
      return;
    }

    const selectedId = getSongId(selectedSong);
    if (selectedId === undefined) {
      console.error("Mazanie poradia zlyhalo: skladba nema stabilne id.");
      return;
    }

    setVerseOrderInput("");
    setIsSavingVerseOrder(true);
    try {
      await updateSongOrderById(selectedId, undefined);
      applyVerseOrderLocally(undefined);
      updateSongOrderInCache(undefined);
    } catch (error) {
      console.error("Mazanie poradia zlyhalo:", error);
    } finally {
      setIsSavingVerseOrder(false);
    }
  }

  async function handleFillPsalmOnHome() {
    if (isFillingPsalm) {
      return;
    }

    const targetSong =
      selectedSong && isPsalmCategory(getSongCategory(selectedSong))
        ? selectedSong
        : songsData.find((song) => isPsalmCategory(getSongCategory(song)));

    setIsFillingPsalm(true);
    setPsalmFillFeedback({
      message: "Nacitavam liturgicke citania...",
      tone: "ok",
    });

    try {
      const liturgy = await fetchTodayLiturgy(liturgyDate);
      const verses = buildLiturgyVerses(liturgy, liturgyWordsPerVerse);

      if (verses.length === 0) {
        throw new Error("Liturgicke citania su prazdne.");
      }

      const songTitle =
        [
          String(liturgy.title ?? "").trim(),
          String(liturgy.citation ?? "").trim(),
        ]
          .filter((part) => part.length > 0)
          .join(" ") || "Žalm";

      if (targetSong && getSongId(targetSong) !== undefined) {
        const selectedId = getSongId(targetSong)!;
        const nextSong: Song = {
          ...targetSong,
          nazov:
            (targetSong.nazov ?? "").trim().length > 0
              ? targetSong.nazov
              : songTitle,
          kategoria: "Žalm",
          source:
            String(liturgy.sourceUrl ?? "").trim().length > 0
              ? String(liturgy.sourceUrl)
              : targetSong.source,
          poradieSloh: verses.map((verse) => verse.cisloS),
          slohy: verses,
        };

        await updateSongInSupabase(selectedId, nextSong);

        queryClient.setQueryData<SongsData | undefined>(
          ["songs", verziaDb],
          (previous) => {
            if (!previous) {
              return previous;
            }

            return previous.map((song) =>
              getSongId(song) === selectedId ? { ...song, ...nextSong } : song,
            );
          },
        );

        setSelectedSong(nextSong);
        setSelectedSongIdentity(getSongIdentity(nextSong));
        setSelectedVerse(0);
        setSelectedVerseCursor(0);
        setVerseOrderInput(formatVerseOrderInput(nextSong));
        lastSentSongIdRef.current = "";
      } else {
        const newSong: Song = {
          cisloP: "1",
          nazov: songTitle,
          kategoria: "Žalm",
          source: String(liturgy.sourceUrl ?? ""),
          poradieSloh: verses.map((verse) => verse.cisloS),
          slohy: verses,
        };

        const created = await createSongInSupabase(newSong);
        const createdSong: Song = {
          ...newSong,
          id: created.id,
        };

        queryClient.setQueryData<SongsData | undefined>(
          ["songs", verziaDb],
          (previous) => (previous ? [...previous, createdSong] : [createdSong]),
        );

        setSelectedSong(createdSong);
        setSelectedSongIdentity(getSongIdentity(createdSong));
        setSelectedVerse(0);
        setSelectedVerseCursor(0);
        setVerseOrderInput(formatVerseOrderInput(createdSong));
        lastSentSongIdRef.current = "";
      }

      setPsalmFillFeedback({
        message: "Zalm bol naplneny z dnesnych citani.",
        tone: "ok",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Naplnenie zalmu zlyhalo.";
      setPsalmFillFeedback({ message, tone: "warn" });
    } finally {
      setIsFillingPsalm(false);
      window.setTimeout(() => {
        setPsalmFillFeedback(null);
      }, 2600);
    }
  }

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const normalizedKey = event.key.toLocaleLowerCase();

      if (
        event.key === "ArrowRight" ||
        event.key === "PageDown" ||
        normalizedKey === "b"
      ) {
        if (selectedSong && selectedSong.slohy.length > 0) {
          event.preventDefault();
          moveVerse(1);
        }
        return;
      }

      if (
        event.key === "ArrowLeft" ||
        event.key === "PageUp" ||
        normalizedKey === "a"
      ) {
        if (selectedSong && selectedSong.slohy.length > 0) {
          event.preventDefault();
          moveVerse(-1);
        }
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const currentIndex = selectedSong
          ? filteredData.findIndex((s) => isSameSong(s, selectedSong))
          : -1;
        const step = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = Math.max(
          0,
          Math.min(filteredData.length - 1, currentIndex + step),
        );
        const nextSong = filteredData[nextIndex];
        if (
          nextSong &&
          (!selectedSong || !isSameSong(nextSong, selectedSong))
        ) {
          setSelectedSongIdentity(getSongIdentity(nextSong));
          setSelectedSong(nextSong);
          setSelectedVerse(0);
          setSelectedVerseCursor(0);
          setVerseOrderInput(formatVerseOrderInput(nextSong));
        }
      }

      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        handleProjectorBlackoutToggle(!isProjectorBlackout);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedSong,
    selectedVerse,
    selectedVerseCursor,
    filteredData,
    isProjectorBlackout,
  ]);

  const pageBackground = "var(--color-page-bg)";
  const panelBackground = "var(--color-panel-bg)";
  const inputBackground = "var(--color-input-bg)";
  const surfaceBackground = "var(--color-surface-bg)";
  const textColor = "var(--color-text)";
  const mutedBorder = "2px solid var(--color-border)";
  const itemBackground = "var(--color-item-bg)";
  const itemBorder = "3px ridge var(--color-item-border)";
  const activeTabBackground = "var(--color-active-tab-bg)";
  const mutedText = "var(--color-text-muted)";
  const isCompactSplitView =
    isSplitView && viewportWidth < COMPACT_SPLIT_BREAKPOINT;
  const savedVerseOrderInput = formatVerseOrderInput(selectedSong);
  const hasUnsavedVerseOrder =
    normalizeOrderSignatureFromRaw(verseOrderInput) !==
    normalizeOrderSignatureFromRaw(savedVerseOrderInput);
  const selectedVerseMultiplier = resolveVerseFontMultiplier(
    selectedSong,
    selectedVerse,
    projectorFontSizeMultiplier,
  );
  const selectedVerseMultiplierPercent = Math.round(
    selectedVerseMultiplier * 100,
  );

  if (isLoading) {
    return (
      <div
        style={{
          padding: 24,
          fontSize: 22,
          color: "#111827",
          backgroundColor: "#eceff3",
          minHeight: "100svh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isSuccess) {
    const errorMessage =
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : "Neznamy dovod. Skontroluj dostupnost datoveho zdroja.";

    return (
      <div
        style={{
          padding: 24,
          fontSize: 22,
          color: "#7f1d1d",
          backgroundColor: "#fee2e2",
          minHeight: "100svh",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          Error loading data
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.4 }}>{errorMessage}</div>
      </div>
    );
  }

  return (
    <div
      id="container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        minHeight: "100svh",
        overflow: "hidden",
        boxSizing: "border-box",
        gap: 10,
        padding: "20px 10px 10px",
        margin: 0,
        top: 0,
        left: 0,
        color: textColor,
        backgroundColor: pageBackground,
      }}
    >
      <FullscreenButton />
      <div
        id="inputBox"
        style={{
          // Zaberá dostupný voľný priestor
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: "0 0 auto",
          margin: 0,
          padding: 0,
          flexDirection: "row",
          flexWrap: isCompactSplitView ? "wrap" : "nowrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "0 0 auto",
            height: isCompactSplitView ? 62 : 80,
            gap: 4,
          }}
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              flex: "1 1 0",
              minHeight: 0,
              fontSize: isCompactSplitView ? 14 : 16,
              padding: "0 10px",
              borderRadius: 10,
              border: mutedBorder,
              backgroundColor: panelBackground,
              color: textColor,
            }}
            title="Typ piesne"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              setSelectedPlaylistFilter((previous) =>
                previous === SINGLE_PLAYLIST_KEY
                  ? ALL_PLAYLISTS_FILTER
                  : SINGLE_PLAYLIST_KEY,
              )
            }
            style={{
              flex: "1 1 0",
              minHeight: 0,
              fontSize: isCompactSplitView ? 14 : 16,
              fontWeight: 800,
              padding: "0 10px",
              borderRadius: 10,
              border: mutedBorder,
              backgroundColor:
                selectedPlaylistFilter === SINGLE_PLAYLIST_KEY
                  ? activeTabBackground
                  : "var(--color-input-bg)",
              color:
                selectedPlaylistFilter === SINGLE_PLAYLIST_KEY
                  ? "white"
                  : textColor,
              cursor: "pointer",
            }}
            title="Zobrazit/skryt obsah playlistu"
          >
            PL ({playlistResolvedCounts[SINGLE_PLAYLIST_KEY]})
          </button>
        </div>
        <div style={{ position: "relative", flex: "1 1 auto", minWidth: 0 }}>
          <input
            type="text"
            style={{
              fontSize: isCompactSplitView ? 22 : 30,
              width: "100%",
              height: isCompactSplitView ? 62 : 80,
              boxSizing: "border-box",
              backgroundColor: inputBackground,
              borderRadius: 15,
              padding: "0 54px 0 20px",
              color: textColor,
              border: mutedBorder,
            }}
            placeholder="zadaj text alebo mix (napr. 2,33,som)..."
            onChange={handleSearch}
            value={searchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <button
              onClick={handleClearSearch}
              aria-label="Vycistit filter"
              title="Vycistit filter"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 34,
                height: 34,
                borderRadius: 17,
                border: mutedBorder,
                backgroundColor: surfaceBackground,
                color: textColor,
                cursor: "pointer",
                fontSize: 22,
                lineHeight: 1,
                padding: 0,
              }}
            >
              X
            </button>
          )}
        </div>
        <button
          onClick={handleShowSetting}
          style={getStyles(isCompactSplitView ? 30 : 40).button}
        >
          <GiSettingsKnobs
            style={{
              width: isCompactSplitView ? 30 : 40,
              height: isCompactSplitView ? 30 : 40,
              borderColor: "black",
              color: "black",
            }}
          />
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "0 0 auto",
            height: isCompactSplitView ? 62 : 80,
            gap: 4,
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleGoToAdmin}
            style={{
              flex: isPsalmCategory(selectedCategory) ? "1 1 0" : "1 1 auto",
              minHeight: 0,
              fontSize: isCompactSplitView ? 14 : 18,
              fontWeight: 700,
              padding: isCompactSplitView ? "0 10px" : "0 16px",
              borderRadius: 12,
              border: mutedBorder,
              backgroundColor: surfaceBackground,
              color: textColor,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: isPsalmCategory(selectedCategory)
                ? undefined
                : isCompactSplitView
                ? 48
                : 52,
            }}
          >
            Admin
          </button>
          {isPsalmCategory(selectedCategory) && (
            <button
              onClick={() => void handleFillPsalmOnHome()}
              disabled={isFillingPsalm}
              style={{
                flex: "1 1 0",
                minHeight: 0,
                fontSize: isCompactSplitView ? 12 : 14,
                fontWeight: 700,
                padding: isCompactSplitView ? "0 8px" : "0 12px",
                borderRadius: 10,
                border: mutedBorder,
                backgroundColor: "#14532d",
                color: "#f8fafc",
                cursor: isFillingPsalm ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Naplni text zalmu z dnesnych liturgickych citani"
            >
              {isFillingPsalm ? "Nacitavam..." : "Napln zalm"}
            </button>
          )}
        </div>
      </div>

      <div
        id="contentBox"
        ref={contentBoxRef}
        style={{
          display: "flex",
          flexDirection: isSplitView ? "row" : "column",
          gap: isSplitView ? 0 : 10,
          flex: "1 1 auto",
          minHeight: 0,
          margin: 0,
          overflow: "hidden",
        }}
      >
        <div
          id="listBox"
          style={{
            padding: 0,
            flex: isSplitView ? `0 0 ${splitLeftWidthPercent}%` : "0 0 36%",
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
            borderRadius: 15,
            backgroundColor: surfaceBackground,
            color: textColor,
            border: mutedBorder,
          }}
        >
          <ul style={{ listStyleType: "none", padding: 0, margin: 8 }}>
            {filteredData?.map((item) => {
              const itemIdentity = getSongIdentity(item);
              const isSelected = selectedSongIdentity === itemIdentity;
              const isDraggingItem =
                dragSongIdentity !== null && dragSongIdentity === itemIdentity;
              const isInPlaylist =
                playlistMembershipByIdentity.has(itemIdentity);
              const categoryBadge = getCategoryBadge(item);

              return (
                <li
                  key={itemIdentity}
                  data-song-identity={itemIdentity}
                  onClick={() => handleClickSkokNaPiesen(item)}
                  style={{
                    padding: 0,
                    marginTop: "6px",
                    cursor: "pointer",
                    color: textColor,
                    borderRadius: 14,
                    backgroundColor: isSelected
                      ? activeTabBackground
                      : itemBackground,
                    listStylePosition: "inside",
                    border: isDraggingItem ? "3px dashed #3b82f6" : itemBorder,
                    opacity: isDraggingItem ? 0.75 : 1,
                    transform: isDraggingItem ? "scale(1.02)" : undefined,
                    transition: isDraggingItem
                      ? "none"
                      : "transform 0.15s ease, opacity 0.15s ease",
                    boxShadow: isDraggingItem
                      ? "0 6px 16px rgba(0,0,0,0.35)"
                      : undefined,
                    overflow: "hidden",
                    userSelect: isDraggingItem ? "none" : undefined,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "0 0 auto",
                        minWidth: 52,
                        padding: "0 12px",
                        fontSize: 28,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: isSelected ? "white" : textColor,
                      }}
                    >
                      {item.cisloP}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 4,
                        flex: "1 1 auto",
                        minWidth: 0,
                        padding: "9px 12px 10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            borderRadius: 999,
                            padding: "2px 7px",
                            border: "1px solid rgba(0,0,0,0.25)",
                            backgroundColor: isSelected ? "#ede9fe" : "#f1f5f9",
                            color: "#334155",
                            letterSpacing: "0.03em",
                          }}
                          title={`Kategoria: ${getSongCategory(item)}`}
                        >
                          {categoryBadge}
                        </span>
                        {isInPlaylist && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              borderRadius: 999,
                              padding: "2px 7px",
                              border: "1px solid rgba(0,0,0,0.25)",
                              backgroundColor: isSelected
                                ? "#dbeafe"
                                : "#dcfce7",
                              color: "#166534",
                              letterSpacing: "0.03em",
                            }}
                            title="Skladba je v playliste"
                          >
                            PL
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          textAlign: "start",
                          fontSize: 16,
                          fontWeight: 700,
                          lineHeight: 1.15,
                          width: "100%",
                          color: isSelected ? "white" : textColor,
                        }}
                        title={`${item.cisloP}. ${item.nazov}`}
                      >
                        {item.nazov}
                      </span>
                      {hasCustomVerseOrder(item) && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 999,
                            padding: "2px 8px",
                            border: "1px solid rgba(0,0,0,0.25)",
                            backgroundColor: isSelected ? "#dbeafe" : "#fef3c7",
                            color: "#7c2d12",
                            marginRight: 8,
                          }}
                          title="Skladba ma vlastne poradie sloh"
                        >
                          PORADIE
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flex: "0 0 auto",
                        width: 38,
                        padding: "6px 4px 6px 0",
                        gap: 2,
                      }}
                    >
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          togglePlaylistMembership(item);
                        }}
                        style={{
                          width: 28,
                          height: 26,
                          borderRadius: 8,
                          border: "1px solid rgba(0,0,0,0.25)",
                          backgroundColor: isInPlaylist
                            ? "#fee2e2"
                            : "rgba(255,255,255,0.4)",
                          color: isInPlaylist ? "#7f1d1d" : "#166534",
                          fontWeight: 900,
                          fontSize: 16,
                          lineHeight: "24px",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={
                          isInPlaylist
                            ? "Odobrat z playlistu"
                            : "Pridat do playlistu"
                        }
                      >
                        {isInPlaylist ? "-" : "+"}
                      </button>
                      <div
                        role="button"
                        aria-label="Presunúť pieseň v zozname"
                        title={
                          activePlaylistKey !== null
                            ? "Zatlač a potiahni pre zmenu poradia"
                            : "Pre zmenu poradia prepni do playlistu (PL)"
                        }
                        onPointerDown={(event) =>
                          handleDragHandlePointerDown(event, itemIdentity)
                        }
                        onClick={(event) => event.stopPropagation()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 24,
                          cursor: isDraggingItem ? "grabbing" : "grab",
                          touchAction: "none",
                          userSelect: "none",
                          color: isSelected ? "white" : textColor,
                          opacity: activePlaylistKey !== null ? 0.9 : 0.35,
                        }}
                      >
                        <RxDragHandleDots2 size={20} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {isSplitView && (
          <div
            onMouseDown={handleSplitDividerMouseDown}
            onTouchStart={handleSplitDividerTouchStart}
            style={{
              flex: "0 0 auto",
              width: 12,
              margin: "0 -1px",
              cursor: "col-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              touchAction: "none",
              zIndex: 1,
            }}
            title="Tahaj pre zmenu sirky zoznamu"
          >
            <div
              style={{
                width: 4,
                height: "40%",
                borderRadius: 2,
                backgroundColor: "var(--color-border)",
              }}
            />
          </div>
        )}

        <div
          id="previewBox"
          style={{
            flex: isSplitView ? "1 1 auto" : "1 1 58%",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: surfaceBackground,
            color: textColor,
            border: mutedBorder,
            borderRadius: 15,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderBottom: mutedBorder,
              backgroundColor: panelBackground,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: "0 0 auto",
                fontSize: isCompactSplitView ? 16 : 18,
                fontWeight: 900,
                padding: isCompactSplitView ? "14px 16px" : "16px 20px",
                borderRadius: 12,
                border: mutedBorder,
                backgroundColor: isProjectorBlackout
                  ? "#111827"
                  : "var(--color-input-bg)",
                color: isProjectorBlackout ? "#f9fafb" : textColor,
                cursor: "pointer",
                userSelect: "none",
              }}
              title="BLACK rezim drzi ciernu obrazovku, kym ho nevypnes"
            >
              <input
                type="checkbox"
                checked={isProjectorBlackout}
                onChange={(e) =>
                  handleProjectorBlackoutToggle(e.target.checked)
                }
                style={{
                  width: isCompactSplitView ? 22 : 26,
                  height: isCompactSplitView ? 22 : 26,
                  cursor: "pointer",
                }}
              />
              BLACK
            </label>

            <button
              onClick={handleOpenFullAkordy}
              disabled={!selectedSong}
              style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: "var(--color-input-bg)",
                border: mutedBorder,
                borderRadius: 12,
                color: textColor,
                textAlign: "left",
                fontSize: isCompactSplitView ? 18 : 22,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                padding: "8px 12px",
              }}
              title={selectedSong?.nazov ?? "Vyber skladbu"}
            >
              {selectedSong
                ? `${selectedSong.cisloP}. ${selectedSong.nazov}`
                : "Vyber skladbu zo zoznamu"}
            </button>

            <button
              type="button"
              onClick={() => void handleAdjustSelectedVerseFont(-1)}
              disabled={!selectedSong || isSavingVerseFont}
              style={{
                flex: "0 0 auto",
                borderRadius: 10,
                border: mutedBorder,
                backgroundColor: "var(--color-input-bg)",
                color: textColor,
                fontWeight: 800,
                fontSize: 16,
                padding: "8px 12px",
                cursor: "pointer",
                minWidth: 40,
              }}
              title="Zmensit pismo pre aktualnu slohu na DTP"
            >
              -
            </button>

            <span
              style={{
                flex: "0 0 auto",
                minWidth: 48,
                textAlign: "center",
                fontWeight: 800,
              }}
              title="Percento pre aktualnu slohu na DTP"
            >
              {selectedVerseMultiplierPercent}%
            </span>

            <button
              type="button"
              onClick={() => void handleAdjustSelectedVerseFont(1)}
              disabled={!selectedSong || isSavingVerseFont}
              style={{
                flex: "0 0 auto",
                borderRadius: 10,
                border: mutedBorder,
                backgroundColor: "var(--color-input-bg)",
                color: textColor,
                fontWeight: 800,
                fontSize: 16,
                padding: "8px 12px",
                cursor: "pointer",
                minWidth: 40,
              }}
              title="Zvacsit pismo pre aktualnu slohu na DTP"
            >
              +
            </button>

            {selectedSong && isPsalmCategory(getSongCategory(selectedSong)) && (
              <>
                <input
                  type="date"
                  value={liturgyDate}
                  onChange={(e) => setLiturgyDate(e.target.value)}
                  style={{
                    fontSize: isCompactSplitView ? 12 : 14,
                    fontWeight: 600,
                    padding: "7px 8px",
                    borderRadius: 12,
                    border: mutedBorder,
                    backgroundColor: "var(--color-input-bg)",
                    color: textColor,
                    cursor: "pointer",
                  }}
                  title="Datum liturgickych citani"
                />
                <button
                  onClick={() => void handleFillPsalmOnHome()}
                  disabled={isFillingPsalm}
                  style={{
                    fontSize: isCompactSplitView ? 13 : 15,
                    fontWeight: 700,
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: mutedBorder,
                    backgroundColor: "#14532d",
                    color: "#f8fafc",
                    cursor: "pointer",
                  }}
                  title="Naplni slohy zalmu z vybranych liturgickych citani"
                >
                  {isFillingPsalm ? "Nacitavam..." : "Naplnit zalm"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleOpenProjector}
              disabled={!selectedSong}
              aria-label={
                isProjectorConnected
                  ? "Projektor je online"
                  : "Projektor je offline"
              }
              style={{
                flex: "0 0 auto",
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "1px solid rgba(0,0,0,0.35)",
                backgroundColor: isProjectorConnected ? "#22c55e" : "#ef4444",
                padding: 0,
                cursor: "pointer",
              }}
              title={
                isProjectorConnected
                  ? "Projektor je online (klikni pre znovuodoslanie)"
                  : "Projektor je offline"
              }
            />

            <input
              type="checkbox"
              checked={isProjectorInfo}
              onChange={(e) => handleProjectorInfoToggle(e.target.checked)}
              style={{
                width: 22,
                height: 22,
                cursor: "pointer",
              }}
            />
          </div>

          {projectorFeedback && (
            <div
              style={{
                margin: "8px 10px 0",
                padding: "6px 10px",
                borderRadius: 10,
                border: `1px solid var(--color-border)`,
                backgroundColor:
                  projectorFeedback.tone === "ok"
                    ? "var(--color-success-bg)"
                    : "var(--color-warning-bg)",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {projectorFeedback.message}
            </div>
          )}

          {psalmFillFeedback && (
            <div
              style={{
                margin: projectorFeedback ? "6px 10px 0" : "8px 10px 0",
                padding: "6px 10px",
                borderRadius: 10,
                border: `1px solid var(--color-border)`,
                backgroundColor:
                  psalmFillFeedback.tone === "ok"
                    ? "var(--color-success-bg)"
                    : "var(--color-warning-bg)",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {psalmFillFeedback.message}
            </div>
          )}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "16px 10px 10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {selectedSong ? (
              <div
                style={{ margin: "auto 0", width: "100%", paddingTop: "8px" }}
              >
                <SongView
                  text={selectedSong.slohy[selectedVerse]?.textik ?? ""}
                  showChords={showAkordy}
                  zadanaVelkost={Math.min(
                    80,
                    Math.max(20, Number(fontSize) || 30),
                  )}
                  chordColor={homeChordColor}
                  chordSizeMultiplier={chordSizeMultiplier}
                />
              </div>
            ) : (
              <div
                style={{
                  color: mutedText,
                  fontSize: 24,
                  textAlign: "center",
                  margin: "auto 0",
                }}
              >
                Vyber skladbu zo zoznamu vlavo.
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "6px 10px 0",
            }}
          >
            <label
              htmlFor="verse-order-input"
              style={{ fontSize: 13, fontWeight: 700, color: textColor }}
            >
              Poradie sloh (napr. R, V1, R, V2)
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="verse-order-input"
                type="text"
                value={verseOrderInput}
                onChange={(e) => handleVerseOrderInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSaveVerseOrder();
                    return;
                  }

                  if (e.key === "Escape") {
                    e.preventDefault();
                    void handleClearVerseOrder();
                  }
                }}
                placeholder="Prazdne = povodne poradie"
                disabled={!selectedSong || isSavingVerseOrder}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: hasUnsavedVerseOrder
                    ? "2px solid #f59e0b"
                    : mutedBorder,
                  backgroundColor: "var(--color-input-bg)",
                  color: textColor,
                  fontSize: 14,
                  padding: "8px 120px 8px 10px",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  gap: 6,
                }}
              >
                <button
                  type="button"
                  onClick={handleSaveVerseOrder}
                  disabled={!selectedSong || isSavingVerseOrder}
                  style={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#dcfce7",
                    color: "#14532d",
                    fontWeight: 700,
                    fontSize: 12,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                  title="Ulozit poradie"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={handleClearVerseOrder}
                  disabled={!selectedSong || isSavingVerseOrder}
                  style={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#fee2e2",
                    color: "#7f1d1d",
                    fontWeight: 700,
                    fontSize: 12,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                  title="Vymazat poradie"
                >
                  CANCEL
                </button>
              </div>
            </div>
            {hasUnsavedVerseOrder && !isSavingVerseOrder && (
              <small style={{ color: "#b45309", fontWeight: 700 }}>
                Neulozena zmena. Enter = OK, Esc = CANCEL.
              </small>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "8px 10px 10px",
              borderTop: mutedBorder,
              backgroundColor: panelBackground,
              overflowX: "auto",
            }}
          >
            {(selectedSong?.slohy ?? []).map((verse, index) => (
              <button
                key={`${verse.cisloS}-${index}`}
                onClick={() => selectVerse(index)}
                style={{
                  flex: "1 0 110px",
                  minWidth: 110,
                  display: "flex",
                  alignItems: "stretch",
                  borderRadius: 12,
                  border: mutedBorder,
                  backgroundColor:
                    selectedVerse === index
                      ? activeTabBackground
                      : "var(--color-input-bg)",
                  color: selectedVerse === index ? "white" : textColor,
                  padding: 0,
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                title={verse.textik}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                    minWidth: 32,
                    padding: "0 8px",
                    fontSize: 22,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: selectedVerse === index ? "white" : textColor,
                  }}
                >
                  {verse.cisloS}
                </div>
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 6px",
                    fontSize: 16,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    opacity: 0.95,
                  }}
                >
                  {buildVersePreviewText(verse.textik ?? "", 18) ||
                    "(prazdna sloha)"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
const getStyles = (velkost: number) => ({
  button: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: velkost,
    width: (2 * velkost).toString() + "px",
    height: (2 * velkost).toString() + "px",
    padding: velkost / 3,
  },
});
