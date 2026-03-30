import { useLocation, useNavigate } from "react-router-dom";
import SongRenderer from "../components/Song";
import { useContext, useEffect, useState } from "react";
import {
  SettingsContext,
  SettingsContextType,
} from "../context/SettingsContext";
import { Song as SongType, SongVerse } from "../types/myTypes";
import { GiSettingsKnobs } from "react-icons/gi";
import {
  getProjectorChannelConnectionState,
  sendProjectorPayload,
  subscribeProjectorConnectionState,
  startProjectorChannel,
} from "../realtime/projectorChannel";

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

export default function Akordy1() {
  const location = useLocation();
  const navigate = useNavigate();

  const { fontSize, showAkordy } = useContext(
    SettingsContext,
  ) as SettingsContextType;
  const piesenka = location.state?.song;

  const [selectedView, setSelectedView] = useState(0);
  const [selectedViewCursor, setSelectedViewCursor] = useState(0);
  const effectiveFontSize = Math.min(80, Math.max(20, Number(fontSize) || 30));
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isProjectorConnected, setIsProjectorConnected] = useState(false);
  const [isProjectorBlackout, setIsProjectorBlackout] = useState(false);
  const [projectorFeedback, setProjectorFeedback] = useState<{
    message: string;
    tone: "ok" | "warn";
  } | null>(null);

  useEffect(() => {
    setSelectedView(0);
    setSelectedViewCursor(0);
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

    setIsProjectorConnected(getProjectorChannelConnectionState());
    const unsubscribe = subscribeProjectorConnectionState((connected) => {
      setIsProjectorConnected(connected);
    });

    return () => unsubscribe();
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
  const responsiveVerseBadge = Math.min(
    44,
    Math.max(14, Math.round(height * 0.055)),
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
      song: piesenka,
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
      sendProjectorPayload({
        song: piesenka,
        selectedView,
        showAkordy,
        blackout: false,
      });
      setProjectorFeedback({ message: "BLACK rezim vypnuty.", tone: "ok" });
    }

    window.setTimeout(() => {
      setProjectorFeedback(null);
    }, 2200);
  }

  function selectVerse(index: number) {
    if (!piesenka || piesenka.slohy.length === 0) {
      return;
    }

    const lastIndex = piesenka.slohy.length - 1;
    const nextIndex = Math.max(0, Math.min(index, lastIndex));
    const playbackOrder = buildVersePlaybackOrder(piesenka);
    const nextCursor = resolveVerseCursor(
      playbackOrder,
      nextIndex,
      selectedViewCursor,
    );

    setSelectedViewCursor(nextCursor);
    setSelectedView(nextIndex);
    if (!isProjectorBlackout) {
      sendProjectorPayload({
        song: piesenka,
        selectedView: nextIndex,
        showAkordy,
        blackout: false,
      });
    }
  }

  function moveVerse(step: -1 | 1) {
    if (!piesenka || piesenka.slohy.length === 0) {
      return;
    }

    const playbackOrder = buildVersePlaybackOrder(piesenka);
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
      sendProjectorPayload({
        song: piesenka,
        selectedView: nextVerseIndex,
        showAkordy,
        blackout: false,
      });
    }
  }

  useEffect(() => {
    if (!piesenka) return;

    if (!isProjectorBlackout) {
      sendProjectorPayload({
        song: piesenka,
        selectedView,
        showAkordy,
        blackout: false,
      });
    }
  }, [piesenka, selectedView, showAkordy, isProjectorBlackout]);

  useEffect(() => {
    if (!piesenka || piesenka.slohy.length === 0) {
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

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        moveVerse(1);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        moveVerse(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [piesenka, selectedView, selectedViewCursor, showAkordy, isProjectorBlackout]);

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
          {piesenka.nazov}
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
              projectorFeedback.tone === "ok" ? "var(--color-success-bg)" : "var(--color-warning-bg)",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {projectorFeedback.message}
        </div>
      )}

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
        <SongRenderer
          text={piesenka.slohy[selectedView].textik}
          showChords={showAkordy}
          zadanaVelkost={responsiveSongSize}
        />
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
        {piesenka?.slohy.map(function (sloha: SongVerse, i: number) {
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
                backgroundColor: selectedView === i ? activeTabBackground : panelBackground,
                color: selectedView === i ? "white" : textColor,
              }}
              onClick={() => {
                selectVerse(i);
              }}
            >
              <span style={{ fontSize: responsiveVerseBadge, fontWeight: 600 }}>
                {sloha.cisloS}
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
