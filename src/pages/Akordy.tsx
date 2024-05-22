import { useLocation, useNavigate } from "react-router-dom";
import Song from "../components/Song";
import { useState } from "react";

import {
  LuArrowBigDownDash,
  LuArrowBigUpDash,
  LuMinus,
  LuPlus,
} from "react-icons/lu";

interface SongVerse {
  cisloS: string;
  textik: string;
}

interface Song {
  cisloP: string;
  nazov: string;
  slohy: SongVerse[];
}

const localData = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key: string) {
    const stored = localStorage.getItem(key);
    return stored == null ? undefined : JSON.parse(stored);
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

export default function Akordy() {
  const location = useLocation();
  const navigate = useNavigate();
  // Kontrola, či má location.state definovaný typ LocationState
  const piesenka: Song = location.state;
  const slohy = piesenka?.slohy.map((sloha) => sloha.cisloS);
  const [selectedView, setSelectedView] = useState(0);
  const [fontSize, setFontSize] = useState(
    () => localData.get("fontSize") || 0
  );
  const [showAkordy, setShowAkordy] = useState(localData.get("showAkordy"));

  return (
    <div
      id="body"
      style={{
        margin: 0,
        padding: 0,
        paddingTop: "40px",
        height: "100%",
        width: "100%",
        backgroundColor: "red",
      }}
    >
      <div
        id="container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh", // Rozdelí stránku na dve časti s rovnakou výškou
          width: "100vw",
          backgroundColor: "white",
          padding: 0,
          paddingTop: "20px",
          margin: 0,
          marginTop: 0,

          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <div
          id="nadpis-container"
          style={{
            flex: 1, // Zaberá dostupný voľný priestor
            backgroundColor: "transparent", // Nastav farbu pozadia, ak potrebuješ
            padding: 0, // Prispôsob vzhľad podľa potreby
            marginLeft: 10,
            marginRight: 10,
            marginTop: 10,
            borderRadius: 15,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: "white",

              height: "100%",
              padding: 0,
              marginLeft: 0,
              marginTop: 0,
              marginRight: 0,
              borderRadius: 15,
            }}
          >
            <div
              style={{
                flex: 10,
                borderRadius: 15,
                height: "100%",
                backgroundColor: "brown",
              }}
            >
              <button
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "lightGray",
                  border: "1px solid black",
                  color: "black",
                  textAlign: "left",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
                onClick={() => {
                  navigate("/");
                }}
              >
                {piesenka?.cisloP}.{piesenka?.nazov}
              </button>
            </div>

            <div
              style={{
                flex: 1,
                borderRadius: 15,
                height: "100%",
                backgroundColor: "gray",
              }}
            >
              <button
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "gray",
                  border: "1px solid black",
                }}
                onClick={() => {
                  setShowAkordy(!showAkordy);
                  localData.set("showAkordy", !showAkordy);
                }}
              >
                {showAkordy ? (
                  <LuMinus size={30} color="black" />
                ) : (
                  <LuPlus size={30} color="black" />
                )}
              </button>
            </div>

            <div
              style={{
                flex: 1,
                borderRadius: 15,
                height: "100%",
                backgroundColor: "gray",
              }}
            >
              <button
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "gray",
                  border: "1px solid black",
                }}
                onClick={() => {
                  setFontSize(fontSize - 5);
                  localData.set("fontSize", fontSize - 5);
                }}
              >
                <LuArrowBigDownDash size={30} color="black" />
                <pencil.tip.crop.circle.badge.plus
              </button>
            </div>
            <div
              style={{
                flex: 1,
                borderRadius: 15,
                height: "100%",
                backgroundColor: "gray",
              }}
            >
              <button
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "gray",
                  border: "1px solid black",
                }}
                onClick={() => {
                  setFontSize(fontSize + 5);
                  localData.set("fontSize", fontSize + 5);
                }}
              >
                <LuArrowBigUpDash size={30} color="black" />
              </button>
            </div>
          </div>
        </div>

        <div
          id="listBox"
          style={{
            flex: 10, // Zaberá dostupný voľný priestor
            backgroundColor: "#e0e0e0", // Nastav farbu pozadia, ak potrebuješ
            padding: 0, // Prispôsob vzhľad podľa potreby
            margin: 10,
            marginTop: 0,
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
              backgroundColor: "white",
              color: "black",
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
          id="slohacik"
          style={{
            flex: 1, // Zaberá dostupný voľný priestor
            backgroundColor: "transparent", // Nastav farbu pozadia, ak potrebuješ
            padding: 0, // Prispôsob vzhľad podľa potreby
            margin: 30,
            marginTop: 0,
            overflowY: "auto",
            borderRadius: 15,
          }}
        >
          <div
            id="slohy-container"
            style={{
              height: "100%",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {slohy?.map(function (object, i) {
              function handleClick() {
                setSelectedView(i);
                console.log(object.length);
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
                      backgroundColor:
                        selectedView === i ? "blue" : "transparent",
                      color: selectedView === i ? "white" : "black",
                      borderRadius: 15,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 25,
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
      </div>
    </div>
  );
}
