import { useState } from "react";
//import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery } from "@tanstack/react-query";
import filter from "lodash.filter";
import novePiesne1 from "../components/Udaje1";
import { GiHamburgerMenu, GiSettingsKnobs, GiToolbox } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
//import { localData } from "../localData";

import { useUserStore } from "../state/userStore";
import { Song, SongsData } from "../types/myTypes";
import { getSongs } from "../api/dataSources";
import { useVersionStore } from "../state/versionStore";



export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<SongsData>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [nacitane, setNacitane] = useState(false);
  

  const { setFilter } = useUserStore();
  const { mojFilter } = useUserStore();  

  
  const { verziaDb } = useVersionStore();  
  const {setVerziaDb} = useVersionStore();


const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['songs', verziaDb],
    queryFn: () => getSongs(""),
  });


  if (isLoading) return <div>Loading...</div>;
  if (!isSuccess) return <div>Error loading data</div>;

  if (isSuccess && data &&!nacitane ) {
    setNacitane(true);
    setFilteredData(data);
  }
  
  
  function contains(song: Song, formatedQuery: string): boolean {
    return (
      song.cisloP.toLowerCase().includes(formatedQuery?.toLowerCase()) ||
      song.nazov.toLowerCase().includes(formatedQuery?.toLowerCase())
    );
  }

  function vyfiltruj(filtr: string) {
    const formatedQuery = filtr?.toLocaleLowerCase();
    const filteredData:SongsData = filter(data, (piesen: Song) => {
      return contains(piesen, formatedQuery);
    });
    setFilteredData(filteredData);
  }

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    vyfiltruj(e.target.value);
  };

   function handleShowSetting() {
    //console.log("1");
    //setVerziaDb("100");
    
   // console.log("2");
     navigate("modal", { state: { background: location } });
   }

  const handleClickSkokNaPiesen = (item: Song) => {
    setSelectedItem(item.cisloP);
    const piesen: Song = {
      cisloP: item.cisloP,
      nazov: item.nazov,
      slohy: item.slohy,
    };
    navigate("/akordy", { state: { song: piesen } });
  };

  return (
    <div
      id="container"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 0,
        margin: 0,
        //height: "100%",
        paddingTop: "20px",
        top: 0,
        left: 0,
        color: "black",
        backgroundColor: "gray",
      }}
    >
      <div
        id="inputBox"
        style={{
          // Zaberá dostupný voľný priestor
          display: "flex",
          margin: 10, // Prispôsob vzhľad podľa potreby
          padding: 0,
          flexDirection: "row",
        }}
      >
        <input
          type="text"
          style={{
            fontSize: 30,
            flexGrow: 1,
            backgroundColor: "lightGray",
            borderRadius: 15,
            padding: "0 20px",
            color: "black",
          }}
          placeholder="zadaj číslo alebo textik..."
          onChange={handleSearch}
          value={searchQuery}
        />
        <button onClick={handleShowSetting} style={getStyles(40).button}>
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
          padding: 0, // Prispôsob vzhľad podľa potreby
          margin: 10,
          marginTop: 0,
          flexGrow: 1,
          borderRadius: 15,
        }}
      >
        {/* Unsorted list komponent */}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {filteredData?.map((item) => (
            <li
              key={item.cisloP}
              onClick={() => handleClickSkokNaPiesen(item)}
              style={{
                fontSize: 25,
                padding: "1px",
                marginTop: "5px",
                cursor: "pointer",
                color: "black",
                borderRadius: 15,

                backgroundColor:
                  selectedItem === item.cisloP ? "orange" : "orange",
                listStylePosition: "inside",
                border: "3px ridge black",
              }}
            >
              <div
                style={{
                  textAlign: "start",
                }}
              >
                <span style={{ margin: 5 }}>
                  {item.cisloP}. {item.nazov}
                </span>
              </div>
            </li>
          ))}
        </ul>
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
