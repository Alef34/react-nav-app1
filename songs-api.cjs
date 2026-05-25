const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const STORAGE_MODE_RAW = String(process.env.STORAGE_MODE || "sqlite")
  .trim()
  .toLowerCase();
const USE_JSON_STORAGE =
  STORAGE_MODE_RAW === "json" || STORAGE_MODE_RAW === "local";
const JSON_DB_FILE = path.resolve(
  process.cwd(),
  process.env.LOCAL_JSON_PATH || "songs.local.json",
);

const app = express();
const PLAYLIST_KEYS = ["Playlist 1", "Playlist 2", "Playlist 3"];
const DEFAULT_SETTINGS = {
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

let db = null;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
console.log("Spustam backend...");

function normalizeNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, numeric));
}

function normalizeColor(value, fallback) {
  const color = String(value ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }
  return fallback;
}

function normalizeSettings(raw) {
  const safe = raw && typeof raw === "object" ? raw : {};
  return {
    fontSize: Math.round(
      normalizeNumber(safe.fontSize, 20, 80, DEFAULT_SETTINGS.fontSize),
    ),
    chordSizeMultiplier: Number(
      normalizeNumber(
        safe.chordSizeMultiplier,
        0.7,
        1.6,
        DEFAULT_SETTINGS.chordSizeMultiplier,
      ).toFixed(2),
    ),
    projectorFontSizeMultiplier: Number(
      normalizeNumber(
        safe.projectorFontSizeMultiplier,
        0.7,
        1.5,
        DEFAULT_SETTINGS.projectorFontSizeMultiplier,
      ).toFixed(2),
    ),
    projectorBgColor: normalizeColor(
      safe.projectorBgColor,
      DEFAULT_SETTINGS.projectorBgColor,
    ),
    projectorTextColor: normalizeColor(
      safe.projectorTextColor,
      DEFAULT_SETTINGS.projectorTextColor,
    ),
    homeChordColor: normalizeColor(
      safe.homeChordColor,
      DEFAULT_SETTINGS.homeChordColor,
    ),
    colorScheme:
      safe.colorScheme === "light" || safe.colorScheme === "dark"
        ? safe.colorScheme
        : DEFAULT_SETTINGS.colorScheme,
    showAkordy: Boolean(safe.showAkordy),
    showAkordyProjector: Boolean(safe.showAkordyProjector),
    verzia: String(safe.verzia ?? DEFAULT_SETTINGS.verzia),
  };
}

function parsePlaylistSongIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => String(item ?? "").trim())
        .filter((item) => item.length > 0),
    ),
  );
}

function normalizeVerseFontMultipliers(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const next = {};
  Object.entries(raw).forEach(([key, value]) => {
    const safeKey = String(key ?? "")
      .trim()
      .toLowerCase();
    const numeric = Number(value);
    if (!safeKey || !Number.isFinite(numeric)) {
      return;
    }

    next[safeKey] = Number(Math.min(2, Math.max(0.5, numeric)).toFixed(2));
  });

  return next;
}

function normalizeSongRow(raw, fallbackId = 0) {
  const parsedId = Number(raw?.id);
  const id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : fallbackId;

  return {
    id,
    cislo_p: String(raw?.cislo_p ?? "").trim(),
    nazov: String(raw?.nazov ?? "").trim(),
    source: String(raw?.source ?? ""),
    kategoria: String(raw?.kategoria ?? "Nabozenske"),
    poradie_sloh: Array.isArray(raw?.poradie_sloh)
      ? raw.poradie_sloh
          .map((item) => String(item ?? "").trim())
          .filter((item) => item.length > 0)
      : [],
    verse_font_multipliers: normalizeVerseFontMultipliers(
      raw?.verse_font_multipliers,
    ),
    slohy: Array.isArray(raw?.slohy) ? raw.slohy : [],
    updated_at: String(raw?.updated_at ?? new Date().toISOString()),
  };
}

function createDefaultJsonState() {
  return {
    nextSongId: 1,
    songs: [],
    playlists: {
      "Playlist 1": [],
      "Playlist 2": [],
      "Playlist 3": [],
    },
    settings: { ...DEFAULT_SETTINGS },
  };
}

function normalizeJsonState(raw) {
  const safe = raw && typeof raw === "object" ? raw : {};
  const base = createDefaultJsonState();

  PLAYLIST_KEYS.forEach((key) => {
    base.playlists[key] = parsePlaylistSongIds(safe?.playlists?.[key]);
  });

  base.settings = normalizeSettings(safe?.settings);

  const songsRaw = Array.isArray(safe?.songs) ? safe.songs : [];
  const taken = new Set();
  let cursor = 1;

  base.songs = songsRaw
    .map((song) => normalizeSongRow(song, 0))
    .map((song) => {
      let nextId = Number(song.id);
      if (!Number.isFinite(nextId) || nextId <= 0 || taken.has(nextId)) {
        while (taken.has(cursor)) {
          cursor += 1;
        }
        nextId = cursor;
      }
      taken.add(nextId);
      cursor = Math.max(cursor, nextId + 1);
      return { ...song, id: nextId };
    });

  const maxId = base.songs.reduce((max, row) => Math.max(max, row.id), 0);
  const parsedNextId = Number(safe?.nextSongId);
  base.nextSongId =
    Number.isFinite(parsedNextId) && parsedNextId > 0
      ? Math.max(Math.trunc(parsedNextId), maxId + 1)
      : maxId + 1;

  return base;
}

function ensureJsonStateFile() {
  if (fs.existsSync(JSON_DB_FILE)) {
    return;
  }

  const dir = path.dirname(JSON_DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const initial = createDefaultJsonState();
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify(initial, null, 2));
}

function readJsonState() {
  ensureJsonStateFile();
  try {
    const raw = fs.readFileSync(JSON_DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeJsonState(parsed);
  } catch {
    const fallback = createDefaultJsonState();
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function writeJsonState(state) {
  const normalized = normalizeJsonState(state);
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify(normalized, null, 2));
}

if (!USE_JSON_STORAGE) {
  db = new Database("songs.db");

  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cislo_p TEXT,
      nazov TEXT,
      source TEXT,
      kategoria TEXT,
      poradie_sloh TEXT,
      verse_font_multipliers TEXT,
      slohy TEXT,
      updated_at TEXT
    )
  `);

  try {
    db.exec("ALTER TABLE songs ADD COLUMN verse_font_multipliers TEXT");
  } catch {
    // Ignore when column already exists.
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS playlists (
      name TEXT PRIMARY KEY,
      song_ids TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  const ensurePlaylistStmt = db.prepare(
    "INSERT OR IGNORE INTO playlists (name, song_ids, updated_at) VALUES (?, '[]', datetime('now'))",
  );
  PLAYLIST_KEYS.forEach((name) => {
    ensurePlaylistStmt.run(name);
  });

  const ensureSettingStmt = db.prepare(
    "INSERT OR IGNORE INTO app_settings (setting_key, setting_value, updated_at) VALUES (?, ?, datetime('now'))",
  );

  Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
    ensureSettingStmt.run(key, JSON.stringify(value));
  });
} else {
  ensureJsonStateFile();
}

function loadSettings() {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    return normalizeSettings(state.settings);
  }

  const rows = db
    .prepare("SELECT setting_key, setting_value FROM app_settings")
    .all();
  const merged = { ...DEFAULT_SETTINGS };

  rows.forEach((row) => {
    if (!(row.setting_key in merged)) {
      return;
    }
    try {
      merged[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      // Keep defaults when stored JSON is invalid.
    }
  });

  return normalizeSettings(merged);
}

function saveSettings(settings) {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    state.settings = normalizeSettings(settings);
    writeJsonState(state);
    return;
  }

  const upsertStmt = db.prepare(
    "INSERT INTO app_settings (setting_key, setting_value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')",
  );

  const transaction = db.transaction(() => {
    Object.entries(settings).forEach(([key, value]) => {
      upsertStmt.run(key, JSON.stringify(value));
    });
  });

  transaction();
}

function getPlaylistsPayload() {
  const payload = {
    "Playlist 1": [],
    "Playlist 2": [],
    "Playlist 3": [],
  };

  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    PLAYLIST_KEYS.forEach((key) => {
      payload[key] = parsePlaylistSongIds(state.playlists?.[key]);
    });
    return payload;
  }

  const rows = db
    .prepare("SELECT name, song_ids FROM playlists WHERE name IN (?, ?, ?)")
    .all(...PLAYLIST_KEYS);

  rows.forEach((row) => {
    try {
      payload[row.name] = parsePlaylistSongIds(JSON.parse(row.song_ids));
    } catch {
      payload[row.name] = [];
    }
  });

  return payload;
}

function savePlaylistsPayload(body) {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    PLAYLIST_KEYS.forEach((playlistKey) => {
      state.playlists[playlistKey] = parsePlaylistSongIds(body[playlistKey]);
    });
    writeJsonState(state);
    return;
  }

  const upsertStmt = db.prepare(
    "INSERT INTO playlists (name, song_ids, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(name) DO UPDATE SET song_ids = excluded.song_ids, updated_at = datetime('now')",
  );

  const transaction = db.transaction(() => {
    PLAYLIST_KEYS.forEach((playlistKey) => {
      const songIds = parsePlaylistSongIds(body[playlistKey]);
      upsertStmt.run(playlistKey, JSON.stringify(songIds));
    });
  });

  transaction();
}

function parseSqliteSongRow(row) {
  return {
    ...row,
    slohy: (() => {
      try {
        return JSON.parse(row.slohy);
      } catch {
        return [];
      }
    })(),
    poradie_sloh: (() => {
      try {
        return JSON.parse(row.poradie_sloh);
      } catch {
        return [];
      }
    })(),
    verse_font_multipliers: (() => {
      try {
        return JSON.parse(row.verse_font_multipliers || "{}");
      } catch {
        return {};
      }
    })(),
  };
}

function getAllSongs() {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    return state.songs.map((row) => normalizeSongRow(row, 0));
  }

  const rows = db.prepare("SELECT * FROM songs").all();
  return rows.map(parseSqliteSongRow);
}

function getSongById(id) {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    const row = state.songs.find((song) => song.id === id);
    return row ? normalizeSongRow(row, id) : null;
  }

  const row = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);
  return row ? parseSqliteSongRow(row) : null;
}

function insertSong(payload) {
  const normalized = normalizeSongRow(payload, 0);

  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    const id = state.nextSongId;
    state.songs.push({
      ...normalized,
      id,
      updated_at: new Date().toISOString(),
    });
    state.nextSongId = id + 1;
    writeJsonState(state);
    return id;
  }

  const stmt = db.prepare(`
    INSERT INTO songs (cislo_p, nazov, source, kategoria, poradie_sloh, verse_font_multipliers, slohy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const info = stmt.run(
    normalized.cislo_p,
    normalized.nazov,
    normalized.source,
    normalized.kategoria,
    JSON.stringify(normalized.poradie_sloh),
    JSON.stringify(normalized.verse_font_multipliers),
    JSON.stringify(normalized.slohy),
  );

  return Number(info.lastInsertRowid);
}

function updateSong(id, payload) {
  const normalized = normalizeSongRow(payload, id);

  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    const index = state.songs.findIndex((song) => song.id === id);
    if (index === -1) {
      return false;
    }

    state.songs[index] = {
      ...state.songs[index],
      ...normalized,
      id,
      updated_at: new Date().toISOString(),
    };
    writeJsonState(state);
    return true;
  }

  const stmt = db.prepare(
    "UPDATE songs SET cislo_p = ?, nazov = ?, source = ?, kategoria = ?, poradie_sloh = ?, verse_font_multipliers = ?, slohy = ?, updated_at = datetime('now') WHERE id = ?",
  );
  const result = stmt.run(
    normalized.cislo_p,
    normalized.nazov,
    normalized.source,
    normalized.kategoria,
    JSON.stringify(normalized.poradie_sloh),
    JSON.stringify(normalized.verse_font_multipliers),
    JSON.stringify(normalized.slohy),
    id,
  );

  return result.changes > 0;
}

function importSongs(songs) {
  if (!Array.isArray(songs)) {
    return 0;
  }

  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    let imported = 0;

    songs.forEach((song) => {
      const normalized = normalizeSongRow(
        {
          cislo_p: song.cisloP,
          nazov: song.nazov,
          source: song.source,
          kategoria: song.kategoria,
          poradie_sloh: song.poradieSloh ?? [],
          verse_font_multipliers:
            song.verseFontMultipliers ?? song.verse_font_multipliers ?? {},
          slohy: song.slohy ?? [],
        },
        state.nextSongId,
      );

      state.songs.push({
        ...normalized,
        id: state.nextSongId,
        updated_at: new Date().toISOString(),
      });
      state.nextSongId += 1;
      imported += 1;
    });

    writeJsonState(state);
    return imported;
  }

  const stmt = db.prepare(`
    INSERT INTO songs (cislo_p, nazov, source, kategoria, poradie_sloh, verse_font_multipliers, slohy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  let count = 0;

  for (const song of songs) {
    stmt.run(
      song.cisloP,
      song.nazov,
      song.source,
      song.kategoria,
      JSON.stringify(song.poradieSloh ?? []),
      JSON.stringify(
        song.verseFontMultipliers ?? song.verse_font_multipliers ?? {},
      ),
      JSON.stringify(song.slohy ?? []),
    );
    count += 1;
  }

  return count;
}

function deleteAllSongs() {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    const deleted = state.songs.length;
    state.songs = [];
    state.nextSongId = 1;
    writeJsonState(state);
    return deleted;
  }

  const result = db.prepare("DELETE FROM songs").run();
  return result.changes;
}

function deleteSongById(id) {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    const before = state.songs.length;
    state.songs = state.songs.filter((song) => song.id !== id);
    const changed = before !== state.songs.length;
    if (changed) {
      writeJsonState(state);
    }
    return changed;
  }

  const result = db.prepare("DELETE FROM songs WHERE id = ?").run(id);
  return result.changes > 0;
}

function updateSongOrder(id, poradieSloh) {
  const normalizedOrder = Array.isArray(poradieSloh) ? poradieSloh : [];

  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    const index = state.songs.findIndex((song) => song.id === id);
    if (index === -1) {
      return false;
    }

    state.songs[index] = {
      ...state.songs[index],
      poradie_sloh: normalizedOrder,
      updated_at: new Date().toISOString(),
    };
    writeJsonState(state);
    return true;
  }

  const stmt = db.prepare(
    "UPDATE songs SET poradie_sloh = ?, updated_at = datetime('now') WHERE id = ?",
  );
  const result = stmt.run(JSON.stringify(normalizedOrder), id);
  return result.changes > 0;
}

function updateSongVerseFont(id, verseKey, multiplier) {
  if (USE_JSON_STORAGE) {
    const state = readJsonState();
    const index = state.songs.findIndex((song) => song.id === id);
    if (index === -1) {
      return null;
    }

    const current = normalizeVerseFontMultipliers(
      state.songs[index].verse_font_multipliers,
    );

    if (multiplier === null) {
      delete current[verseKey];
    } else {
      current[verseKey] = multiplier;
    }

    state.songs[index] = {
      ...state.songs[index],
      verse_font_multipliers: current,
      updated_at: new Date().toISOString(),
    };
    writeJsonState(state);
    return current;
  }

  const row = db
    .prepare("SELECT verse_font_multipliers FROM songs WHERE id = ?")
    .get(id);
  if (!row) {
    return null;
  }

  let current = {};
  try {
    const parsed = JSON.parse(row.verse_font_multipliers || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      current = parsed;
    }
  } catch {
    current = {};
  }

  if (multiplier === null) {
    delete current[verseKey];
  } else {
    current[verseKey] = multiplier;
  }

  const stmt = db.prepare(
    "UPDATE songs SET verse_font_multipliers = ?, updated_at = datetime('now') WHERE id = ?",
  );
  stmt.run(JSON.stringify(current), id);
  return current;
}

function decodeHtmlEntities(value) {
  const source = String(value ?? "");
  const named = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    hellip: "...",
    bdquo: '"',
    ldquo: '"',
    rdquo: '"',
    lsquo: "'",
    rsquo: "'",
    ndash: "-",
    mdash: "-",
  };

  return source.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, token) => {
    if (token.startsWith("#x") || token.startsWith("#X")) {
      const code = Number.parseInt(token.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    }

    if (token.startsWith("#")) {
      const code = Number.parseInt(token.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    }

    const mapped = named[token.toLowerCase()];
    return mapped !== undefined ? mapped : _;
  });
}

function htmlToPlainText(value) {
  return decodeHtmlEntities(
    String(value ?? "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<var[^>]*>/gi, "")
      .replace(/<\/var>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function extractPrimaryRefrain(value) {
  const normalized = String(value ?? "")
    .replace(/^R\.:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "";
  }

  const withoutAlternative = normalized.split(/\s+alebo\s+/i)[0]?.trim() ?? "";
  return withoutAlternative.replace(/[;,]\s*$/, "").trim();
}

function parsePsalmFromLcKbsHtml(html) {
  const source = String(html ?? "");
  const startTagMatch = source.match(
    /<div[^>]*id=['"]c_[^'"]+['"][^>]*class=['"][^'"]*lcZALM[^'"]*['"][^>]*>/i,
  );

  if (!startTagMatch || typeof startTagMatch.index !== "number") {
    throw new Error(
      "V odpovedi lc.kbs.sk sa nenasiel blok pre responzoriovy zalm.",
    );
  }

  const start = startTagMatch.index;
  const nextReading = source.indexOf(
    "<div id='c_",
    start + startTagMatch[0].length,
  );
  const articleEnd = source.indexOf(
    "</article>",
    start + startTagMatch[0].length,
  );
  const endCandidates = [nextReading, articleEnd].filter((v) => v >= 0);
  const end =
    endCandidates.length > 0 ? Math.min(...endCandidates) : source.length;
  const section = source.slice(start, end);

  const refrainMatch = section.match(
    /<p[^>]*class=['"][^'"]*lcRESPblock[^'"]*['"][^>]*>([\s\S]*?)<\/p>/i,
  );
  const citationMatch = section.match(
    /<h4[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>\s*([^<]*)<\/span>[\s\S]*?<\/h4>/i,
  );

  const contentHtml = section
    .replace(
      /<p[^>]*class=['"][^'"]*lcRESPblock[^'"]*['"][^>]*>[\s\S]*?<\/p>/i,
      "",
    )
    .replace(/<h4[^>]*>[\s\S]*?<\/h4>/i, "");

  const refrain = refrainMatch
    ? extractPrimaryRefrain(htmlToPlainText(refrainMatch[1]))
    : "";
  const citation = citationMatch
    ? htmlToPlainText(`${citationMatch[1]} ${citationMatch[2]}`)
        .replace(/\s+/g, " ")
        .trim()
    : "";
  const text = htmlToPlainText(contentHtml).replace(/\r/g, "");

  if (!refrain) {
    throw new Error("Nepodarilo sa vyparsovat refren zalmu z lc.kbs.sk.");
  }

  return {
    title: "Responzoriovy zalm",
    citation,
    refrain,
    text,
  };
}

app.get("/api/settings", (_req, res) => {
  const settings = loadSettings();
  res.json(settings);
});

app.put("/api/settings", (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return res
      .status(400)
      .json({ error: "Neplatny format settings payloadu." });
  }

  const current = loadSettings();
  const merged = normalizeSettings({ ...current, ...incoming });
  saveSettings(merged);
  res.json(merged);
});

app.get("/api/playlists", (_req, res) => {
  res.json(getPlaylistsPayload());
});

app.get("/api/liturgy/zalm-today", async (req, res) => {
  const denRaw = String(req.query.den ?? "dnes").trim();
  const den =
    /^\d{4}-\d{2}-\d{2}$/.test(denRaw) || denRaw === "dnes" ? denRaw : "dnes";
  const sourceUrl = `https://lc.kbs.sk/?den=${encodeURIComponent(den)}`;

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: `lc.kbs.sk vratilo chybu ${response.status}.`,
      });
    }

    const html = await response.text();
    const psalm = parsePsalmFromLcKbsHtml(html);
    return res.json({
      ...psalm,
      sourceUrl,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepodarilo sa nacitat dnesny zalm.";
    return res.status(500).json({ error: message });
  }
});

app.put("/api/playlists", (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res
      .status(400)
      .json({ error: "Neplatny format playlist payloadu." });
  }

  savePlaylistsPayload(body);
  res.json({ updated: true });
});

app.patch("/api/songs/:id/poradie", (req, res) => {
  const id = Number(req.params.id);
  const { poradie_sloh } = req.body;
  if (!Array.isArray(poradie_sloh)) {
    return res.status(400).json({ error: "poradie_sloh musi byt pole." });
  }

  if (!updateSongOrder(id, poradie_sloh)) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json({ updated: true });
});

app.patch("/api/songs/:id/verse-font", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Neplatne id." });
  }

  const verseKey = String(req.body?.verse_key ?? "")
    .trim()
    .toLowerCase();
  if (!verseKey) {
    return res.status(400).json({ error: "verse_key musi byt text." });
  }

  const rawMultiplier = req.body?.multiplier;
  let multiplier = null;
  if (rawMultiplier !== null && rawMultiplier !== undefined) {
    const parsed = Number(rawMultiplier);
    if (!Number.isFinite(parsed)) {
      return res
        .status(400)
        .json({ error: "multiplier musi byt cislo alebo null." });
    }

    multiplier = Number(Math.min(2, Math.max(0.5, parsed)).toFixed(2));
  }

  const updated = updateSongVerseFont(id, verseKey, multiplier);
  if (!updated) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json({ updated: true, verse_font_multipliers: updated });
});

app.post("/api/import", (req, res) => {
  const songs = req.body;
  if (!Array.isArray(songs)) {
    return res.status(400).json({ error: "Ocakava sa pole piesni." });
  }

  const count = importSongs(songs);
  res.json({ imported: count });
});

app.delete("/api/songs", (_req, res) => {
  deleteAllSongs();
  res.json({ deleted: true });
});

app.get("/api/songs", (_req, res) => {
  res.json(getAllSongs());
});

app.get("/api/songs/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Neplatne id." });
  }

  const row = getSongById(id);
  if (!row) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json(row);
});

app.post("/api/songs", (req, res) => {
  const {
    cislo_p,
    nazov,
    source,
    kategoria,
    poradie_sloh,
    verse_font_multipliers,
    slohy,
  } = req.body;

  if (!String(cislo_p ?? "").trim() || !String(nazov ?? "").trim()) {
    return res.status(400).json({ error: "cislo_p a nazov su povinne." });
  }

  if (!Array.isArray(slohy) || slohy.length === 0) {
    return res.status(400).json({ error: "slohy musi byt neprzdne pole." });
  }

  const id = insertSong({
    cislo_p: String(cislo_p).trim(),
    nazov: String(nazov).trim(),
    source: String(source ?? ""),
    kategoria: String(kategoria ?? "Nabozenske"),
    poradie_sloh: Array.isArray(poradie_sloh) ? poradie_sloh : [],
    verse_font_multipliers:
      verse_font_multipliers &&
      typeof verse_font_multipliers === "object" &&
      !Array.isArray(verse_font_multipliers)
        ? verse_font_multipliers
        : {},
    slohy,
  });

  res.json({ id });
});

app.put("/api/songs/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Neplatne id." });
  }

  const {
    cislo_p,
    nazov,
    source,
    kategoria,
    poradie_sloh,
    verse_font_multipliers,
    slohy,
  } = req.body;

  if (!String(cislo_p ?? "").trim() || !String(nazov ?? "").trim()) {
    return res.status(400).json({ error: "cislo_p a nazov su povinne." });
  }

  if (!Array.isArray(slohy) || slohy.length === 0) {
    return res.status(400).json({ error: "slohy musi byt neprzdne pole." });
  }

  const updated = updateSong(id, {
    id,
    cislo_p: String(cislo_p).trim(),
    nazov: String(nazov).trim(),
    source: String(source ?? ""),
    kategoria: String(kategoria ?? "Nabozenske"),
    poradie_sloh: Array.isArray(poradie_sloh) ? poradie_sloh : [],
    verse_font_multipliers:
      verse_font_multipliers &&
      typeof verse_font_multipliers === "object" &&
      !Array.isArray(verse_font_multipliers)
        ? verse_font_multipliers
        : {},
    slohy,
  });

  if (!updated) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json({ updated: true });
});

app.delete("/api/songs/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Neplatne id." });
  }

  if (!deleteSongById(id)) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json({ deleted: true });
});

app.get("/api/network-info", (_req, res) => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === "IPv4" && !addr.internal) {
        ips.push({ iface: name, address: addr.address });
      }
    }
  }

  let ssid = null;
  try {
    const platform = os.platform();
    if (platform === "linux") {
      ssid =
        execSync("iwgetid -r 2>/dev/null", { timeout: 2000 })
          .toString()
          .trim() || null;
    } else if (platform === "darwin") {
      const raw = execSync(
        "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I 2>/dev/null",
        { timeout: 2000 },
      ).toString();
      const match = raw.match(/\s+SSID:\s*(.+)/);
      ssid = match ? match[1].trim() : null;
    }
  } catch {
    ssid = null;
  }

  res.json({ ips, ssid });
});

const API_PORT = Number(process.env.API_PORT || 3001);
const API_HOST = process.env.API_HOST || "0.0.0.0";

const server = app.listen(API_PORT, API_HOST, () => {
  const backendType = USE_JSON_STORAGE
    ? `JSON file (${JSON_DB_FILE})`
    : "SQLite (songs.db)";
  console.log(`${backendType} API bezi na http://${API_HOST}:${API_PORT}`);
});

server.on("error", (error) => {
  const message =
    error instanceof Error ? error.message : "Unknown backend server error";
  console.error(
    `[backend] failed to start on ${API_HOST}:${API_PORT} - ${message}`,
  );
  process.exit(1);
});
