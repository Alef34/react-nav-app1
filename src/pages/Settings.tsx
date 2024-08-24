import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { localData } from "../localData";
import { SettingsContext, SettingsContextType } from "../context/SettingsContext";

export const Modal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { fontSize, setFontSize, colorScheme, setColorScheme, showAkordy, setShowAkordy } = useContext(SettingsContext) as SettingsContextType;

  const fs = localData.get("fontSize");


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
