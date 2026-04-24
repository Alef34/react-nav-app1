const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");

const db = new Database("songs.db");
const app = express();
const PLAYLIST_KEYS = ["Playlist 1", "Playlist 2", "Playlist 3"];
const DEFAULT_SETTINGS = {
  fontSize: 30,
  projectorFontSizeMultiplier: 1,
  projectorBgColor: "#000000",
  projectorTextColor: "#ffffff",
  colorScheme: "dark",
  showAkordy: false,
  showAkordyProjector: false,
  verzia: "",
};
app.use(cors());
app.use(express.json({ limit: "10mb" }));
console.log("Spúšťam backend...");
// Inicializácia tabuľky
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
} catch (error) {
  // Ignore if column already exists.
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
    colorScheme:
      safe.colorScheme === "light" || safe.colorScheme === "dark"
        ? safe.colorScheme
        : DEFAULT_SETTINGS.colorScheme,
    showAkordy: Boolean(safe.showAkordy),
    showAkordyProjector: Boolean(safe.showAkordyProjector),
    verzia: String(safe.verzia ?? DEFAULT_SETTINGS.verzia),
  };
}

function loadSettingsFromDb() {
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
      // Keep default value when stored JSON is invalid.
    }
  });

  return normalizeSettings(merged);
}

app.get("/api/settings", (_req, res) => {
  const settings = loadSettingsFromDb();
  res.json(settings);
});

app.put("/api/settings", (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return res
      .status(400)
      .json({ error: "Neplatny format settings payloadu." });
  }

  const current = loadSettingsFromDb();
  const merged = normalizeSettings({ ...current, ...incoming });
  const upsertStmt = db.prepare(
    "INSERT INTO app_settings (setting_key, setting_value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')",
  );

  const transaction = db.transaction(() => {
    Object.entries(merged).forEach(([key, value]) => {
      upsertStmt.run(key, JSON.stringify(value));
    });
  });

  transaction();
  res.json(merged);
});

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

app.get("/api/playlists", (_req, res) => {
  const rows = db
    .prepare("SELECT name, song_ids FROM playlists WHERE name IN (?, ?, ?)")
    .all(...PLAYLIST_KEYS);

  const payload = {
    "Playlist 1": [],
    "Playlist 2": [],
    "Playlist 3": [],
  };

  rows.forEach((row) => {
    try {
      payload[row.name] = parsePlaylistSongIds(JSON.parse(row.song_ids));
    } catch {
      payload[row.name] = [];
    }
  });

  res.json(payload);
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
  res.json({ updated: true });
});

// PATCH: aktualizuj poradie_sloh podľa id
app.patch("/api/songs/:id/poradie", (req, res) => {
  const id = Number(req.params.id);
  const { poradie_sloh } = req.body;
  if (!Array.isArray(poradie_sloh)) {
    return res.status(400).json({ error: "poradie_sloh musí byť pole." });
  }
  const stmt = db.prepare(
    "UPDATE songs SET poradie_sloh = ?, updated_at = datetime('now') WHERE id = ?",
  );
  const result = stmt.run(JSON.stringify(poradie_sloh), id);
  if (result.changes === 0) {
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

  const row = db
    .prepare("SELECT verse_font_multipliers FROM songs WHERE id = ?")
    .get(id);
  if (!row) {
    return res.status(404).json({ error: "Skladba neexistuje." });
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
  res.json({ updated: true, verse_font_multipliers: current });
});

// Hromadný import piesní (pole piesní v tele požiadavky)
app.post("/api/import", (req, res) => {
  const songs = req.body; // očakáva pole piesní
  if (!Array.isArray(songs)) {
    return res.status(400).json({ error: "Očakáva sa pole piesní." });
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
    count++;
  }
  res.json({ imported: count });
});

app.delete("/api/songs", (req, res) => {
  db.prepare("DELETE FROM songs").run();
  res.json({ deleted: true });
});
// Získaj všetky piesne
app.get("/api/songs", (req, res) => {
  const rows = db.prepare("SELECT * FROM songs").all();
  // slohy a poradie_sloh sú uložené ako JSON stringy
  res.json(
    rows.map((row) => ({
      ...row,
      slohy: JSON.parse(row.slohy),
      poradie_sloh: JSON.parse(row.poradie_sloh),
      verse_font_multipliers: JSON.parse(row.verse_font_multipliers || "{}"),
    })),
  );
});

// Získaj jednu pieseň podľa ID
app.get("/api/songs/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Neplatne id." });
  }

  const row = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);
  if (!row) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json({
    ...row,
    slohy: JSON.parse(row.slohy),
    poradie_sloh: JSON.parse(row.poradie_sloh),
    verse_font_multipliers: JSON.parse(row.verse_font_multipliers || "{}"),
  });
});

// Pridaj novú pieseň
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

  const stmt = db.prepare(`
    INSERT INTO songs (cislo_p, nazov, source, kategoria, poradie_sloh, verse_font_multipliers, slohy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  const info = stmt.run(
    String(cislo_p).trim(),
    String(nazov).trim(),
    String(source ?? ""),
    String(kategoria ?? "Nabozenske"),
    JSON.stringify(Array.isArray(poradie_sloh) ? poradie_sloh : []),
    JSON.stringify(
      verse_font_multipliers &&
        typeof verse_font_multipliers === "object" &&
        !Array.isArray(verse_font_multipliers)
        ? verse_font_multipliers
        : {},
    ),
    JSON.stringify(slohy),
  );
  res.json({ id: info.lastInsertRowid });
});

// Uprav skladbu podľa ID
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

  const stmt = db.prepare(
    "UPDATE songs SET cislo_p = ?, nazov = ?, source = ?, kategoria = ?, poradie_sloh = ?, verse_font_multipliers = ?, slohy = ?, updated_at = datetime('now') WHERE id = ?",
  );
  const result = stmt.run(
    String(cislo_p).trim(),
    String(nazov).trim(),
    String(source ?? ""),
    String(kategoria ?? "Nabozenske"),
    JSON.stringify(Array.isArray(poradie_sloh) ? poradie_sloh : []),
    JSON.stringify(
      verse_font_multipliers &&
        typeof verse_font_multipliers === "object" &&
        !Array.isArray(verse_font_multipliers)
        ? verse_font_multipliers
        : {},
    ),
    JSON.stringify(slohy),
    id,
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json({ updated: true });
});

// Vymaž jednu skladbu podľa ID
app.delete("/api/songs/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "Neplatne id." });
  }

  const result = db.prepare("DELETE FROM songs WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Skladba neexistuje." });
  }

  res.json({ deleted: true });
});

// ... ďalšie endpointy podľa potreby (GET /api/songs/:id, PUT, DELETE, atď.)

const API_PORT = Number(process.env.API_PORT || 3001);
const API_HOST = process.env.API_HOST || "0.0.0.0";

const server = app.listen(API_PORT, API_HOST, () => {
  console.log(`SQLite API beží na http://${API_HOST}:${API_PORT}`);
});

server.on("error", (error) => {
  const message =
    error instanceof Error ? error.message : "Unknown backend server error";
  console.error(`[backend] failed to start on ${API_HOST}:${API_PORT} - ${message}`);
  process.exit(1);
});
