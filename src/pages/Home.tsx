import { useContext, useEffect, useMemo, useRef, useState } from "react";
//import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GiSettingsKnobs } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
//import { localData } from "../localData";

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
  updateSongOrderById,
  updateSongVerseFontMultiplierById,
} from "../api/supabaseSongs";

const ALL_CATEGORIES = "Vsetky";
const SEARCH_QUERY_STORAGE_KEY = "home.searchQuery";
const SELECTED_CATEGORY_STORAGE_KEY = "home.selectedCategory";
const SELECTED_PLAYLIST_FILTER_STORAGE_KEY = "home.selectedPlaylistFilter";
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
const PLAYLIST_KEYS = ["Playlist 1", "Playlist 2", "Playlist 3"] as const;

type PlaylistKey = (typeof PLAYLIST_KEYS)[number];
type PlaylistsState = Record<PlaylistKey, string[]>;

function createEmptyPlaylists(): PlaylistsState {
  return {
    "Playlist 1": [],
    "Playlist 2": [],
    "Playlist 3": [],
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
      "Playlist 2": normalizePlaylistValue(parsed?.["Playlist 2"]),
      "Playlist 3": normalizePlaylistValue(parsed?.["Playlist 3"]),
    };
  } catch {
    return createEmptyPlaylists();
  }
}

function getOfflineApiOrigin(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:3001`;
}

async function loadPlaylistsFromOfflineApi(): Promise<PlaylistsState> {
  const response = await fetch(`${getOfflineApiOrigin()}/api/playlists`);
  if (!response.ok) {
    throw new Error(`Offline playlist API chyba ${response.status}`);
  }

  const raw = (await response.json()) as Partial<Record<PlaylistKey, unknown>>;
  return {
    "Playlist 1": normalizePlaylistValue(raw?.["Playlist 1"]),
    "Playlist 2": normalizePlaylistValue(raw?.["Playlist 2"]),
    "Playlist 3": normalizePlaylistValue(raw?.["Playlist 3"]),
  };
}

async function savePlaylistsToOfflineApi(
  playlists: PlaylistsState,
): Promise<void> {
  const response = await fetch(`${getOfflineApiOrigin()}/api/playlists`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(playlists),
  });

  if (!response.ok) {
    throw new Error(`Offline playlist API chyba ${response.status}`);
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

function getSongCategory(song: Song): string {
  if (song.kategoria && song.kategoria.trim().length > 0) {
    return song.kategoria.trim();
  }

  if (song.source && /emanuel/i.test(song.source)) {
    return "Emanuel";
  }

  return "Nabozenske";
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
  const { fontSize, showAkordy, projectorFontSizeMultiplier } = useContext(
    SettingsContext,
  ) as SettingsContextType;
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
  const [selectedPlaylistEditor, setSelectedPlaylistEditor] =
    useState<PlaylistKey>("Playlist 1");
  const [dataMode, setDataMode] = useState<DataMode>(() => getDataMode());
  const [playlists, setPlaylists] = useState<PlaylistsState>(() =>
    loadPlaylistsFromStorage(),
  );
  const [playlistsReady, setPlaylistsReady] = useState(false);
  const [rightDragSongIdentity, setRightDragSongIdentity] = useState<
    string | null
  >(null);
  const [rightDragPlaylistKey, setRightDragPlaylistKey] =
    useState<PlaylistKey | null>(null);
  const [selectedSongIdentity, setSelectedSongIdentity] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedVerse, setSelectedVerse] = useState(0);
  const [selectedVerseCursor, setSelectedVerseCursor] = useState(0);
  const [verseOrderInput, setVerseOrderInput] = useState("");
  const [isSavingVerseOrder, setIsSavingVerseOrder] = useState(false);
  const [isSavingVerseFont, setIsSavingVerseFont] = useState(false);
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
  const applyingRemotePayloadRef = useRef(false);
  const lastSentSongIdRef = useRef<string | undefined>(undefined);
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
    const handleDataModeChanged = (event: Event) => {
      const nextMode = (event as CustomEvent<DataMode>).detail;
      if (nextMode === "online" || nextMode === "offline") {
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
        const fromApi = await loadPlaylistsFromOfflineApi();
        if (!cancelled) {
          setPlaylists(fromApi);
          setPlaylistsReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Offline playlists fallback to localStorage", error);
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

    savePlaylistsToOfflineApi(playlists).catch((error) => {
      console.warn("Offline playlists save failed", error);
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

      setIsProjectorBlackout(payload.blackout === true);

      const incomingSong = payload.song;
      if (!incomingSong) {
        return;
      }

      applyingRemotePayloadRef.current = true;

      const incomingSongId = getSongId(incomingSong);
      const resolvedSong =
        songsData.find((song) => {
          if (incomingSongId !== undefined) {
            return getSongId(song) === incomingSongId;
          }

          return isSameSong(song, incomingSong);
        }) ?? incomingSong;

      setSelectedSongIdentity(getSongIdentity(resolvedSong));
      setSelectedSong(resolvedSong);
      setVerseOrderInput(formatVerseOrderInput(resolvedSong));

      if (typeof payload.selectedView === "number") {
        const playbackOrder = buildVersePlaybackOrder(resolvedSong);
        const safeIndex = Math.max(
          0,
          Math.min(
            payload.selectedView,
            Math.max(0, resolvedSong.slohy.length - 1),
          ),
        );
        setSelectedVerseCursor((previousCursor) =>
          resolveVerseCursor(playbackOrder, safeIndex, previousCursor),
        );
        setSelectedVerse(safeIndex);
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribePayload();
    };
  }, [songsData]);

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
      "Playlist 2": 0,
      "Playlist 3": 0,
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

  const selectedSongIdentityValue = selectedSong
    ? getSongIdentity(selectedSong)
    : "";
  const playlistMembershipByIdentity = useMemo(() => {
    const membership = new Map<string, Set<string>>();

    PLAYLIST_KEYS.forEach((playlistKey, playlistIndex) => {
      const label = `P${playlistIndex + 1}`;
      const playlistEntries = playlists[playlistKey] ?? [];

      songsData.forEach((song) => {
        const matches = playlistEntries.some((entry) =>
          songMatchesPlaylistIdentity(song, entry),
        );
        if (!matches) {
          return;
        }

        const canonical = getSongIdentity(song);
        const current = membership.get(canonical) ?? new Set<string>();
        current.add(label);
        membership.set(canonical, current);
      });
    });

    const output = new Map<string, string[]>();
    membership.forEach((labels, songIdentity) => {
      output.set(songIdentity, Array.from(labels));
    });

    return output;
  }, [playlists, songsData]);
  const selectedEditorPlaylistSongs = playlists[selectedPlaylistEditor] ?? [];
  const selectedSongInEditorPlaylist =
    selectedSongIdentityValue.length > 0 &&
    selectedEditorPlaylistSongs.some((playlistIdentity) =>
      selectedSong
        ? songMatchesPlaylistIdentity(selectedSong, playlistIdentity)
        : false,
    );

  function addSelectedSongToPlaylist() {
    if (!selectedSongIdentityValue) {
      return;
    }

    setPlaylists((previous) => {
      const current = previous[selectedPlaylistEditor] ?? [];
      const nextSet = new Set(
        current.filter((item) =>
          selectedSong
            ? !songMatchesPlaylistIdentity(selectedSong, item)
            : true,
        ),
      );
      nextSet.add(selectedSongIdentityValue);
      return {
        ...previous,
        [selectedPlaylistEditor]: Array.from(nextSet),
      };
    });
  }

  function removeSelectedSongFromPlaylist() {
    if (!selectedSongIdentityValue) {
      return;
    }

    setPlaylists((previous) => ({
      ...previous,
      [selectedPlaylistEditor]: (previous[selectedPlaylistEditor] ?? []).filter(
        (item) =>
          selectedSong
            ? !songMatchesPlaylistIdentity(selectedSong, item)
            : true,
      ),
    }));
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

  function handlePlaylistRightMouseDown(
    event: React.MouseEvent,
    songIdentity: string,
  ) {
    if (event.button !== 2 || activePlaylistKey === null) {
      return;
    }

    event.preventDefault();
    setRightDragSongIdentity(songIdentity);
    setRightDragPlaylistKey(activePlaylistKey);
  }

  function handlePlaylistRightDragEnter(songIdentity: string) {
    if (!rightDragSongIdentity || !rightDragPlaylistKey) {
      return;
    }

    if (rightDragSongIdentity === songIdentity) {
      return;
    }

    reorderPlaylistBySongIdentity(
      rightDragPlaylistKey,
      rightDragSongIdentity,
      songIdentity,
    );
    setRightDragSongIdentity(songIdentity);
  }

  useEffect(() => {
    if (!rightDragSongIdentity) {
      return;
    }

    const finishDrag = () => {
      setRightDragSongIdentity(null);
      setRightDragPlaylistKey(null);
    };

    window.addEventListener("mouseup", finishDrag);
    return () => window.removeEventListener("mouseup", finishDrag);
  }, [rightDragSongIdentity]);

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
      const songId = getSongIdentity(selectedSong);
      const songChanged = lastSentSongIdRef.current !== songId;
      lastSentSongIdRef.current = songId;
      if (songChanged) {
        sendProjectorPayload({
          song: selectedSong,
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
      sendProjectorPayload({
        song: piesen,
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
      sendProjectorPayload({
        song: nextSong,
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
    sendProjectorPayload({
      song: selectedSong,
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
      sendProjectorPayload({
        song: selectedSong,
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

  function handleOpenFullAkordy() {
    if (!selectedSong) {
      return;
    }

    navigate("/akordy", { state: { song: selectedSong } });
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

  useEffect(() => {
    if (!isSplitView) {
      return;
    }

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
    isSplitView,
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
        <button
          onClick={handleGoToAdmin}
          style={{
            fontSize: isCompactSplitView ? 16 : 20,
            fontWeight: 700,
            padding: isCompactSplitView ? "0 12px" : "0 16px",
            borderRadius: 14,
            border: mutedBorder,
            backgroundColor: surfaceBackground,
            color: textColor,
            cursor: "pointer",
            height: isCompactSplitView ? 48 : undefined,
          }}
        >
          Admin
        </button>
      </div>

      <div
        id="filterBox"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          flex: "0 0 auto",
          margin: 0,
        }}
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            fontSize: 20,
            padding: "8px 12px",
            borderRadius: 10,
            border: mutedBorder,
            backgroundColor: panelBackground,
            color: textColor,
          }}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedPlaylistFilter}
          onChange={(e) => setSelectedPlaylistFilter(e.target.value)}
          style={{
            fontSize: 20,
            padding: "8px 12px",
            borderRadius: 10,
            border: mutedBorder,
            backgroundColor: panelBackground,
            color: textColor,
          }}
          title="Filter podla playlistu"
        >
          <option value={ALL_PLAYLISTS_FILTER}>{ALL_PLAYLISTS_FILTER}</option>
          {PLAYLIST_KEYS.map((key) => (
            <option key={key} value={key}>
              {key} ({playlistResolvedCounts[key]})
            </option>
          ))}
        </select>

        <select
          value={selectedPlaylistEditor}
          onChange={(e) =>
            setSelectedPlaylistEditor(e.target.value as PlaylistKey)
          }
          style={{
            fontSize: 16,
            padding: "8px 12px",
            borderRadius: 10,
            border: mutedBorder,
            backgroundColor: panelBackground,
            color: textColor,
          }}
          title="Playlist pre pridanie alebo odobratie skladby"
        >
          {PLAYLIST_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <button
          onClick={addSelectedSongToPlaylist}
          disabled={!selectedSong || selectedSongInEditorPlaylist}
          style={{
            fontSize: 16,
            fontWeight: 700,
            padding: "8px 12px",
            borderRadius: 10,
            border: mutedBorder,
            backgroundColor: "var(--color-input-bg)",
            color: textColor,
            cursor: "pointer",
          }}
          title="Pridat aktualne vybratu skladbu do playlistu"
        >
          + Do playlistu
        </button>

        <button
          onClick={removeSelectedSongFromPlaylist}
          disabled={!selectedSong || !selectedSongInEditorPlaylist}
          style={{
            fontSize: 16,
            fontWeight: 700,
            padding: "8px 12px",
            borderRadius: 10,
            border: mutedBorder,
            backgroundColor: "var(--color-input-bg)",
            color: textColor,
            cursor: "pointer",
          }}
          title="Odobrat aktualne vybratu skladbu z playlistu"
        >
          - Z playlistu
        </button>

        <span style={{ fontSize: 20, fontWeight: 700 }}>
          {filteredData.length} / {songsData.length}
        </span>

        {isSplitView && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: isCompactSplitView ? 14 : 16,
              fontWeight: 700,
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Sirka zoznamu: {splitLeftWidthPercent}%
              <input
                type="range"
                min={MIN_SPLIT_LEFT_WIDTH_PERCENT}
                max={MAX_SPLIT_LEFT_WIDTH_PERCENT}
                step={1}
                value={splitLeftWidthPercent}
                onChange={(e) =>
                  setSplitLeftWidthPercent(
                    clampSplitWidth(Number(e.target.value)),
                  )
                }
              />
            </label>

            <button
              type="button"
              onClick={() => void handleAdjustSelectedVerseFont(-1)}
              disabled={!selectedSong || isSavingVerseFont}
              style={{
                borderRadius: 10,
                border: mutedBorder,
                backgroundColor: "var(--color-input-bg)",
                color: textColor,
                fontWeight: 800,
                fontSize: 16,
                padding: "5px 10px",
                cursor: "pointer",
                minWidth: 40,
              }}
              title="Zmensit pismo pre aktualnu slohu na DTP"
            >
              -
            </button>

            <span
              style={{
                minWidth: 64,
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
                borderRadius: 10,
                border: mutedBorder,
                backgroundColor: "var(--color-input-bg)",
                color: textColor,
                fontWeight: 800,
                fontSize: 16,
                padding: "5px 10px",
                cursor: "pointer",
                minWidth: 40,
              }}
              title="Zvacsit pismo pre aktualnu slohu na DTP"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div
        id="contentBox"
        style={{
          display: "flex",
          flexDirection: isSplitView ? "row" : "column",
          gap: 10,
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
          <ul
            style={{ listStyleType: "none", padding: 0, margin: 8 }}
            onContextMenu={(event) => {
              if (activePlaylistKey !== null) {
                event.preventDefault();
              }
            }}
          >
            {filteredData?.map((item, index) => {
              const itemIdentity = getSongIdentity(item);
              const isSelected = selectedSongIdentity === itemIdentity;
              const isDraggingItem =
                rightDragSongIdentity !== null &&
                rightDragSongIdentity === itemIdentity;
              const playlistBadges =
                playlistMembershipByIdentity.get(itemIdentity) ?? [];
              const categoryBadge = getCategoryBadge(item);

              return (
                <li
                  key={`${itemIdentity}-${index}`}
                  onClick={() => handleClickSkokNaPiesen(item)}
                  onMouseDown={(event) =>
                    handlePlaylistRightMouseDown(event, itemIdentity)
                  }
                  onMouseEnter={() =>
                    handlePlaylistRightDragEnter(itemIdentity)
                  }
                  style={{
                    padding: 0,
                    marginTop: "6px",
                    cursor:
                      activePlaylistKey !== null
                        ? isDraggingItem
                          ? "grabbing"
                          : "grab"
                        : "pointer",
                    color: textColor,
                    borderRadius: 14,
                    backgroundColor: isSelected
                      ? activeTabBackground
                      : itemBackground,
                    listStylePosition: "inside",
                    border: itemBorder,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 4,
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
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 44,
                          padding: "4px 10px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          lineHeight: 1,
                          backgroundColor: isSelected
                            ? "rgba(255,255,255,0.22)"
                            : panelBackground,
                          color: isSelected ? "white" : textColor,
                        }}
                      >
                        {item.cisloP}
                      </span>
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
                      {playlistBadges.map((badge) => (
                        <span
                          key={`${itemIdentity}-${badge}`}
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            borderRadius: 999,
                            padding: "2px 7px",
                            border: "1px solid rgba(0,0,0,0.25)",
                            backgroundColor: isSelected ? "#dbeafe" : "#dcfce7",
                            color: "#166534",
                            letterSpacing: "0.03em",
                          }}
                          title={`Skladba je v ${badge}`}
                        >
                          {badge}
                        </span>
                      ))}
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
                </li>
              );
            })}
          </ul>
        </div>

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
              onClick={handleOpenProjector}
              disabled={!selectedSong}
              style={{
                fontSize: isCompactSplitView ? 14 : 16,
                fontWeight: 700,
                padding: "8px 12px",
                borderRadius: 12,
                border: mutedBorder,
                backgroundColor: isProjectorConnected ? "#8fd694" : "#f28b82",
                color: "black",
                cursor: "pointer",
              }}
              title={
                isProjectorConnected
                  ? "Projektor je online"
                  : "Projektor je offline"
              }
            >
              PROJ
            </button>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 10px",
                borderRadius: 12,
                border: mutedBorder,
                backgroundColor: isProjectorBlackout
                  ? "#111827"
                  : "var(--color-input-bg)",
                color: isProjectorBlackout ? "#f9fafb" : textColor,
                fontWeight: 800,
                fontSize: isCompactSplitView ? 12 : 13,
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
              />
              BLACK
            </label>
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

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectedSong ? (
              <SongView
                text={selectedSong.slohy[selectedVerse]?.textik ?? ""}
                showChords={showAkordy}
                zadanaVelkost={Math.min(
                  80,
                  Math.max(20, Number(fontSize) || 30),
                )}
              />
            ) : (
              <div
                style={{
                  color: mutedText,
                  fontSize: 24,
                  textAlign: "center",
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
                  flex: "1 0 70px",
                  minWidth: 70,
                  borderRadius: 12,
                  border: mutedBorder,
                  backgroundColor:
                    selectedVerse === index
                      ? activeTabBackground
                      : "var(--color-input-bg)",
                  color: selectedVerse === index ? "white" : textColor,
                  padding: "8px 6px",
                  cursor: "pointer",
                }}
                title={verse.textik}
              >
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.92 }}>
                  {verse.cisloS}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    opacity: 0.95,
                  }}
                >
                  {buildVersePreviewText(verse.textik ?? "", 30) ||
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
