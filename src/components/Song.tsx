import React from "react";

interface Chord {
  chord: string;
}

interface Lyrics {
  text: string;
}

type SongPart = Chord | Lyrics;

interface SongLineProps {
  parts: SongPart[];
  showChords: boolean; // Nový prop pre určenie zobrazenia akordov
  velkost: number;
}

function parseSong(text: string): SongPart[][] {
  return text.split("\n").map((line) => {
    const parts: SongPart[] = [];
    let currentIndex = 0;

    line.replace(/\[(.*?)\]/g, (match, chord, index) => {
      // Pridať časť s textom pred akordom
      if (index > currentIndex) {
        parts.push({ text: line.substring(currentIndex, index) });
      }
      // Pridať akord
      parts.push({ chord });
      currentIndex = index + match.length;
      return match;
    });

    // Pridať zvyšný text po poslednom akorde
    if (currentIndex < line.length) {
      parts.push({ text: line.substring(currentIndex) });
    }

    return parts;
  });
}

const SongLine: React.FC<SongLineProps> = ({ parts, showChords, velkost }) => (
  <div style={getStyles(velkost).line}>
    {showChords ? (
      parts.map((part, index) =>
        "chord" in part ? (
          <span
            key={index}
            style={getStyles(velkost).chord}
          >{`${part.chord}`}</span>
        ) : (
          <span key={index} style={getStyles(velkost).lyrics}>
            {part.text}
          </span>
        ),
      )
    ) : (
      <span style={getStyles(velkost).lyricsNoChords}>
        {parts.map((part) => ("text" in part ? part.text : "")).join("")}
      </span>
    )}
  </div>
);

interface SongProps {
  text: string;
  showChords?: boolean; // Nový prop pre určenie zobrazenia akordov
  zadanaVelkost: number;
}

const Song: React.FC<SongProps> = ({ text, showChords, zadanaVelkost }) => {
  const songData = parseSong(text);

  return (
    <div style={getStyles(zadanaVelkost).songRoot}>
      {songData.map((parts, index) => (
        <SongLine
          key={index}
          parts={parts}
          showChords={showChords ?? false}
          velkost={zadanaVelkost}
        />
      ))}
    </div>
  );
};

const getStyles = (velkost: number) => ({
  songRoot: {
    width: "100%",
  },
  line: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    textAlign: "center" as const,
    margin: "10px",
    flexWrap: "wrap" as const,
    //border: "solid 2px black",
  },
  chord: {
    fontWeight: "normal",
    color: "blue",
    fontSize: 20 + velkost,
    //marginBottom: "1em",
    marginTop: -2 * velkost,
    paddingBottom: "1em",
    //  border: "solid 2px red",
    height: "1em",
  },
  lyrics: {
    fontSize: 20 + velkost,
    //border: "solid 2px black",
    color: "#fff",
    fontWeight: 700,
    whiteSpace: "pre-wrap",
  },
  lyricsNoChords: {
    fontSize: 20 + velkost,
    color: "#fff",
    fontWeight: 700,
    whiteSpace: "pre-wrap" as const,
    textAlign: "center" as const,
    width: "100%",
  },
});

export default Song;
