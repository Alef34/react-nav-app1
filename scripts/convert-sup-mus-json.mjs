import fs from "node:fs";
import path from "node:path";

function extractJsonObject(rawContent) {
  const start = rawContent.indexOf("{");
  const end = rawContent.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Input file neobsahuje validny JSON objekt.");
  }

  return rawContent.slice(start, end + 1);
}

function parseInputFile(filePath) {
  const rawContent = fs.readFileSync(filePath, "utf8");
  const jsonOnly = extractJsonObject(rawContent);
  return JSON.parse(jsonOnly);
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function splitToVerses(songtext) {
  const normalized = normalizeString(songtext);
  if (!normalized) {
    return [];
  }

  // Split by empty lines so long texts are not collapsed into one huge stanza.
  const blocks = normalized
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (blocks.length === 0) {
    return [];
  }

  return blocks.map((text, index) => ({
    cisloS: `V${index + 1}`,
    textik: text,
  }));
}

function getSongNumber(rawSong, index) {
  const title = normalizeString(rawSong?.title);
  const titleMatch = title.match(/^(\d+)\.?\s+/);
  if (titleMatch) {
    return titleMatch[1];
  }

  const id = normalizeString(rawSong?.ID);
  if (/^\d+$/.test(id)) {
    return id;
  }

  return String(index + 1);
}

function convertSong(rawSong, index) {
  const title = normalizeString(rawSong?.title);
  const author = normalizeString(rawSong?.author);
  const verses = splitToVerses(rawSong?.songtext);

  return {
    cisloP: getSongNumber(rawSong, index),
    nazov: title,
    source: author,
    kategoria: "Folk",
    slohy: verses,
  };
}

function main() {
  const inputPath = process.argv[2];
  const outputPath =
    process.argv[3] || path.resolve("public", "sup_mus-converted.json");

  if (!inputPath) {
    console.error(
      "Usage: node scripts/convert-sup-mus-json.mjs <input-sup_mus.json> [output.json]",
    );
    process.exit(1);
  }

  const parsed = parseInputFile(inputPath);
  const sourceSongs = Array.isArray(parsed?.InetSongDb?.song)
    ? parsed.InetSongDb.song
    : [];

  const piesne = sourceSongs
    .filter((song) => song && typeof song === "object")
    .map(convertSong)
    .filter((song) => song.nazov.length > 0 && song.slohy.length > 0);

  const output = {
    verzia: "1",
    piesne,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");

  console.log(`Converted ${piesne.length} songs -> ${outputPath}`);
}

main();
