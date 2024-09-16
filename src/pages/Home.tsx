import { useState } from "react";
import novePiesne, { fetchDataTQ } from "../components/Udaje";
import { useQuery } from "@tanstack/react-query";
import filter from "lodash.filter";
import novePiesne1 from "../components/Udaje1";
import { GiHamburgerMenu } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";

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

interface Udaje{
  verzia:string;
  piesne:Song[];
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  //const [filteredData, setFilteredData] = useState<SongsData>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [nacitane, setNacitane] = useState(false);
  const [ktoraDB, setKtoraDB] = useState(novePiesne);
  const [ktoraDBstr, setKtoraDBstr] = useState("novePiesne");

  const { data, isLoading, isSuccess } = useQuery<Udaje>({
    queryFn: () => fetchDataTQ(ktoraDB),
    queryKey: ["songs", ktoraDB],
  });

  const [filteredData, setFilteredData] = useState<SongsData>(() => data?.piesne || []);
  const [verzia, setVerzia] = useState<string>(() => data?.verzia || "");
  if (isLoading) return <div>Loading...</div>;
  if (!isSuccess) return <div>Error loading data</div>;

  //console.log("isSUcc-", isSuccess);
  //console.log("data-", data);
  //console.log("nacitane-", nacitane);

  if (isSuccess && data && !nacitane) {
    setNacitane(true);
    setVerzia(data.verzia);
    console.log("FF",data.verzia);
    localStorage.removeItem("apiData");
    localStorage.setItem("apiData", JSON.stringify(data));
    console.log("halooo");
    //console.log(data);
    setFilteredData(data.piesne);
  } else {
    //console.log("tuuuuu", isSuccess && !nacitane);
    localStorage.removeItem("apiData");
    localStorage.setItem("apiData", JSON.stringify(data));
  }
  function handleSelectDb() {
    setNacitane(false);
    if (ktoraDBstr == "novePiesne1") {
      setKtoraDB(novePiesne);
      setKtoraDBstr("novePiesne");
      //console.log("0");
    } else {
      setKtoraDB(novePiesne1);
      setKtoraDBstr("novePiesne1");
      //console.log("1");
    }
  }

  function handleSelectDb1() {
    //console.log("QQSS", { background: location });
    navigate("modal", { state: { background: location } });
  }

  function contains(song: Song, formatedQuery: string): boolean {
    // return Object.values(song).some(value =>
    //  typeof value === 'string' && value.toLowerCase().includes(formatedQuery?.toLowerCase()));

    return (
      song.cisloP.toLowerCase().includes(formatedQuery?.toLowerCase()) ||
      song.nazov.toLowerCase().includes(formatedQuery?.toLowerCase())
    );
  }

  function vyfiltruj(filtr: string) {
    const formatedQuery = filtr?.toLocaleLowerCase();
    console.log("ANo:", data?.verzia);
    const filteredData:SongsData = filter(data?.piesne, (piesen: Song) => {
      return contains(piesen, formatedQuery);
    });
    setFilteredData(filteredData);
    // //console.log("pocet - ", searchQuery);
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
    //localStorage.removeItem("colorScheme");
    navigate("/akordy", { state: { song: piesen } });
    /*
    const queryString = new URLSearchParams({
      song: JSON.stringify(piesen),
    }).toString();
    navigate(`/akordy?${queryString}`);
 
 */
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
    ><div>hhh{verzia}</div>
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
        <button onClick={handleSelectDb1} style={getStyles(40).button}></button>
        <button onClick={handleSelectDb} style={getStyles(40).button}>
          <GiHamburgerMenu
            style={{
              width: 20,
              height: 20,
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
