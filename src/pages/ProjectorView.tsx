import { useContext, useEffect, useMemo, useState } from "react";
import Song from "../components/Song";
import { APP_VERSION } from "../version";
import {
  ProjectorPayload,
  ProjectorPayloadDiagnostic,
  readProjectorPayloadDiagnostic,
  readProjectorPayload,
  startProjectorChannel,
  subscribeProjectorPayloadDiagnostic,
  subscribeProjectorPayload,
} from "../realtime/projectorChannel";
import { SettingsContext } from "../context/SettingsContext";

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

function normalizeVerseKey(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function getVerseMultiplierKey(
  payload: ProjectorPayload,
  verseIndex: number,
): string {
  const verses = payload.song?.slohy ?? [];
  if (verses.length === 0) {
    return "";
  }

  const boundedIndex = Math.max(0, Math.min(verseIndex, verses.length - 1));
  const verseLabel = normalizeVerseKey(verses[boundedIndex]?.cisloS ?? "");
  return verseLabel || `index:${boundedIndex}`;
}

function resolveVerseProjectorMultiplier(
  payload: ProjectorPayload,
  verseIndex: number,
  fallback: number,
): number {
  const fallbackClamped = Number(
    Math.min(2, Math.max(0.5, fallback || 1)).toFixed(2),
  );
  const verseKey = getVerseMultiplierKey(payload, verseIndex);

  if (!verseKey) {
    return fallbackClamped;
  }

  const raw = payload.song?.verseFontMultipliers?.[verseKey];
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return fallbackClamped;
  }

  return Number(Math.min(2, Math.max(0.5, numeric)).toFixed(2));
}

export default function ProjectorView() {
  const settingsContext = useContext(SettingsContext);
  const projectorFontSizeMultiplier =
    settingsContext?.projectorFontSizeMultiplier ?? 1;
  const projectorBgColor = settingsContext?.projectorBgColor ?? "black";
  const projectorTextColor = settingsContext?.projectorTextColor ?? "white";
  const showAkordy = settingsContext?.showAkordyProjector ?? false;
  const [isCursorVisible, setIsCursorVisible] = useState(true);

  const [payload, setPayload] = useState<ProjectorPayload>(() =>
    readProjectorPayload(),
  );
  const [diagnostic, setDiagnostic] =
    useState<ProjectorPayloadDiagnostic | null>(() =>
      readProjectorPayloadDiagnostic(),
    );

  const { width, height } = useWindowSize();
  // veľkosť fontu = 9% výšky okna, ale aj 6.5% šírky — berie sa menšia hodnota
  const baseAutoFontSize = Math.min(
    160,
    Math.max(
      32,
      Math.min(Math.round(height * 0.09), Math.round(width * 0.065)),
    ),
  );

  useEffect(() => {
    startProjectorChannel("projector");

    const syncFromStorage = () => {
      const latestPayload = readProjectorPayload();
      setPayload(latestPayload);
      setDiagnostic(readProjectorPayloadDiagnostic());
    };

    window.addEventListener("storage", syncFromStorage);
    const unsubscribe = subscribeProjectorPayload((latestPayload) => {
      setPayload(latestPayload);
    });
    const unsubscribeDiagnostic = subscribeProjectorPayloadDiagnostic(
      (nextDiagnostic) => {
        setDiagnostic(nextDiagnostic);
      },
    );
    syncFromStorage();

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      unsubscribe();
      unsubscribeDiagnostic();
    };
  }, []);

  const diagnosticMessage = useMemo(() => {
    if (!diagnostic) {
      return "";
    }

    const ageMs = Date.now() - diagnostic.at;
    if (ageMs > 1000 * 60 * 3) {
      return "";
    }

    return `Safe mode: payload bol zahodeny (${diagnostic.reason}).`;
  }, [diagnostic]);

  useEffect(() => {
    let hideCursorTimeout = window.setTimeout(() => {
      setIsCursorVisible(false);
    }, 2000);

    const showCursorTemporarily = () => {
      setIsCursorVisible(true);
      window.clearTimeout(hideCursorTimeout);
      hideCursorTimeout = window.setTimeout(() => {
        setIsCursorVisible(false);
      }, 2000);
    };

    window.addEventListener("mousemove", showCursorTemporarily);
    window.addEventListener("mousedown", showCursorTemporarily);
    window.addEventListener("keydown", showCursorTemporarily);
    window.addEventListener("touchstart", showCursorTemporarily);

    return () => {
      window.clearTimeout(hideCursorTimeout);
      window.removeEventListener("mousemove", showCursorTemporarily);
      window.removeEventListener("mousedown", showCursorTemporarily);
      window.removeEventListener("keydown", showCursorTemporarily);
      window.removeEventListener("touchstart", showCursorTemporarily);
    };
  }, []);

  const song = payload.song;
  const isBlackout = payload.blackout === true;
  const verseIndex = payload.selectedView ?? 0;
  const activeVerseMultiplier = resolveVerseProjectorMultiplier(
    payload,
    verseIndex,
    projectorFontSizeMultiplier,
  );

  const text = useMemo(() => {
    if (!song?.slohy?.length) {
      return "";
    }

    const safeIndex = Math.min(Math.max(verseIndex, 0), song.slohy.length - 1);
    return song.slohy[safeIndex]?.textik ?? "";
  }, [song, verseIndex]);

  // Výpočet redukcie veľkosti písma na základe počtu riadkov a dĺžky textu
  const autoFontSize = useMemo(() => {
    if (!text) return Math.round(baseAutoFontSize * activeVerseMultiplier);

    const lines = text.split("\n");
    const lineCount = lines.length;
    // Zohľad akordov v zátworkách
    const maxLineLength = Math.max(
      ...lines.map((l) => l.replace(/\[.*?\]/g, "").length),
      0,
    );

    // Redukcia na základe počtu riadkov (od ~5 riadkov začína redukcia)
    const lineReduction = Math.max(0.6, 1 - Math.max(0, lineCount - 5) * 0.04);
    // Redukcia na základe dĺžky riadkov
    const lengthReduction =
      maxLineLength > 80 ? 0.85 : maxLineLength > 60 ? 0.93 : 1;

    return Math.round(
      baseAutoFontSize *
        lineReduction *
        lengthReduction *
        activeVerseMultiplier,
    );
  }, [text, baseAutoFontSize, activeVerseMultiplier]);

  const versionNumberOnly = useMemo(() => {
    const match = APP_VERSION.match(/^(\d+(?:\.\d+)+)/);
    return match?.[1] ?? APP_VERSION;
  }, []);

  if (isBlackout) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "black",
          width: "100%",
          cursor: isCursorVisible ? "default" : "none",
        }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: projectorBgColor,
        color: projectorTextColor,
        display: "flex",
        flexDirection: "column",
        padding: 12,
        boxSizing: "border-box",
        cursor: isCursorVisible ? "default" : "none",
      }}
    >
      {diagnosticMessage ? (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            zIndex: 9999,
            background: "#fff4cc",
            color: "#5c3b00",
            border: "1px solid #f0cc70",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 16,
            maxWidth: "75vw",
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {diagnosticMessage}
        </div>
      ) : null}

      {!song ? (
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h1
            style={{
              fontSize: Math.round(height * 0.065),
              marginBottom: 16,
              color: projectorTextColor,
            }}
          >
            Projektor je pripraveny
          </h1>
          <p
            style={{
              fontSize: Math.round(height * 0.035),
              opacity: 0.9,
              color: projectorTextColor,
            }}
          >
            V hlavnom okne otvor skladbu a klikni na tlacidlo PROJ.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: Math.round(height * 0.01),
            }}
          >
            <div
              style={{
                margin: 0,
                color: projectorTextColor,
                fontSize: Math.round(height * 0.02),
                opacity: 0.9,
              }}
            >
              {song.kategoria}: {song.cisloP} - {song.nazov}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: 10,
              padding: 0,
            }}
          >
            <Song
              text={text}
              showChords={showAkordy}
              zadanaVelkost={autoFontSize}
            />
          </div>
        </>
      )}
      <div
        style={{
          position: "fixed",
          bottom: 8,
          right: 10,
          zIndex: 9999,
          fontSize: 12,
          opacity: 0.45,
          color: projectorTextColor,
          pointerEvents: "none",
        }}
      >
        ver:{versionNumberOnly}
      </div>
    </div>
  );
}
