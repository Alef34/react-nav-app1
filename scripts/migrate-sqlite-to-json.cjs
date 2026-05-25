const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

function parseArgs(argv) {
  const options = {
    sqlitePath: "songs.db",
    outputPath: "songs.local.json",
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--sqlite" && argv[i + 1]) {
      options.sqlitePath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--out" && argv[i + 1]) {
      options.outputPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
    }
  }

  return options;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizePlaylists(rows) {
  const payload = {
    "Playlist 1": [],
    "Playlist 2": [],
    "Playlist 3": [],
  };

  rows.forEach((row) => {
    const key = String(row?.name ?? "");
    if (!(key in payload)) {
      return;
    }

    const parsed = safeJsonParse(row.song_ids, []);
    payload[key] = Array.isArray(parsed)
      ? Array.from(
          new Set(
            parsed
              .map((item) => String(item ?? "").trim())
              .filter((item) => item.length > 0),
          ),
        )
      : [];
  });

  return payload;
}

function normalizeSettings(rows) {
  const defaults = {
    fontSize: 30,
    chordSizeMultiplier: 1,
    projectorFontSizeMultiplier: 1,
    projectorBgColor: "#000000",
    projectorTextColor: "#ffffff",
    homeChordColor: "#0000ff",
    colorScheme: "dark",
    showAkordy: false,
    showAkordyProjector: false,
    verzia: "",
  };

  for (const row of rows) {
    const key = String(row?.setting_key ?? "");
    if (!(key in defaults)) {
      continue;
    }
    defaults[key] = safeJsonParse(row.setting_value, defaults[key]);
  }

  return defaults;
}

function normalizeSongs(rows) {
  return rows
    .map((row) => {
      const parsedId = Number(row?.id);
      if (!Number.isFinite(parsedId) || parsedId <= 0) {
        return null;
      }

      return {
        id: Math.trunc(parsedId),
        cislo_p: String(row?.cislo_p ?? "").trim(),
        nazov: String(row?.nazov ?? "").trim(),
        source: String(row?.source ?? ""),
        kategoria: String(row?.kategoria ?? "Nabozenske"),
        poradie_sloh: safeJsonParse(row?.poradie_sloh ?? "[]", []),
        verse_font_multipliers: safeJsonParse(
          row?.verse_font_multipliers ?? "{}",
          {},
        ),
        slohy: safeJsonParse(row?.slohy ?? "[]", []),
        updated_at:
          String(row?.updated_at ?? "").trim() || new Date().toISOString(),
      };
    })
    .filter((row) => row !== null)
    .sort((a, b) => a.id - b.id);
}

function main() {
  const { sqlitePath, outputPath, force } = parseArgs(process.argv.slice(2));
  const sqliteFile = path.resolve(process.cwd(), sqlitePath);
  const outputFile = path.resolve(process.cwd(), outputPath);

  if (!fs.existsSync(sqliteFile)) {
    throw new Error(`SQLite subor neexistuje: ${sqliteFile}`);
  }

  if (fs.existsSync(outputFile) && !force) {
    throw new Error(
      `Cielovy JSON uz existuje: ${outputFile}. Pouzi --force na prepis.`,
    );
  }

  const db = new Database(sqliteFile, { readonly: true });

  const songsRows = db.prepare("SELECT * FROM songs ORDER BY id ASC").all();
  const playlistsRows = db
    .prepare("SELECT name, song_ids FROM playlists")
    .all();
  const settingsRows = db
    .prepare("SELECT setting_key, setting_value FROM app_settings")
    .all();

  const songs = normalizeSongs(songsRows);
  const maxSongId = songs.reduce((max, row) => Math.max(max, row.id), 0);

  const payload = {
    nextSongId: maxSongId + 1,
    songs,
    playlists: normalizePlaylists(playlistsRows),
    settings: normalizeSettings(settingsRows),
  };

  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
  db.close();

  console.log(`Migracia hotova.`);
  console.log(`SQLite: ${sqliteFile}`);
  console.log(`JSON:   ${outputFile}`);
  console.log(`Songs:  ${songs.length}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Chyba migracie: ${message}`);
  process.exit(1);
}
