import { height } from "@fortawesome/free-brands-svg-icons/fa42Group";
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
    {parts.map((part, index) =>
      "chord" in part ? (
        showChords ? (
          <span
            key={index}
            style={getStyles(velkost).chord}
          >{`${part.chord}`}</span>
        ) : (
          <React.Fragment key={index}>
            <p></p>
          </React.Fragment>
        )
      ) : (
        <span key={index} style={getStyles(velkost).lyrics}>
          {part.text}
        </span>
      )
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
    <div>
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
  line: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "10px",
    flexWrap: "wrap",
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
    color: "gray",
  },
});

export default Song;
