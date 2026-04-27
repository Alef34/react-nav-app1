import { useLocation, useNavigate } from "react-router-dom";
import SongRenderer from "../components/Song";
import { useContext, useEffect, useRef, useState } from "react";
import {
  SettingsContext,
  SettingsContextType,
} from "../context/SettingsContext";
import { Song as SongType, SongVerse } from "../types/myTypes";
import { GiSettingsKnobs } from "react-icons/gi";
import {
  getProjectorClientId,
  getProjectorChannelConnectionState,
  sendProjectorPayload,
  subscribeProjectorConnectionState,
  subscribeProjectorPayload,
  startProjectorChannel,
} from "../realtime/projectorChannel";
import { updateSongOrderById } from "../api/supabaseSongs";

function normalizeVerseLabel(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function buildVersePlaybackOrder(song: SongType | null | undefined): number[] {
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

function parseVerseOrderInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function formatVerseOrderInput(song: SongType | null | undefined): string {
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

function getSongId(song: SongType | null | undefined): number | undefined {
  if (!song) {
    return undefined;
  }

  const parsed = Number(song.id);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.trunc(parsed);
}

export default function Akordy1() {
  const location = useLocation();
  const navigate = useNavigate();

  const { fontSize, showAkordy } = useContext(
    SettingsContext,
  ) as SettingsContextType;
  const piesenka = location.state?.song as SongType | undefined;
  const [activeSong, setActiveSong] = useState<SongType | null>(
    piesenka ?? null,
  );

  const [selectedView, setSelectedView] = useState(0);
  const [selectedViewCursor, setSelectedViewCursor] = useState(0);
  const [verseOrderInput, setVerseOrderInput] = useState(() =>
    formatVerseOrderInput(piesenka),
  );
  const [isSavingVerseOrder, setIsSavingVerseOrder] = useState(false);
  const effectiveFontSize = Math.min(80, Math.max(20, Number(fontSize) || 30));
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isProjectorConnected, setIsProjectorConnected] = useState(false);
  const [isProjectorBlackout, setIsProjectorBlackout] = useState(false);
  const applyingRemotePayloadRef = useRef(false);
  const lastSentSongIdRef = useRef<string | undefined>(undefined);
  const [projectorFeedback, setProjectorFeedback] = useState<{
    message: string;
    tone: "ok" | "warn";
  } | null>(null);

  useEffect(() => {
    setActiveSong(piesenka ?? null);
    setSelectedView(0);
    setSelectedViewCursor(0);
    setVerseOrderInput(formatVerseOrderInput(piesenka));
  }, [piesenka?.cisloP]);

  useEffect(() => {
    let rafId: number | null = null;
    let timerId: number | null = null;

    const readSize = () => {
      // clientWidth/Height je na iOS spoľahlivejší ako innerWidth/Height
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      setWindowSize({ width: w, height: h });
      rafId = null;
    };

    const update = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(readSize);
    };

    const updateAfterRotation = () => {
      update();
      // iOS potrebuje ~300ms po orientationchange kým správne nahlási rozmery
      if (timerId != null) clearTimeout(timerId);
      timerId = window.setTimeout(readSize, 350);
    };

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", updateAfterRotation);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      if (timerId != null) clearTimeout(timerId);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", updateAfterRotation);
      window.visualViewport?.removeEventListener("resize", update);
    };
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

      setActiveSong(incomingSong);
      setVerseOrderInput(formatVerseOrderInput(incomingSong));

      if (typeof payload.selectedView === "number") {
        const playbackOrder = buildVersePlaybackOrder(incomingSong);
        const safeIndex = Math.max(
          0,
          Math.min(
            payload.selectedView,
            Math.max(0, incomingSong.slohy.length - 1),
          ),
        );
        setSelectedViewCursor((previousCursor) =>
          resolveVerseCursor(playbackOrder, safeIndex, previousCursor),
        );
        setSelectedView(safeIndex);
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribePayload();
    };
  }, []);

  const { width, height } = windowSize;

  // Layout výšok: CSS dvh reťazce — vždy správne aj po rotácii bez čakania na JS
  const HEADER_DVH = "9dvh";
  const SLOHY_DVH = "13dvh";

  // Tlačidlá – pevná veľkosť, škáluje len font skladby a badge
  const btnSize = 40;

  // Font pre text skladby – JS, škáluje od nastavenia
  const responsiveScale = Math.min(
    1.6,
    Math.max(0.7, Math.min(width / 1280, height / 900)),
  );
  const responsiveSongSize = Math.min(
    90,
    Math.max(16, Math.round(effectiveFontSize * responsiveScale)),
  );
  const responsiveHeaderSize = Math.min(
    34,
    Math.max(14, Math.round(height * 0.038)),
  );
  const pageBackground = "var(--color-page-bg)";
  const surfaceBackground = "var(--color-surface-bg)";
  const panelBackground = "var(--color-panel-bg)";
  const textColor = "var(--color-text)";
  const activeTabBackground = "var(--color-active-tab-bg)";
  const borderColor = "var(--color-border)";

  function handleSettings() {
    navigate("modal", {
      state: { background: location, song: piesenka },
    });
  }

  function handleBackToList() {
    navigate("/");
  }

  function handleOpenProjector() {
    if (!activeSong) {
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

    lastSentSongIdRef.current = activeSong.cisloP + "|" + activeSong.nazov;
    sendProjectorPayload({
      song: activeSong,
      selectedView,
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
    } else {
      if (activeSong) {
        lastSentSongIdRef.current = activeSong.cisloP + "|" + activeSong.nazov;
        sendProjectorPayload({
          song: activeSong,
          selectedView,
          showAkordy,
          blackout: false,
        });
      } else {
        sendProjectorPayload({ blackout: false });
      }
      setProjectorFeedback({ message: "BLACK rezim vypnuty.", tone: "ok" });
    }

    window.setTimeout(() => {
      setProjectorFeedback(null);
    }, 2200);
  }

  function selectVerse(index: number) {
    if (!activeSong || activeSong.slohy.length === 0) {
      return;
    }

    const lastIndex = activeSong.slohy.length - 1;
    const nextIndex = Math.max(0, Math.min(index, lastIndex));
    const playbackOrder = buildVersePlaybackOrder(activeSong);
    const nextCursor = resolveVerseCursor(
      playbackOrder,
      nextIndex,
      selectedViewCursor,
    );

    setSelectedViewCursor(nextCursor);
    setSelectedView(nextIndex);
    if (!isProjectorBlackout) {
      sendProjectorPayload({ selectedView: nextIndex, blackout: false });
    }
  }

  function moveVerse(step: -1 | 1) {
    if (!activeSong || activeSong.slohy.length === 0) {
      return;
    }

    const playbackOrder = buildVersePlaybackOrder(activeSong);
    if (playbackOrder.length === 0) {
      return;
    }

    const currentCursor = resolveVerseCursor(
      playbackOrder,
      selectedView,
      selectedViewCursor,
    );
    const nextCursor =
      (currentCursor + step + playbackOrder.length) % playbackOrder.length;
    const nextVerseIndex = playbackOrder[nextCursor];

    setSelectedViewCursor(nextCursor);
    setSelectedView(nextVerseIndex);
    if (!isProjectorBlackout) {
      sendProjectorPayload({ selectedView: nextVerseIndex, blackout: false });
    }
  }

  function applyVerseOrderLocally(order?: string[]) {
    if (!activeSong) {
      return;
    }

    const nextSong: SongType = {
      ...activeSong,
      poradieSloh: order && order.length > 0 ? order : undefined,
    };

    const playbackOrder = buildVersePlaybackOrder(nextSong);
    const nextCursor = resolveVerseCursor(
      playbackOrder,
      selectedView,
      selectedViewCursor,
    );

    setActiveSong(nextSong);
    setSelectedViewCursor(nextCursor);
  }

  async function handleSaveVerseOrder() {
    if (!activeSong || isSavingVerseOrder) {
      return;
    }

    const songId = getSongId(activeSong);
    if (songId === undefined) {
      console.error("Ukladanie poradia zlyhalo: skladba nema stabilne id.");
      setProjectorFeedback({
        message: "Ukladanie poradia zlyhalo: skladba nema ID.",
        tone: "warn",
      });
      window.setTimeout(() => {
        setProjectorFeedback(null);
      }, 2200);
      return;
    }

    const parsedOrder = parseVerseOrderInput(verseOrderInput);
    setIsSavingVerseOrder(true);
    try {
      await updateSongOrderById(
        songId,
        parsedOrder.length > 0 ? parsedOrder : undefined,
      );
      applyVerseOrderLocally(parsedOrder);

      // Resetujeme input aby sa ukaze aktualne poradie z DB
      const savedSong: SongType = {
        ...activeSong,
        poradieSloh: parsedOrder.length > 0 ? parsedOrder : undefined,
      };
      setVerseOrderInput(formatVerseOrderInput(savedSong));

      setProjectorFeedback({
        message: "Poradie sloh bolo ulozene.",
        tone: "ok",
      });
    } catch (error) {
      console.error("Ukladanie poradia zlyhalo:", error);
      setProjectorFeedback({
        message: "Ukladanie poradia zlyhalo.",
        tone: "warn",
      });
    } finally {
      setIsSavingVerseOrder(false);
      window.setTimeout(() => {
        setProjectorFeedback(null);
      }, 2200);
    }
  }

  async function handleClearVerseOrder() {
    if (!activeSong || isSavingVerseOrder) {
      return;
    }

    const songId = getSongId(activeSong);
    if (songId === undefined) {
      console.error("Mazanie poradia zlyhalo: skladba nema stabilne id.");
      setProjectorFeedback({
        message: "Mazanie poradia zlyhalo: skladba nema ID.",
        tone: "warn",
      });
      window.setTimeout(() => {
        setProjectorFeedback(null);
      }, 2200);
      return;
    }

    setVerseOrderInput("");
    setIsSavingVerseOrder(true);
    try {
      await updateSongOrderById(songId, undefined);
      applyVerseOrderLocally(undefined);
      setProjectorFeedback({
        message: "Poradie sloh bolo vymazane.",
        tone: "ok",
      });
    } catch (error) {
      console.error("Mazanie poradia zlyhalo:", error);
      setProjectorFeedback({
        message: "Mazanie poradia zlyhalo.",
        tone: "warn",
      });
    } finally {
      setIsSavingVerseOrder(false);
      window.setTimeout(() => {
        setProjectorFeedback(null);
      }, 2200);
    }
  }

  useEffect(() => {
    if (!activeSong) return;

    if (applyingRemotePayloadRef.current) {
      applyingRemotePayloadRef.current = false;
      return;
    }

    if (!isProjectorBlackout) {
      const songId = activeSong.cisloP + "|" + activeSong.nazov;
      const songChanged = lastSentSongIdRef.current !== songId;
      lastSentSongIdRef.current = songId;
      if (songChanged) {
        sendProjectorPayload({
          song: activeSong,
          selectedView,
          showAkordy,
          blackout: false,
        });
      } else {
        sendProjectorPayload({ selectedView, blackout: false });
      }
    }
  }, [activeSong, selectedView, showAkordy, isProjectorBlackout]);

  useEffect(() => {
    if (!activeSong || activeSong.slohy.length === 0) {
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

    const handleKeyDown = (event: KeyboardEvent) => {
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
        event.preventDefault();
        moveVerse(1);
        return;
      }

      if (
        event.key === "ArrowLeft" ||
        event.key === "PageUp" ||
        normalizedKey === "a"
      ) {
        event.preventDefault();
        moveVerse(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeSong,
    selectedView,
    selectedViewCursor,
    showAkordy,
    isProjectorBlackout,
  ]);

  const savedVerseOrderInput = formatVerseOrderInput(activeSong);
  const hasUnsavedVerseOrder =
    normalizeOrderSignatureFromRaw(verseOrderInput) !==
    normalizeOrderSignatureFromRaw(savedVerseOrderInput);

  return (
    <div
      id="container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
        padding: 0,
        margin: 0,
        color: textColor,
        backgroundColor: pageBackground,
        boxSizing: "border-box",
      }}
    >
      {/* HLAVIČKA */}
      <div
        id="nadpis-container"
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          height: HEADER_DVH,
          gap: 6,
          padding: "4px 10px",
          boxSizing: "border-box",
        }}
      >
        <button
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: panelBackground,
            border: `1px solid ${borderColor}`,
            borderRadius: 15,
            color: textColor,
            textAlign: "left",
            fontSize: responsiveHeaderSize,
            fontWeight: "bold",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            padding: "0 12px",
          }}
          onClick={handleBackToList}
          title="Spat na zoznam skladieb"
        >
          {activeSong?.nazov ?? "Skladba"}
        </button>
        <button
          style={{
            ...getStyles(btnSize).button,
            backgroundColor: isProjectorConnected ? "#8fd694" : "#f28b82",
            border: `1px solid ${borderColor}`,
            fontWeight: "bold",
            fontSize: Math.round(btnSize * 0.55),
            color: "black",
          }}
          onClick={handleOpenProjector}
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
            ...getStyles(btnSize).button,
            width: "auto",
            minWidth: Math.round(btnSize * 2.2),
            padding: "0 8px",
            backgroundColor: isProjectorBlackout ? "#111827" : panelBackground,
            border: `1px solid ${borderColor}`,
            color: isProjectorBlackout ? "#f9fafb" : textColor,
            fontSize: Math.round(btnSize * 0.34),
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
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
        <button
          style={{
            ...getStyles(btnSize).button,
            backgroundColor: panelBackground,
            border: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleSettings}
          title="Nastavenia"
        >
          <GiSettingsKnobs size={Math.round(btnSize * 0.68)} color="black" />
        </button>
      </div>

      {/* FEEDBACK TOAST */}
      {projectorFeedback && (
        <div
          style={{
            flexShrink: 0,
            margin: "4px 10px",
            padding: "6px 10px",
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
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
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          margin: "0 10px",
        }}
      >
        <label
          htmlFor="akordy-verse-order-input"
          style={{ fontSize: 13, fontWeight: 700, color: textColor }}
        >
          Poradie sloh (napr. R, V1, R, V2)
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="akordy-verse-order-input"
            type="text"
            value={verseOrderInput}
            onChange={(e) => setVerseOrderInput(e.target.value)}
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
            disabled={!activeSong || isSavingVerseOrder}
            style={{
              width: "100%",
              borderRadius: 10,
              border: hasUnsavedVerseOrder
                ? "2px solid #f59e0b"
                : `1px solid ${borderColor}`,
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
              disabled={!activeSong || isSavingVerseOrder}
              style={{
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
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
              disabled={!activeSong || isSavingVerseOrder}
              style={{
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
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

      {/* TEXT SKLADBY */}
      <div
        id="listBox"
        style={{
          flex: 1,
          minHeight: 0, // kľúčové pre flex overflow na mobile/tablet
          overflowY: "auto",
          margin: "6px 10px",
          borderRadius: 15,
          border: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: surfaceBackground,
          color: textColor,
          boxSizing: "border-box",
        }}
      >
        {activeSong ? (
          <SongRenderer
            text={activeSong.slohy[selectedView]?.textik ?? ""}
            showChords={showAkordy}
            zadanaVelkost={responsiveSongSize}
          />
        ) : null}
      </div>

      {/* LIŠTA SLÔH */}
      <div
        id="slohy-container"
        style={{
          flexShrink: 0,
          height: SLOHY_DVH,
          display: "flex",
          flexDirection: "row",
          gap: 4,
          margin: "0 10px 8px",
          boxSizing: "border-box",
        }}
      >
        {activeSong?.slohy.map(function (sloha: SongVerse, i: number) {
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${borderColor}`,
                borderRadius: 15,
                cursor: "pointer",
                backgroundColor:
                  selectedView === i ? activeTabBackground : panelBackground,
                color: selectedView === i ? "white" : textColor,
                flexDirection: "column",
                gap: 2,
                padding: "4px 6px",
                overflow: "hidden",
              }}
              title={sloha.textik}
              onClick={() => {
                selectVerse(i);
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.92 }}>
                {sloha.cisloS}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {buildVersePreviewText(sloha.textik ?? "", 30) ||
                  "(prazdna sloha)"}
              </span>
            </div>
          );
        })}
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
