import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Song from "../components/Song";
import { useContext, useState } from "react";
import {
  TbColorFilter,
  TbLetterCaseLower,
  TbLetterCaseUpper,
} from "react-icons/tb";
import { PiGuitarLight } from "react-icons/pi";
import { MdNotes } from "react-icons/md";
import { localData } from "../localData";
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

type ColorScheme = "dark" | "light";

export default function Akordy1() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    fontSize,
    setFontSize,
    colorScheme,
    setColorScheme,
    showAkordy,
    setShowAkordy,
  } = useContext(SettingsContext) as SettingsContextType;
  const piesenka = location.state?.song;

  const [selectedView, setSelectedView] = useState(0);

  function handleSettings() {
    navigate("modal", {
      state: { background: location, song: piesenka },
    });
  }
  function handleColorScheme() {
    if (colorScheme == "light") {
      setColorScheme("dark");
      localData.set("colorScheme", "dark");
    } else {
      setColorScheme("light");
      localData.set("colorScheme", "light");
    }
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
            fontSize: 30,
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
            zadanaVelkost={fontSize}
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
          .map((sloha) => sloha.cisloS)
          .map(function (object, i) {
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
                      fontSize: 40,
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
