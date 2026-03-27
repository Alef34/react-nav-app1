import fs from "node:fs";
import path from "node:path";

function parseSongName(name) {
  if (typeof name !== "string") {
    return { cisloP: "", nazov: "" };
  }

  const trimmed = name.trim();
  const match = trimmed.match(/^(\d+)\.?\s*(.*)$/);
  if (!match) {
    return { cisloP: "", nazov: trimmed };
  }

  return {
    cisloP: match[1],
    nazov: (match[2] || "").trim(),
  };
}

function verseLabel(type, number) {
  const n = Number.isFinite(Number(number)) ? Number(number) : 1;

  switch (String(type || "").toLowerCase()) {
    case "verse":
      return `V${n}`;
    case "chorus":
      return n > 1 ? `R${n}` : "R";
    case "bridge":
      return n > 1 ? `B${n}` : "B";
    case "intro":
      return n > 1 ? `I${n}` : "I";
    case "outro":
      return n > 1 ? `O${n}` : "O";
    default:
      return n > 1 ? `S${n}` : "S";
  }
}

function tokenToText(token) {
  if (typeof token === "string") {
    return token;
  }

  if (!token || typeof token !== "object") {
    return "";
  }

  const chord = typeof token.chord === "string" && token.chord.trim() ? `[${token.chord.trim()}]` : "";
  const text = typeof token.text === "string" ? token.text : "";
  return `${chord}${text}`;
}

function buildVerseText(lyrics) {
  if (!Array.isArray(lyrics)) {
    return "";
  }

  return lyrics.map(tokenToText).join("");
}

function detectCategory(song) {
  const explicitCategory =
    typeof song?.kategoria === "string"
      ? song.kategoria
      : typeof song?.category === "string"
      ? song.category
      : "";

  if (explicitCategory.trim().length > 0) {
    return explicitCategory.trim();
  }

  const source = typeof song?.source === "string" ? song.source : "";
  const name = typeof song?.name === "string" ? song.name : "";
  const combined = `${source} ${name}`.toLowerCase();

  if (/emanuel/.test(combined)) {
    return "Emanuel";
  }

  if (/country/.test(combined)) {
    return "Country";
  }

  if (/folk/.test(combined)) {
    return "Folk";
  }

  return "Nabozenske";
}

function convertSong(sourceSong) {
  const { cisloP, nazov } = parseSongName(sourceSong?.name);
  const verses = Array.isArray(sourceSong?.verses) ? sourceSong.verses : [];
  const source = typeof sourceSong?.source === "string" ? sourceSong.source : "";

  return {
    cisloP,
    nazov,
    source,
    kategoria: detectCategory(sourceSong),
    slohy: verses
      .filter((v) => v && typeof v === "object")
      .map((v, idx) => ({
        cisloS: verseLabel(v.type, v.number ?? idx + 1),
        textik: buildVerseText(v.lyrics),
      }))
      .filter((v) => v.textik.trim().length > 0),
  };
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] || path.resolve("public", "songs.json");

  if (!inputPath) {
    console.error("Usage: node scripts/convert-songy-json.mjs <input-songy.json> [output-songs.json]");
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const source = JSON.parse(raw);

  const songs = Array.isArray(source?.songs) ? source.songs : [];
  const convertedSongs = songs
    .filter((s) => s && typeof s === "object" && typeof s.name === "string")
    .map(convertSong)
    .filter((s) => s.nazov.length > 0 && s.slohy.length > 0);

  const target = {
    verzia: String(source?.version ?? "1"),
    piesne: convertedSongs,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(target, null, 2), "utf8");

  console.log(`Converted ${convertedSongs.length} songs to ${outputPath}`);
}

main();
