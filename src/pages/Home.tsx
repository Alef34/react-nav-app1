import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Song = {
  cisloP: string;
  nazov: string;
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Song[]>([]);
  const [selectedItem, setSelectedItem] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    //    console.log("som tu ", e.target.value);
    //    setSearchQuery(e.target.value);
    //    vyfiltruj(e.target.value);
    //    console.log("aky je sqarchQuery", searchQuery);

    const piesen: Song = {
      cisloP: "123",
      nazov: "Jane Doe",
    };
    navigate("/about", { state: piesen });
  };

  const handleClick = (item: Song) => {
    // Tvoja logika pre kliknutie na položku
    const piesen: Song = {
      cisloP: item.cisloP,
      nazov: item.nazov,
    };
    navigate("/about", { state: piesen });
    //  setSelectedItem(item.cisloP);
    // alert(item.cisloP);
    // alert(selectedItem);
    //console.log(item.cisloP);
    // navigate("./Detail.tsx");
  };

  return (
    <div style={styles.container}>
      <div style={styles.topSection}>
        {/* TextInput komponent */}
        <input
          type="text"
          style={styles.input}
          placeholder="zadaj číslo alebo textik..."
          onChange={handleSearch}
          value={searchQuery}
        />
      </div>
      <div style={styles.bottomSection}>
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
                color: "green",
                borderRadius: 15,
                backgroundColor:
                  selectedItem === item.cisloP ? "orange" : "transparent",
                listStylePosition: "inside",
                border: "3px ridge black",
              }}
            >
              <div>
                <div>
                  <p style={{ margin: 5 }}>
                    {item.cisloP}. {item.nazov}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh", // Rozdelí stránku na dve časti s rovnakou výškou
  },
  topSection: {
    flex: 1, // Zaberá dostupný voľný priestor
    backgroundColor: "#f0f0f0", // Nastav farbu pozadia, ak potrebuješ
    padding: 10, // Prispôsob vzhľad podľa potreby
  },
  input: {
    width: "100%", // Zaberá celú šírku topSection
    height: "100%", // Prispôsob výšku podľa potreby
    fontSize: 20,
    backgroundColor: "lightGray",
    borderRadius: 15,
    padding: 0,
    color: "black",
  },
  bottomSection: {
    flex: 10, // Zaberá dostupný voľný priestor
    backgroundColor: "#e0e0e0", // Nastav farbu pozadia, ak potrebuješ
    padding: 20, // Prispôsob vzhľad podľa potreby
    overflowY: "auto",
  },
  list: {
    listStyleType: "none", // Odstráň odrážky zo zoznamu, ak potrebuješ
    margin: 0, // Odstráň margin zoznamu, ak potrebuješ
    padding: 0, // Odstráň padding zoznamu, ak potrebuješ
  },
};
