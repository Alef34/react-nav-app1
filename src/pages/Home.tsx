import { useState } from "react";
import { useNavigate } from "react-router-dom";
import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery } from "@tanstack/react-query";
import filter from "lodash.filter";

import novePiesne1 from "../components/Udaje1";

interface SongVerse {
  cisloS: string;
  textik: string;
}

interface Song {
  cisloP: string;
  nazov: string;
  slohy: SongVerse[];
}

type SongsData = Song[];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  //const [filteredData, setFilteredData] = useState<SongsData>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [nacitane, setNacitane] = useState(false);
  const [ktoraDB, setKtoraDB]= useState(novePiesne1);
  const [ktoraDBstr, setKtoraDBstr]= useState("novePiesne1");
  
  


  const {data, isLoading,  isSuccess} = useQuery<SongsData>({
    queryFn:()=>fetchDataTQ(ktoraDB),
    queryKey:["songs", ktoraDB] 
  });
 
  const [filteredData, setFilteredData] = useState<SongsData>(() => data || []);
  if (isLoading) return <div>Loading...</div>;
  if (!isSuccess) return <div>Error loading data</div>;
    
  if (isSuccess && data && !nacitane) {
    setNacitane(true);
    setFilteredData(data);
  }
     
  function handleSelectDb(){
    setNacitane(false);
    if (ktoraDBstr=="novePiesne1")
      {
        setKtoraDB(novePiesne);
        setKtoraDBstr("novePiesne");
      } 
    else
    {
      setKtoraDB(novePiesne1);
      setKtoraDBstr("novePiesne1");
    } 

    
  }

  function handleSelectDb1(){
    setNacitane(false);
    setKtoraDB(novePiesne1);
    
  }
  function contains(song: Song, formatedQuery: string): boolean {
   // return Object.values(song).some(value =>
    //  typeof value === 'string' && value.toLowerCase().includes(formatedQuery?.toLowerCase()));
 
    return song.cisloP.toLowerCase().includes(formatedQuery?.toLowerCase())||
      song.nazov.toLowerCase().includes(formatedQuery?.toLowerCase());
    
  }



  function vyfiltruj(filtr: string) {
    const formatedQuery = filtr?.toLocaleLowerCase();
    const filteredData = filter(data, (piesen: Song) => {
      return contains(piesen, formatedQuery);
    });
    setFilteredData(filteredData);
   // console.log("pocet - ", searchQuery);
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    vyfiltruj(e.target.value);
  };

  const handleClick = (item: Song) => {
      setSelectedItem(item.cisloP);
    
    const piesen: Song = {
      cisloP: item.cisloP,
      nazov: item.nazov,
      slohy: item.slohy,
    };
    navigate("/akordy", { state: piesen });
  };
  
  return (
    <div
      id="body"
      style={{
        margin: 0,
        padding: 0,
        height: "100%",
        width: "100%",
        paddingTop: "20px",
      }}
    >
      <div
        id="container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "98vh", // Rozdelí stránku na dve časti s rovnakou výškou
          width: "100vw",
          backgroundColor: "white",
          padding: 0,
          margin: 0,
          paddingTop: "20px",
          
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <div
          id="inputBox"
          style={{
            flex: 1, // Zaberá dostupný voľný priestor
            backgroundColor: "#f0f0f0", // Nastav farbu pozadia, ak potrebuješ
            margin: 10, // Prispôsob vzhľad podľa potreby
            padding: 0,
          }}
        >
          {/* TextInput komponent */}
          <input
            type="text"
            style={{
              width: "90%", // Zaberá celú šírku topSection
              height: "100%", // Prispôsob výšku podľa potreby
              fontSize: 20,
              backgroundColor: "lightGray",
              borderRadius: 15,
              padding: 0,
              color: "black",
            }}
            placeholder="zadaj číslo alebo textik..."
            onChange={handleSearch}
            value={searchQuery}
          />
          <button  onClick={handleSelectDb}>AA</button>
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
          }}
        >
          {/* Unsorted list komponent */}
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {filteredData.map((item) => (
              <li
                key={item.cisloP}
                onClick={() => handleClick(item)}
                style={{
                  fontSize: 25,
                  padding: "1px",
                  marginTop: "5px",
                  cursor: "pointer",
                  color: "black",
                  borderRadius: 15,

                  backgroundColor:
                    selectedItem === item.cisloP ? "orange" : "lightblue",
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
    </div>
  );
}
