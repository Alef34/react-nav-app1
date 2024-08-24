import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

export const Modal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fs = localData.get("fontSize");
  const [fontSize, setFontSize] = useState(
    () => localData.get("fontSize") || 0
  );

  function handleClick() {
    console.log("VP", localData.get("fontSize"));
    const val = localData.get("showAkordy");

    localData.remove("showAkordy");
    localData.set("showAkordy", !val);
    localData.set("fontSize", fs + 5);
    setFontSize(fs + 5);
    console.log(!val);
    navigate(-1);
  }

  const background = location.state?.background;
  //console.log("sss", background);
  if (background) {
    return (
      <div className="modalDiv">
        <div className="modal">
          <h1>Nastavenia</h1>
          <h2>{fs}</h2>
          <button onClick={handleClick}>Návrat</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>No background data available</h1>
    </div>
  );
};
