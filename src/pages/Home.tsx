import { useContext, useEffect, useMemo, useState } from "react";
//import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery } from "@tanstack/react-query";
import { GiSettingsKnobs } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
//import { localData } from "../localData";

import { Song, SongsData } from "../types/myTypes";
import { getSongs } from "../api/dataSources";
import { SettingsContext, SettingsContextType } from "../context/SettingsContext";
import { useVersionStore } from "../state/versionStore";

const ALL_CATEGORIES = "Vsetky";
const SEARCH_QUERY_STORAGE_KEY = "home.searchQuery";
const SELECTED_CATEGORY_STORAGE_KEY = "home.selectedCategory";

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

function normalizeSongNumber(value: string): string {
  return value.trim().replace(/\.$/, "").toLocaleLowerCase();
}

function parseCommaSeparatedQuery(query: string): string[] {
  return query
    .split(",")
    .map((part) => normalizeSongNumber(part))
    .filter((part) => part.length > 0);
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorScheme } = useContext(SettingsContext) as SettingsContextType;
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem(SEARCH_QUERY_STORAGE_KEY) ?? "";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem(SELECTED_CATEGORY_STORAGE_KEY) ?? ALL_CATEGORIES;
  });
  const [selectedItem, setSelectedItem] = useState("");
  const { verziaDb } = useVersionStore();

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["songs", verziaDb],
    queryFn: () => getSongs(""),
  });

  const songsData: SongsData = isSuccess && data ? data : [];

  const categories = useMemo(() => {
    const fromData = songsData
      .map(getSongCategory)
      .filter((category) => category && category !== ALL_CATEGORIES);

    const dynamicCategories = Array.from(new Set(fromData)).sort((a, b) =>
      a.localeCompare(b),
    );

    return [ALL_CATEGORIES, ...dynamicCategories];
  }, [songsData]);

  useEffect(() => {
    localStorage.setItem(SEARCH_QUERY_STORAGE_KEY, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem(SELECTED_CATEGORY_STORAGE_KEY, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (categories.includes(selectedCategory)) {
      return;
    }

    setSelectedCategory(ALL_CATEGORIES);
  }, [categories, selectedCategory]);

  function contains(song: Song, formatedQuery: string): boolean {
    return (
      song.cisloP.toLowerCase().includes(formatedQuery?.toLowerCase()) ||
      song.nazov.toLowerCase().includes(formatedQuery?.toLowerCase())
    );
  }

  const filteredData: SongsData = useMemo(() => {
    const formattedQuery = searchQuery.toLocaleLowerCase().trim();
    const commaSeparatedTerms = parseCommaSeparatedQuery(formattedQuery);
    const shouldUseCommaFilter =
      formattedQuery.includes(",") && commaSeparatedTerms.length > 0;
    const normalizedSelectedCategory = normalizeCategory(selectedCategory);

    return songsData.filter((song) => {
      const normalizedSongNumber = normalizeSongNumber(song.cisloP);
      const songTitleLower = song.nazov.toLocaleLowerCase();
      const queryMatch = shouldUseCommaFilter
        ? commaSeparatedTerms.some(
            (term) =>
              normalizedSongNumber === term || songTitleLower.includes(term),
          )
        : contains(song, formattedQuery);
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

  function handleGoToAdmin() {
    navigate("/admin-import");
  }

  function handleClearSearch() {
    setSearchQuery("");
    setSelectedItem("");
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

  const isDark = colorScheme === "dark";
  const pageBackground = isDark ? "#1f2933" : "#d6d8db";
  const panelBackground = isDark ? "#2f3b46" : "lightGray";
  const inputBackground = isDark ? "#3c4b57" : "lightGray";
  const surfaceBackground = isDark ? "#182028" : "white";
  const textColor = isDark ? "#f4f6f8" : "black";
  const mutedBorder = isDark ? "2px solid #d5dde5" : "2px solid black";
  const itemBackground = isDark ? "#374956" : "orange";
  const itemBorder = isDark ? "3px ridge #d5dde5" : "3px ridge black";

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
        color: textColor,
        backgroundColor: pageBackground,
      }}
    >
      <div
        id="inputBox"
        style={{
          // Zaberá dostupný voľný priestor
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: 10, // Prispôsob vzhľad podľa potreby
          padding: 0,
          flexDirection: "row",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 auto", minWidth: 0 }}>
          <input
            type="text"
            style={{
              fontSize: 30,
              width: "100%",
              height: 80,
              boxSizing: "border-box",
              backgroundColor: inputBackground,
              borderRadius: 15,
              padding: "0 54px 0 20px",
              color: textColor,
              border: mutedBorder,
            }}
            placeholder="zadaj text alebo mix (napr. 2,33,som)..."
            onChange={handleSearch}
            value={searchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <button
              onClick={handleClearSearch}
              aria-label="Vycistit filter"
              title="Vycistit filter"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 34,
                height: 34,
                borderRadius: 17,
                border: mutedBorder,
                backgroundColor: surfaceBackground,
                color: textColor,
                cursor: "pointer",
                fontSize: 22,
                lineHeight: 1,
                padding: 0,
              }}
            >
              X
            </button>
          )}
        </div>
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
        <button
          onClick={handleGoToAdmin}
          style={{
            fontSize: 20,
            fontWeight: 700,
            padding: "0 16px",
            borderRadius: 14,
            border: mutedBorder,
            backgroundColor: surfaceBackground,
            color: textColor,
            cursor: "pointer",
          }}
        >
          Admin
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
            border: mutedBorder,
            backgroundColor: panelBackground,
            color: textColor,
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
          backgroundColor: surfaceBackground,
          color: textColor,
          border: mutedBorder,
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
                color: textColor,
                borderRadius: 15,

                backgroundColor:
                  selectedItem === item.cisloP ? itemBackground : itemBackground,
                listStylePosition: "inside",
                border: itemBorder,
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
