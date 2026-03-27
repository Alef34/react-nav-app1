import { useMemo, useState } from "react";
//import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery } from "@tanstack/react-query";
import { GiSettingsKnobs } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
//import { localData } from "../localData";

import { Song, SongsData } from "../types/myTypes";
import { getSongs } from "../api/dataSources";
import { useVersionStore } from "../state/versionStore";

const ALL_CATEGORIES = "Vsetky";

function normalizeCategory(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function getSongCategory(song: Song): string {
  if (song.kategoria && song.kategoria.trim().length > 0) {
    return song.kategoria.trim();
  }

  if (song.source && /emanuel/i.test(song.source)) {
    return "Emanuel";
  }

  return "Nabozenske";
}


export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [selectedItem, setSelectedItem] = useState("");
  const { verziaDb } = useVersionStore();  


const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['songs', verziaDb],
    queryFn: () => getSongs(""),
  });

  const songsData: SongsData = isSuccess && data ? data : [];

  const categories = useMemo(() => {
    const fromData = songsData
      .map(getSongCategory)
      .filter((category) => category && category !== ALL_CATEGORIES);

    const dynamicCategories = Array.from(new Set(fromData)).sort((a, b) =>
      a.localeCompare(b)
    );

    return [ALL_CATEGORIES, ...dynamicCategories];
  }, [songsData]);

  function contains(song: Song, formatedQuery: string): boolean {
    return (
      song.cisloP.toLowerCase().includes(formatedQuery?.toLowerCase()) ||
      song.nazov.toLowerCase().includes(formatedQuery?.toLowerCase())
    );
  }

  const filteredData: SongsData = useMemo(() => {
    const formattedQuery = searchQuery.toLocaleLowerCase();
    const normalizedSelectedCategory = normalizeCategory(selectedCategory);

    return songsData.filter((song) => {
      const queryMatch = contains(song, formattedQuery);
      const normalizedSongCategory = normalizeCategory(getSongCategory(song));
      const categoryMatch =
        selectedCategory === ALL_CATEGORIES ||
        normalizedSongCategory === normalizedSelectedCategory;

      return queryMatch && categoryMatch;
    });
  }, [songsData, searchQuery, selectedCategory]);

  if (isLoading) return <div>Loading...</div>;
  if (!isSuccess) return <div>Error loading data</div>;

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

   function handleShowSetting() {
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
        id="filterBox"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginLeft: 10,
          marginRight: 10,
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            fontSize: 20,
            padding: "8px 12px",
            borderRadius: 10,
            border: "2px solid black",
            backgroundColor: "lightGray",
            color: "black",
          }}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <span style={{ fontSize: 20, fontWeight: 700 }}>
          {filteredData.length} / {songsData.length}
        </span>
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
          {filteredData?.map((item, index) => (
            <li
              key={`${item.cisloP}-${item.nazov}-${index}`}
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
