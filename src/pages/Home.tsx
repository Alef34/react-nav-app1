import { useContext, useEffect, useMemo, useState } from "react";
//import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GiSettingsKnobs } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
//import { localData } from "../localData";

import { Song, SongsData } from "../types/myTypes";
import SongView from "../components/Song";
import { getSongs } from "../api/dataSources";
import { SettingsContext, SettingsContextType } from "../context/SettingsContext";
import {
  getProjectorChannelConnectionState,
  sendProjectorPayload,
  startProjectorChannel,
  subscribeProjectorConnectionState,
} from "../realtime/projectorChannel";
import { useVersionStore } from "../state/versionStore";
import { updateSongOrderByKey } from "../api/supabaseSongs";

const ALL_CATEGORIES = "Vsetky";
const SEARCH_QUERY_STORAGE_KEY = "home.searchQuery";
const SELECTED_CATEGORY_STORAGE_KEY = "home.selectedCategory";
const SPLIT_BREAKPOINT = 1100;
const SPLIT_LEFT_WIDTH_STORAGE_KEY = "home.splitLeftWidthPercent";
const DEFAULT_SPLIT_LEFT_WIDTH_PERCENT = 42;

function clampSplitWidth(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SPLIT_LEFT_WIDTH_PERCENT;
  }

  return Math.max(25, Math.min(65, Math.round(value)));
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

function normalizeSongNumber(value: string): string {
  return value.trim().replace(/\.$/, "").toLocaleLowerCase();
}

function parseCommaSeparatedQuery(query: string): string[] {
  return query
    .split(",")
    .map((part) => normalizeSongNumber(part))
    .filter((part) => part.length > 0);
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

function hasCustomVerseOrder(song: Song): boolean {
  return Array.isArray(song.poradieSloh) && song.poradieSloh.length > 0;
}

function normalizeVerseLabel(value: string): string {
  return value.trim().toLocaleLowerCase();
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

function getSongBoundaryState(song: Song, direction: -1 | 1): {
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
  const { fontSize, showAkordy } = useContext(SettingsContext) as SettingsContextType;
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem(SEARCH_QUERY_STORAGE_KEY) ?? "";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem(SELECTED_CATEGORY_STORAGE_KEY) ?? ALL_CATEGORIES;
  });
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedVerse, setSelectedVerse] = useState(0);
  const [selectedVerseCursor, setSelectedVerseCursor] = useState(0);
  const [verseOrderInput, setVerseOrderInput] = useState("");
  const [isSavingVerseOrder, setIsSavingVerseOrder] = useState(false);
  const [isSplitView, setIsSplitView] = useState(
    () => window.innerWidth >= SPLIT_BREAKPOINT,
  );
  const [splitLeftWidthPercent, setSplitLeftWidthPercent] = useState(() => {
    const stored = Number(localStorage.getItem(SPLIT_LEFT_WIDTH_STORAGE_KEY));
    return clampSplitWidth(stored);
  });
  const [isProjectorConnected, setIsProjectorConnected] = useState(false);
  const [isProjectorBlackout, setIsProjectorBlackout] = useState(false);
  const [projectorFeedback, setProjectorFeedback] = useState<{
    message: string;
    tone: "ok" | "warn";
  } | null>(null);
  const { verziaDb } = useVersionStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess } = useQuery({
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
      SPLIT_LEFT_WIDTH_STORAGE_KEY,
      String(splitLeftWidthPercent),
    );
  }, [splitLeftWidthPercent]);

  useEffect(() => {
    if (categories.includes(selectedCategory)) {
      return;
    }

    setSelectedCategory(ALL_CATEGORIES);
  }, [categories, selectedCategory]);

  useEffect(() => {
    const onResize = () => {
      setIsSplitView(window.innerWidth >= SPLIT_BREAKPOINT);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    startProjectorChannel("controller");
    setIsProjectorConnected(getProjectorChannelConnectionState());
    const unsubscribe = subscribeProjectorConnectionState((connected) => {
      setIsProjectorConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  function contains(song: Song, formatedQuery: string): boolean {
    return (
      song.cisloP.toLowerCase().includes(formatedQuery?.toLowerCase()) ||
      song.nazov.toLowerCase().includes(formatedQuery?.toLowerCase())
    );
  }

  const filteredData: SongsData = useMemo(() => {
    const formattedQuery = searchQuery.toLocaleLowerCase().trim();
    const commaSeparatedTerms = parseCommaSeparatedQuery(formattedQuery);
    const shouldUseCommaFilter =
      formattedQuery.includes(",") && commaSeparatedTerms.length > 0;
    const normalizedSelectedCategory = normalizeCategory(selectedCategory);

    return songsData.filter((song) => {
      const normalizedSongNumber = normalizeSongNumber(song.cisloP);
      const songTitleLower = song.nazov.toLocaleLowerCase();
      const queryMatch = shouldUseCommaFilter
        ? commaSeparatedTerms.some(
            (term) =>
              normalizedSongNumber === term || songTitleLower.includes(term),
          )
        : contains(song, formattedQuery);
      const normalizedSongCategory = normalizeCategory(getSongCategory(song));
      const categoryMatch =
        selectedCategory === ALL_CATEGORIES ||
        normalizedSongCategory === normalizedSelectedCategory;

      return queryMatch && categoryMatch;
    });
  }, [songsData, searchQuery, selectedCategory]);

  useEffect(() => {
    if (filteredData.length === 0) {
      setSelectedSong(null);
      setSelectedItem("");
      setSelectedVerse(0);
      setSelectedVerseCursor(0);
      setVerseOrderInput("");
      return;
    }

    const selectedInFiltered = filteredData.find(
      (song) => song.cisloP === selectedItem,
    );

    if (selectedInFiltered) {
      setSelectedSong(selectedInFiltered);
      setVerseOrderInput(formatVerseOrderInput(selectedInFiltered));
      return;
    }

    const firstSong = filteredData[0];
    setSelectedSong(firstSong);
    setSelectedItem(firstSong.cisloP);
    setSelectedVerse(0);
    setSelectedVerseCursor(0);
    setVerseOrderInput(formatVerseOrderInput(firstSong));
  }, [filteredData, selectedItem]);

  useEffect(() => {
    if (!selectedSong || selectedSong.slohy.length === 0) {
      return;
    }

    const nextVerse = Math.max(0, Math.min(selectedVerse, selectedSong.slohy.length - 1));
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
      sendProjectorPayload({
        song: selectedSong,
        selectedView: selectedVerse,
        showAkordy,
        blackout: false,
      });
    }
  }, [selectedSong, selectedVerse, selectedVerseCursor, showAkordy, isProjectorBlackout]);

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
    setSelectedItem("");
  }

  const handleClickSkokNaPiesen = (item: Song) => {
    setSelectedItem(item.cisloP);
    const piesen: Song = {
      cisloP: item.cisloP,
      nazov: item.nazov,
      slohy: item.slohy,
      source: item.source,
      kategoria: item.kategoria,
      poradieSloh: item.poradieSloh,
    };
    setSelectedSong(piesen);
    setSelectedVerse(0);
    setSelectedVerseCursor(0);
    setVerseOrderInput(formatVerseOrderInput(piesen));

    if (!isSplitView) {
      navigate("/akordy", { state: { song: piesen } });
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

    const currentSongIndex = filteredData.findIndex(
      (song) =>
        song.cisloP === selectedSong.cisloP && song.nazov === selectedSong.nazov,
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
    setSelectedItem(nextSong.cisloP);
    setSelectedSong(nextSong);
    setSelectedVerse(boundary.verseIndex);
    setSelectedVerseCursor(boundary.cursor);
    setVerseOrderInput(formatVerseOrderInput(nextSong));
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
        : { message: "Projektor server nie je dostupny.", tone: "warn" },
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
          : { message: "Projektor server nie je dostupny.", tone: "warn" },
      );
    } else if (selectedSong) {
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
    const nextCursor = resolveVerseCursor(playbackOrder, selectedVerse, selectedVerseCursor);

    setSelectedSong(nextSong);
    setSelectedVerseCursor(nextCursor);
  }

  function updateSongOrderInCache(order?: string[]) {
    if (!selectedSong) {
      return;
    }

    queryClient.setQueryData<SongsData | undefined>(
      ["songs", verziaDb],
      (previous) => {
        if (!previous) {
          return previous;
        }

        return previous.map((song) => {
          if (
            song.cisloP !== selectedSong.cisloP ||
            song.nazov !== selectedSong.nazov
          ) {
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

  async function handleSaveVerseOrder() {
    if (!selectedSong || isSavingVerseOrder) {
      return;
    }

    const parsed = parseVerseOrderInput(verseOrderInput);

    setIsSavingVerseOrder(true);
    try {
      await updateSongOrderByKey(
        selectedSong.cisloP,
        selectedSong.nazov,
        parsed.length > 0 ? parsed : undefined,
      );

      applyVerseOrderLocally(parsed);
      updateSongOrderInCache(parsed);
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

    setVerseOrderInput("");
    setIsSavingVerseOrder(true);
    try {
      await updateSongOrderByKey(selectedSong.cisloP, selectedSong.nazov, undefined);
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

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        if (selectedSong && selectedSong.slohy.length > 0) {
          event.preventDefault();
          moveVerse(1);
        }
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        if (selectedSong && selectedSong.slohy.length > 0) {
          event.preventDefault();
          moveVerse(-1);
        }
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const currentIndex = selectedSong
          ? filteredData.findIndex((s) => s.cisloP === selectedSong.cisloP)
          : -1;
        const step = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(filteredData.length - 1, currentIndex + step));
        const nextSong = filteredData[nextIndex];
        if (nextSong && nextSong.cisloP !== selectedSong?.cisloP) {
          setSelectedItem(nextSong.cisloP);
          setSelectedSong(nextSong);
          setSelectedVerse(0);
          setSelectedVerseCursor(0);
          setVerseOrderInput(formatVerseOrderInput(nextSong));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSplitView, selectedSong, selectedVerse, selectedVerseCursor, filteredData]);

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
  const savedVerseOrderInput = formatVerseOrderInput(selectedSong);
  const hasUnsavedVerseOrder =
    normalizeOrderSignatureFromRaw(verseOrderInput) !==
    normalizeOrderSignatureFromRaw(savedVerseOrderInput);

  if (isLoading) {
    return (
      <div style={{ padding: 24, fontSize: 22, color: "#111827", backgroundColor: "#eceff3", minHeight: "100svh" }}>
        Loading...
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div style={{ padding: 24, fontSize: 22, color: "#7f1d1d", backgroundColor: "#fee2e2", minHeight: "100svh" }}>
        Error loading data
      </div>
    );
  }

  return (
    <div
      id="container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100svh",
        minHeight: "100svh",
        overflow: "hidden",
        padding: 0,
        margin: 0,
        paddingTop: "20px",
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
          margin: 10, // Prispôsob vzhľad podľa potreby
          padding: 0,
          flexDirection: "row",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 auto", minWidth: 0 }}>
          <input
            type="text"
            style={{
              fontSize: 30,
              width: "100%",
              height: 80,
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
        <button onClick={handleShowSetting} style={getStyles(40).button}>
          <GiSettingsKnobs
            style={{
              width: 40,
              height: 40,
              borderColor: "black",
              color: "black",
            }}
          />
        </button>
        <button
          onClick={handleGoToAdmin}
          style={{
            fontSize: 20,
            fontWeight: 700,
            padding: "0 16px",
            borderRadius: 14,
            border: mutedBorder,
            backgroundColor: surfaceBackground,
            color: textColor,
            cursor: "pointer",
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
          marginLeft: 10,
          marginRight: 10,
          marginTop: 0,
          marginBottom: 10,
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

        <span style={{ fontSize: 20, fontWeight: 700 }}>
          {filteredData.length} / {songsData.length}
        </span>

        {isSplitView && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Sirka zoznamu: {splitLeftWidthPercent}%
            <input
              type="range"
              min={25}
              max={65}
              step={1}
              value={splitLeftWidthPercent}
              onChange={(e) =>
                setSplitLeftWidthPercent(clampSplitWidth(Number(e.target.value)))
              }
            />
          </label>
        )}
      </div>

      <div
        id="contentBox"
        style={{
          display: "flex",
          flexDirection: isSplitView ? "row" : "column",
          gap: 10,
          flexGrow: 1,
          minHeight: 0,
          margin: 10,
          marginTop: 0,
        }}
      >
        <div
          id="listBox"
          style={{
            padding: 0,
            flex: isSplitView
              ? `0 0 ${splitLeftWidthPercent}%`
              : "1 1 auto",
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
            {filteredData?.map((item, index) => (
              <li
                key={`${item.cisloP}-${item.nazov}-${index}`}
                onClick={() => handleClickSkokNaPiesen(item)}
                style={{
                  fontSize: 25,
                  padding: "1px",
                  marginTop: "5px",
                  cursor: "pointer",
                  color: textColor,
                  borderRadius: 15,
                  backgroundColor:
                    selectedItem === item.cisloP
                      ? activeTabBackground
                      : itemBackground,
                  listStylePosition: "inside",
                  border: itemBorder,
                }}
              >
                <div
                  style={{
                    textAlign: "start",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ margin: 5, color: selectedItem === item.cisloP ? "white" : textColor }}>
                    {item.cisloP}. {item.nazov}
                  </span>
                  {hasCustomVerseOrder(item) && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 999,
                        padding: "2px 8px",
                        border: "1px solid rgba(0,0,0,0.25)",
                        backgroundColor: selectedItem === item.cisloP ? "#dbeafe" : "#fef3c7",
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
            ))}
          </ul>
        </div>

        {isSplitView && (
          <div
            id="previewBox"
            style={{
              flex: "1 1 auto",
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
                  fontSize: 22,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  padding: "8px 12px",
                }}
                title={selectedSong?.nazov ?? "Vyber skladbu"}
              >
                {selectedSong ? `${selectedSong.cisloP}. ${selectedSong.nazov}` : "Vyber skladbu zo zoznamu"}
              </button>
              <button
                onClick={handleOpenProjector}
                disabled={!selectedSong}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: mutedBorder,
                  backgroundColor: isProjectorConnected ? "#8fd694" : "#f28b82",
                  color: "black",
                  cursor: "pointer",
                }}
                title={isProjectorConnected ? "Projektor je online" : "Projektor je offline"}
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
                  backgroundColor: isProjectorBlackout ? "#111827" : "var(--color-input-bg)",
                  color: isProjectorBlackout ? "#f9fafb" : textColor,
                  fontWeight: 800,
                  fontSize: 13,
                  userSelect: "none",
                }}
                title="BLACK rezim drzi ciernu obrazovku, kym ho nevypnes"
              >
                <input
                  type="checkbox"
                  checked={isProjectorBlackout}
                  onChange={(e) => handleProjectorBlackoutToggle(e.target.checked)}
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
                    projectorFeedback.tone === "ok" ? "var(--color-success-bg)" : "var(--color-warning-bg)",
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
                  zadanaVelkost={Math.min(80, Math.max(20, Number(fontSize) || 30))}
                />
              ) : (
                <div style={{ color: mutedText, fontSize: 24, textAlign: "center" }}>
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
                      selectedVerse === index ? activeTabBackground : "var(--color-input-bg)",
                    color: selectedVerse === index ? "white" : textColor,
                    fontSize: 20,
                    fontWeight: 700,
                    padding: "8px 6px",
                    cursor: "pointer",
                  }}
                >
                  {verse.cisloS}
                </button>
              ))}
            </div>
          </div>
        )}
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
