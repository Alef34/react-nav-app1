const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const db = new Database('songs.db');
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
console.log('Spúšťam backend...');
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


// Hromadný import piesní (pole piesní v tele požiadavky)
app.post('/api/import', (req, res) => {
  const songs = req.body; // očakáva pole piesní
  if (!Array.isArray(songs)) {
    return res.status(400).json({ error: 'Očakáva sa pole piesní.' });
  }
  const stmt = db.prepare(`
    INSERT INTO songs (cislo_p, nazov, source, kategoria, poradie_sloh, slohy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  let count = 0;
  for (const song of songs) {
    stmt.run(
      song.cisloP, song.nazov, song.source, song.kategoria,
      JSON.stringify(song.poradieSloh ?? []), JSON.stringify(song.slohy ?? [])
    );
    count++;
  }
  res.json({ imported: count });
});


app.delete('/api/songs', (req, res) => {
  db.prepare('DELETE FROM songs').run();
  res.json({ deleted: true });
});
// Získaj všetky piesne
app.get('/api/songs', (req, res) => {
  const rows = db.prepare('SELECT * FROM songs').all();
  // slohy a poradie_sloh sú uložené ako JSON stringy
  res.json(rows.map(row => ({
    ...row,
    slohy: JSON.parse(row.slohy),
    poradie_sloh: JSON.parse(row.poradie_sloh)
  })));
});

// Pridaj novú pieseň
app.post('/api/songs', (req, res) => {
  const { cislo_p, nazov, source, kategoria, poradie_sloh, slohy } = req.body;
  const stmt = db.prepare(`
    INSERT INTO songs (cislo_p, nazov, source, kategoria, poradie_sloh, slohy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  const info = stmt.run(
    cislo_p, nazov, source, kategoria,
    JSON.stringify(poradie_sloh), JSON.stringify(slohy)
  );
  res.json({ id: info.lastInsertRowid });
});

// ... ďalšie endpointy podľa potreby (GET /api/songs/:id, PUT, DELETE, atď.)

app.listen(3001, () => {
  console.log('SQLite API beží na http://localhost:3001');
});