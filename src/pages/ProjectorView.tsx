import { useContext, useEffect, useMemo, useState } from "react";
import Song from "../components/Song";
import {
  ProjectorPayload,
  readProjectorPayload,
  startProjectorChannel,
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

export default function ProjectorView() {
  const settingsContext = useContext(SettingsContext);
  const projectorFontSizeMultiplier =
    settingsContext?.projectorFontSizeMultiplier ?? 1;
  const projectorBgColor = settingsContext?.projectorBgColor ?? "black";
  const projectorTextColor = settingsContext?.projectorTextColor ?? "white";
  const showAkordy = settingsContext?.showAkordyProjector ?? false;

  const [payload, setPayload] = useState<ProjectorPayload>(() =>
    readProjectorPayload(),
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
    };

    window.addEventListener("storage", syncFromStorage);
    const unsubscribe = subscribeProjectorPayload((latestPayload) => {
      setPayload(latestPayload);
    });
    syncFromStorage();

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      unsubscribe();
    };
  }, []);

  const song = payload.song;
  const isBlackout = payload.blackout === true;
  const verseIndex = payload.selectedView ?? 0;

  const text = useMemo(() => {
    if (!song?.slohy?.length) {
      return "";
    }

    const safeIndex = Math.min(Math.max(verseIndex, 0), song.slohy.length - 1);
    return song.slohy[safeIndex]?.textik ?? "";
  }, [song, verseIndex]);

  // Výpočet redukcie veľkosti písma na základe počtu riadkov a dĺžky textu
  const autoFontSize = useMemo(() => {
    if (!text)
      return Math.round(baseAutoFontSize * (projectorFontSizeMultiplier || 1));

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
        (projectorFontSizeMultiplier || 1),
    );
  }, [text, baseAutoFontSize, projectorFontSizeMultiplier]);

  if (isBlackout) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "black",
          width: "100%",
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
      }}
    >
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
            <h1 style={{ margin: 0, fontSize: Math.round(height * 0.04) }}>
              {song.cisloP}- {song.nazov}
            </h1>
            <div style={{ fontSize: Math.round(height * 0.028), opacity: 0.9 }}>
              Piesen: {song.cisloP}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: 0,
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
    </div>
  );
}
