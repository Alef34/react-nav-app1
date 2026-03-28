import fs from "node:fs";

const inputPath = "/Users/julojenis/Downloads/Converted.json";
const outputPath = "/Users/julojenis/Downloads/Converted-import-JKS.json";

const root = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const payload = Array.isArray(root?.content)
  ? root.content
  : Array.isArray(root)
  ? root
  : Array.isArray(root?.songs)
  ? root.songs
  : [];

function parseName(name, number) {
  const s = typeof name === "string" ? name.trim() : "";
  const n = number == null ? "" : String(number).trim();
  const m = s.match(/^(\d+)\.?\s*(.*)$/);

  return {
    cisloP: n || (m ? m[1] : ""),
    nazov: m ? (m[2] || "").trim() : s,
  };
}

const piesne = payload
  .filter((song) => song && typeof song === "object")
  .map((song) => {
    const { cisloP, nazov } = parseName(song.name, song.number);
    const strophes = Array.isArray(song.strophes) ? song.strophes : [];

    const slohy = strophes
      .map((text, idx) => ({
        cisloS: `V${idx + 1}`,
        textik: typeof text === "string" ? text.trim() : "",
      }))
      .filter((v) => v.textik.length > 0);

    return {
      cisloP,
      nazov,
      source: "",
      kategoria: "JKS",
      slohy,
    };
  })
  .filter((song) => song.nazov.length > 0 && song.slohy.length > 0);

const output = {
  verzia: "1",
  piesne,
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
console.log(`Saved: ${outputPath}`);
console.log(`Songs: ${piesne.length}`);
console.log(`First category: ${piesne[0]?.kategoria ?? "n/a"}`);
