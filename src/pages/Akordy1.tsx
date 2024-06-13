import { useLocation, useNavigate } from "react-router-dom";
import Song from "../components/Song";
import { useState } from "react";
import { TbLetterCaseLower, TbLetterCaseUpper } from "react-icons/tb";
import {  PiGuitarLight } from "react-icons/pi";
import { MdNotes } from "react-icons/md";

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

export default function Akordy1() {
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
            backgroundColor:"yellow"
          }}
      >
        <div
          id="nadpis-container"
          style={{
            //flex: 1, // Zaberá dostupný voľný priestor
            display:"flex",
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
                  borderRadius:15,
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
          

           
              <button style={getStyles(40).button} onClick={() => {
                                                        setShowAkordy(!showAkordy);
                                                        localData.set("showAkordy", !showAkordy);
                                                        }}
              >
                {showAkordy ? (
                  <MdNotes size={40} color="black" />
                ) : (
                  <PiGuitarLight size={40} color="black" />
                )}
              </button>
                      
              <button style={getStyles(40).button} onClick={() => {
                                                        setFontSize(fontSize - 5);
                                                        localData.set("fontSize", fontSize - 5);
                                                        }}
              >
                <TbLetterCaseLower size={30} color="black" />
              </button>
            
           
              <button style={getStyles(40).button} onClick={() => {
                                                        setFontSize(fontSize + 5);
                                                        localData.set("fontSize", fontSize + 5);
                                                        }}
              >
                <TbLetterCaseUpper size={30} color="black" />
              </button>
         
        </div>

        <div
          id="listBox"
          style={{
            flexGrow:1 , // Zaberá dostupný voľný priestor
            backgroundColor: "#e0e0e0", // Nastav farbu pozadia, ak potrebuješ
            padding: 0, // Prispôsob vzhľad podľa potreby
            margin: 10,
            marginTop: 10,
            marginBottom:0,

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
            id="slohy-container"
            style={{
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              margin:10,
              
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
const getStyles= (velkost: number) => ({
    button:{
        backgroundColor: "white",
        borderColor: "black",
        borderRadius: velkost,
        width: (2*velkost).toString()+"px",
        height: (2*velkost).toString()+"px",
        padding:velkost/3
    }
});