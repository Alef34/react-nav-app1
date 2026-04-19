import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { APP_VERSION } from "../version";
import { DataMode, getDataMode, setDataMode } from "../api/dataMode";
import { loadSongsForExport } from "../api/supabaseSongs";
import { Song, Udaje } from "../types/myTypes";

type ExportScope = "all" | "filtered" | "selected";

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function normalizeSongNumber(value: string): string {
  return (value ?? "").trim().replace(/\.$/, "").toLocaleLowerCase();
}

function parseCommaSeparatedQuery(query: string): string[] {
  return query
    .split(",")
    .map((part) => normalizeSongNumber(part))
    .filter((part) => part.length > 0);
}

function sortSongsByNumberAndTitle(items: Song[]): Song[] {
  return [...items].sort((a, b) => {
    const byNumber = a.cisloP.localeCompare(b.cisloP, undefined, {
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

function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toExportSong(song: Song): Song {
  return {
    cisloP: String(song.cisloP ?? "").trim(),
    nazov: String(song.nazov ?? "").trim(),
    source: String(song.source ?? "").trim(),
    kategoria: String(song.kategoria ?? "Nabozenske").trim() || "Nabozenske",
    poradieSloh: Array.isArray(song.poradieSloh)
      ? song.poradieSloh
          .map((item) => String(item ?? "").trim())
          .filter((item) => item.length > 0)
      : [],
    slohy: Array.isArray(song.slohy)
      ? song.slohy.map((verse, index) => ({
          cisloS: String(verse?.cisloS ?? `V${index + 1}`),
          textik: String(verse?.textik ?? ""),
        }))
      : [],
  };
}

export default function AdminExport() {
  const [dataMode, setDataModeState] = useState<DataMode>(() => getDataMode());
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Vsetky");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportScope, setExportScope] = useState<ExportScope>("filtered");

  useEffect(() => {
    const handleDataModeChanged = (event: Event) => {
      const customEvent = event as CustomEvent<DataMode>;
      setDataModeState(customEvent.detail === "offline" ? "offline" : "online");
    };

    window.addEventListener("data-mode-changed", handleDataModeChanged);
    return () =>
      window.removeEventListener("data-mode-changed", handleDataModeChanged);
  }, []);

  const categoryOptions = useMemo(() => {
    const dynamic = Array.from(
      new Set(
        songs
          .map((song) => String(song.kategoria ?? "").trim())
          .filter((category) => category.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ["Vsetky", ...dynamic];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    const query = normalizeText(searchQuery);
    const commaSeparatedTerms = parseCommaSeparatedQuery(query);
    const shouldUseCommaFilter =
      query.includes(",") && commaSeparatedTerms.length > 0;

    return songs.filter((song) => {
      const category = String(song.kategoria ?? "Nabozenske").trim();
      const categoryMatch =
        categoryFilter === "Vsetky" || category === categoryFilter;
      if (!categoryMatch) {
        return false;
      }

      if (query.length === 0) {
        return true;
      }

      const number = normalizeSongNumber(song.cisloP);
      const title = normalizeText(song.nazov);
      const source = normalizeText(song.source ?? "");

      if (shouldUseCommaFilter) {
        return commaSeparatedTerms.some(
          (term) =>
            number === term || title.includes(term) || source.includes(term),
        );
      }

      return (
        number.includes(query) ||
        title.includes(query) ||
        source.includes(query) ||
        normalizeText(category).includes(query)
      );
    });
  }, [songs, searchQuery, categoryFilter]);

  const filteredIdSet = useMemo(() => {
    return new Set(filteredSongs.map((song) => `${song.cisloP}|${song.nazov}`));
  }, [filteredSongs]);

  const allVisibleSelected =
    filteredSongs.length > 0 &&
    filteredSongs.every((song) =>
      selectedIds.has(`${song.cisloP}|${song.nazov}`),
    );

  function handleDataModeChange(nextMode: DataMode) {
    setDataMode(nextMode);
    setDataModeState(nextMode);
    setMessage("");
    setSongs([]);
    setSelectedIds(new Set());
  }

  async function handleLoadSongs() {
    setIsLoading(true);
    setMessage("Nacitavam skladby...");
    try {
      const loadedSongs = sortSongsByNumberAndTitle(await loadSongsForExport());
      setSongs(loadedSongs);
      setSelectedIds(new Set());
      setMessage(`Nacitanych skladieb: ${loadedSongs.length}.`);
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Nacitanie skladieb zlyhalo.";
      setMessage(text);
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggleSong(song: Song) {
    const songKey = `${song.cisloP}|${song.nazov}`;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(songKey)) {
        next.delete(songKey);
      } else {
        next.add(songKey);
      }
      return next;
    });
  }

  function handleToggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIdSet.forEach((songKey) => next.delete(songKey));
        return next;
      });
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredIdSet.forEach((songKey) => next.add(songKey));
      return next;
    });
  }

  function getSongsToExport(): Song[] {
    if (exportScope === "all") {
      return songs;
    }

    if (exportScope === "selected") {
      return filteredSongs.filter((song) =>
        selectedIds.has(`${song.cisloP}|${song.nazov}`),
      );
    }

    return filteredSongs;
  }

  function handleExportJson() {
    const songsToExport = getSongsToExport()
      .map((song) => toExportSong(song))
      .filter(
        (song) =>
          song.cisloP.length > 0 &&
          song.nazov.length > 0 &&
          Array.isArray(song.slohy) &&
          song.slohy.length > 0,
      );

    if (songsToExport.length === 0) {
      setMessage("Pre export nie su k dispozicii ziadne skladby.");
      return;
    }

    const payload: Udaje = {
      verzia: `export-${new Date().toISOString()}`,
      piesne: songsToExport,
    };

    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate(),
    )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    downloadJson(`songs-export-${stamp}.json`, payload);
    setMessage(`Export uspesny. Pocet skladieb: ${songsToExport.length}.`);
  }

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        color: "#222",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px #0001",
      }}
    >
      <h1>
        Admin Export{" "}
        <span style={{ fontSize: 14, fontWeight: 400, color: "#888" }}>
          v{APP_VERSION}
        </span>
      </h1>

      <p>
        Exportuje skladby do JSON formatu kompatibilneho s importom v tejto
        appke (objekt s polami verzia + piesne).
      </p>

      <p style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/">Spat na domov</Link>
        <Link to="/admin-import">Admin Import</Link>
        <Link to="/admin-crud">Admin CRUD</Link>
      </p>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #bbb",
          backgroundColor: "#f8f8f8",
        }}
      >
        <strong>Datovy rezim:</strong>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="export-data-mode"
              checked={dataMode === "online"}
              onChange={() => handleDataModeChange("online")}
            />
            Online (Supabase)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="export-data-mode"
              checked={dataMode === "offline"}
              onChange={() => handleDataModeChange("offline")}
            />
            Offline (lokalna DB)
          </label>
        </div>
      </div>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #bbb",
          backgroundColor: "#f8f8f8",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleLoadSongs}
            disabled={isLoading}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 6,
              background: "#1976d2",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isLoading ? "Nacitavam..." : "Nacitat skladby"}
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={songs.length === 0}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 6,
              background: "#2e7d32",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Export do JSON
          </button>
        </div>

        {songs.length > 0 && (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Filter text alebo mix (napr. 2,33,som)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: "1 1 320px", padding: 8 }}
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: 8, minWidth: 170 }}
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="export-scope"
                  checked={exportScope === "all"}
                  onChange={() => setExportScope("all")}
                />
                Export vsetko ({songs.length})
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="export-scope"
                  checked={exportScope === "filtered"}
                  onChange={() => setExportScope("filtered")}
                />
                Export filtrovane ({filteredSongs.length})
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="export-scope"
                  checked={exportScope === "selected"}
                  onChange={() => setExportScope("selected")}
                />
                Export oznacene ({selectedIds.size})
              </label>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleToggleAllVisible}
              />
              Oznacit vsetky filtrovane ({filteredSongs.length})
            </label>
          </div>
        )}
      </div>

      {songs.length > 0 && (
        <div
          style={{
            maxHeight: 440,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: 6,
            background: "#fff",
          }}
        >
          {filteredSongs.length === 0 ? (
            <p style={{ padding: 10, color: "#777" }}>
              Ziadne vysledky pre filter.
            </p>
          ) : (
            filteredSongs.map((song) => {
              const songKey = `${song.cisloP}|${song.nazov}`;
              const checked = selectedIds.has(songKey);

              return (
                <label
                  key={songKey}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 10px",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: checked ? "#fff7d6" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleSong(song)}
                  />
                  <span style={{ minWidth: 56, color: "#666" }}>
                    {song.cisloP}
                  </span>
                  <span style={{ flex: 1 }}>{song.nazov}</span>
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {song.kategoria || "Nabozenske"}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            backgroundColor: "#f3f4f6",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
