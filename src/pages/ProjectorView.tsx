import { useEffect, useMemo, useState } from "react";
import Song from "../components/Song";
import { Song as SongType } from "../types/myTypes";
import { localData } from "../localData";

interface ProjectorPayload {
  song?: SongType;
  selectedView?: number;
  showAkordy?: boolean;
}

const STORAGE_KEY = "projector-song";

function readProjectorPayload(): ProjectorPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as ProjectorPayload;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export default function ProjectorView() {
  const [payload, setPayload] = useState<ProjectorPayload>(() =>
    readProjectorPayload()
  );
  const [showAkordy, setShowAkordy] = useState<boolean>(
    () => localData.get("showAkordy") ?? false
  );

  useEffect(() => {
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
    syncFromStorage();

    return () => {
      window.removeEventListener("storage", syncFromStorage);
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
          <h1 style={{ fontSize: 52, marginBottom: 16 }}>Projektor je pripraveny</h1>
          <p style={{ fontSize: 28, opacity: 0.9 }}>
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
              marginBottom: 20,
            }}
          >
            <h1 style={{ margin: 0, fontSize: 40 }}>
              {song.cisloP}. {song.nazov}
            </h1>
            <div style={{ fontSize: 30, opacity: 0.9 }}>Cast: {verseLabel}</div>
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
            <Song text={text} showChords={showAkordy} zadanaVelkost={24} />
          </div>
        </>
      )}
    </div>
  );
}
