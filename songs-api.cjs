const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");

const db = new Database("songs.db");
const app = express();
const PLAYLIST_KEYS = ["Playlist 1", "Playlist 2", "Playlist 3"];
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
    slohy TEXT,
    updated_at TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS playlists (
    name TEXT PRIMARY KEY,
    song_ids TEXT NOT NULL,
    updated_at TEXT
  )
`);

const ensurePlaylistStmt = db.prepare(
  "INSERT OR IGNORE INTO playlists (name, song_ids, updated_at) VALUES (?, '[]', datetime('now'))",
);
PLAYLIST_KEYS.forEach((name) => {
  ensurePlaylistStmt.run(name);
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

// Hromadný import piesní (pole piesní v tele požiadavky)
app.post("/api/import", (req, res) => {
  const songs = req.body; // očakáva pole piesní
  if (!Array.isArray(songs)) {
    return res.status(400).json({ error: "Očakáva sa pole piesní." });
  }
  const stmt = db.prepare(`
    INSERT INTO songs (cislo_p, nazov, source, kategoria, poradie_sloh, slohy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  let count = 0;
  for (const song of songs) {
    stmt.run(
      song.cisloP,
      song.nazov,
      song.source,
      song.kategoria,
      JSON.stringify(song.poradieSloh ?? []),
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
  });
});

// Pridaj novú pieseň
app.post("/api/songs", (req, res) => {
  const { cislo_p, nazov, source, kategoria, poradie_sloh, slohy } = req.body;

  if (!String(cislo_p ?? "").trim() || !String(nazov ?? "").trim()) {
    return res.status(400).json({ error: "cislo_p a nazov su povinne." });
  }

  if (!Array.isArray(slohy) || slohy.length === 0) {
    return res.status(400).json({ error: "slohy musi byt neprzdne pole." });
  }

  const stmt = db.prepare(`
    INSERT INTO songs (cislo_p, nazov, source, kategoria, poradie_sloh, slohy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  const info = stmt.run(
    String(cislo_p).trim(),
    String(nazov).trim(),
    String(source ?? ""),
    String(kategoria ?? "Nabozenske"),
    JSON.stringify(Array.isArray(poradie_sloh) ? poradie_sloh : []),
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

  const { cislo_p, nazov, source, kategoria, poradie_sloh, slohy } = req.body;
  if (!String(cislo_p ?? "").trim() || !String(nazov ?? "").trim()) {
    return res.status(400).json({ error: "cislo_p a nazov su povinne." });
  }

  if (!Array.isArray(slohy) || slohy.length === 0) {
    return res.status(400).json({ error: "slohy musi byt neprzdne pole." });
  }

  const stmt = db.prepare(
    "UPDATE songs SET cislo_p = ?, nazov = ?, source = ?, kategoria = ?, poradie_sloh = ?, slohy = ?, updated_at = datetime('now') WHERE id = ?",
  );
  const result = stmt.run(
    String(cislo_p).trim(),
    String(nazov).trim(),
    String(source ?? ""),
    String(kategoria ?? "Nabozenske"),
    JSON.stringify(Array.isArray(poradie_sloh) ? poradie_sloh : []),
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

app.listen(3001, () => {
  console.log("SQLite API beží na http://localhost:3001");
});
