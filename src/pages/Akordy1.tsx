import { useLocation, useNavigate } from "react-router-dom";
import Song from "../components/Song";
import { useContext, useEffect, useState } from "react";
import {
  SettingsContext,
  SettingsContextType,
} from "../context/SettingsContext";
import { GiSettingsKnobs } from "react-icons/gi";

interface SongVerse {
  cisloS: string;
  textik: string;
}

interface Song {
  cisloP: string;
  nazov: string;
  slohy: SongVerse[];
}

export default function Akordy1() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    fontSize,
    colorScheme,
    showAkordy,
  } = useContext(SettingsContext) as SettingsContextType;
  const piesenka = location.state?.song;

  const [selectedView, setSelectedView] = useState(0);
  const effectiveFontSize = Math.min(80, Math.max(20, Number(fontSize) || 30));
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const responsiveScale = Math.min(
    1.6,
    Math.max(0.85, Math.min(windowSize.width / 1280, windowSize.height / 900))
  );
  const responsiveSongSize = Math.min(
    90,
    Math.max(18, Math.round(effectiveFontSize * responsiveScale))
  );
  const responsiveHeaderSize = Math.min(
    44,
    Math.max(22, Math.round(30 * responsiveScale))
  );
  const responsiveVerseBadge = Math.min(
    56,
    Math.max(24, Math.round(40 * responsiveScale))
  );

  function handleSettings() {
    navigate("modal", {
      state: { background: location, song: piesenka },
    });
  }
  function handleOpenProjector() {
    localStorage.setItem(
      "projector-song",
      JSON.stringify({
        song: piesenka,
        selectedView,
        showAkordy,
      })
    );
    window.open("/projector", "_blank", "noopener,noreferrer");
  }

  return (
    <div
      id="container"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 0,
        margin: 0,
        height: "100%",
        paddingTop: "20px",
        top: 0,
        left: 0,
        color: "black",
        backgroundColor: "gray",
      }}
    >
      <div
        id="nadpis-container"
        style={{
          //flex: 1, // Zaberá dostupný voľný priestor
          display: "flex",
          flexDirection: "row",
          backgroundColor: "transparent", // Nastav farbu pozadia, ak potrebuješ
          padding: 0, // Prispôsob vzhľad podľa potreby
          marginLeft: 10,
          marginRight: 10,
          marginTop: 0,
          borderRadius: 15,
        }}
      >
        <button
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "lightGray",
            border: "1px solid black",
            borderRadius: 15,
            color: "black",
            textAlign: "left",
            fontSize: responsiveHeaderSize,
            fontWeight: "bold",
          }}
          onClick={() => {
            navigate("/");
          }}
        >
          {piesenka?.cisloP}.{piesenka?.nazov}
        </button>

        <button style={getStyles(40).button} onClick={() => handleSettings()}>
        <GiSettingsKnobs
              style={{
                width: 40,
                height: 40,
                borderColor: "black",
                color: "black",
              }}
            />
        </button>
        <button
          style={{ ...getStyles(40).button, marginLeft: 8, fontWeight: "bold" }}
          onClick={handleOpenProjector}
          title="Otvor skladbu v projektore"
        >
          PROJ
        </button>
      </div>
      <div
        id="listBox"
        style={{
          flexGrow: 1, // Zaberá dostupný voľný priestor
          backgroundColor: "#e0e0e0", // Nastav farbu pozadia, ak potrebuješ
          padding: 0, // Prispôsob vzhľad podľa potreby
          margin: 10,
          marginTop: 10,
          marginBottom: 0,

          overflowY: "auto",
          borderRadius: 15,
          alignContent: "center",
          alignItems: "center",
          border: "1px solid black",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colorScheme == "dark" ? "black" : "white",
            color: colorScheme == "dark" ? "white" : "black",
            padding: 0,
            margin: 0,

            borderRadius: 15,
          }}
        >
          <Song
            text={piesenka.slohy[selectedView].textik}
            showChords={showAkordy}
            zadanaVelkost={responsiveSongSize}
          />
        </div>
      </div>
      <div
        id="slohy-container"
        style={{
          backgroundColor: "gray",
          display: "flex",
          flexDirection: "row",
          margin: 10,
        }}
      >
        {piesenka?.slohy
          .map((sloha: SongVerse) => sloha.cisloS)
          .map(function (_object: string, i: number) {
            function handleClick() {
              setSelectedView(i);
              /// console.log("BBBBBBBBB", object);
            }
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 0,
                  padding: 0,
                  border: "2px solid black",
                  borderRadius: 15,
                }}
                onClick={() => {
                  handleClick();
                  localStorage.setItem(
                    "projector-song",
                    JSON.stringify({
                      song: piesenka,
                      selectedView: i,
                      showAkordy,
                    })
                  );
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: selectedView === i ? "blue" : "lightGray",
                    color: selectedView === i ? "white" : "black",
                    borderRadius: 15,
                  }}
                >
                  <span
                    style={{
                      fontSize: responsiveVerseBadge,
                    }}
                  >
                    {piesenka?.slohy[i].cisloS}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
const getStyles = (velkost: number) => ({
  button: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: velkost,
    width: (2 * velkost).toString() + "px",
    height: (2 * velkost).toString() + "px",
    padding: velkost / 3,
  },
});
