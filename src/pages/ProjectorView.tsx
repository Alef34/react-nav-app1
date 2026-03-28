import { useEffect, useMemo, useState } from "react";
import Song from "../components/Song";
import { Song as SongType } from "../types/myTypes";
import { localData } from "../localData";
import {
  readProjectorPayload,
  startProjectorChannel,
  subscribeProjectorPayload,
} from "../realtime/projectorChannel";

interface ProjectorPayload {
  song?: SongType;
  selectedView?: number;
  showAkordy?: boolean;
}

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
  const [payload, setPayload] = useState<ProjectorPayload>(() =>
    readProjectorPayload(),
  );
  const [showAkordy, setShowAkordy] = useState<boolean>(
    () => localData.get("showAkordy") ?? false,
  );

  const { width, height } = useWindowSize();
  // veľkosť fontu = 5.5% výšky okna, ale aj 4% šírky — berie sa menšia hodnota
  const autoFontSize = Math.min(
    120,
    Math.max(
      24,
      Math.min(Math.round(height * 0.055), Math.round(width * 0.04)),
    ),
  );

  useEffect(() => {
    startProjectorChannel("projector");

    const syncFromStorage = () => {
      const latestPayload = readProjectorPayload();
      setPayload(latestPayload);

      const settingsShowAkordy = localData.get("showAkordy");
      if (typeof settingsShowAkordy === "boolean") {
        setShowAkordy(settingsShowAkordy);
      } else {
        setShowAkordy(latestPayload.showAkordy ?? false);
      }
    };

    window.addEventListener("storage", syncFromStorage);
    const unsubscribe = subscribeProjectorPayload((latestPayload) => {
      setPayload(latestPayload);
      const settingsShowAkordy = localData.get("showAkordy");
      if (typeof settingsShowAkordy === "boolean") {
        setShowAkordy(settingsShowAkordy);
      } else {
        setShowAkordy(latestPayload.showAkordy ?? false);
      }
    });
    syncFromStorage();

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      unsubscribe();
    };
  }, []);

  const song = payload.song;
  const verseIndex = payload.selectedView ?? 0;

  const text = useMemo(() => {
    if (!song?.slohy?.length) {
      return "";
    }

    const safeIndex = Math.min(Math.max(verseIndex, 0), song.slohy.length - 1);
    return song.slohy[safeIndex]?.textik ?? "";
  }, [song, verseIndex]);

  const verseLabel = useMemo(() => {
    if (!song?.slohy?.length) {
      return "";
    }

    const safeIndex = Math.min(Math.max(verseIndex, 0), song.slohy.length - 1);
    return song.slohy[safeIndex]?.cisloS ?? "";
  }, [song, verseIndex]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {!song ? (
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h1
            style={{ fontSize: Math.round(height * 0.065), marginBottom: 16 }}
          >
            Projektor je pripraveny
          </h1>
          <p style={{ fontSize: Math.round(height * 0.035), opacity: 0.9 }}>
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
              marginBottom: Math.round(height * 0.02),
            }}
          >
            <h1 style={{ margin: 0, fontSize: Math.round(height * 0.05) }}>
              {song.cisloP}. {song.nazov}
            </h1>
            <div style={{ fontSize: Math.round(height * 0.038), opacity: 0.9 }}>
              Cast: {verseLabel}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #333",
              borderRadius: 12,
              padding: 16,
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
