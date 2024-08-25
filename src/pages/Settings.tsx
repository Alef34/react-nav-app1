import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { localData } from "../localData";
import {
  SettingsContext,
  SettingsContextType,
} from "../context/SettingsContext";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";

export const Modal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<string>("light");
  const [language, setLanguage] = useState<string>("en");

  const { ...myProps } = useContext(SettingsContext) as SettingsContextType;

  //const fs = localData.get("fontSize");

  function handleClick() {
    /*
    console.log("VP", localData.get("fontSize"));
    const val = localData.get("showAkordy");
    localData.remove("showAkordy");
    localData.set("showAkordy", !val);
    localData.set("fontSize", fs + 5);
    myProps.setFontSize(fs + 5);
    console.log(!val);
    */
    navigate(-1);
  }

  const background = location.state?.background;
  //console.log("sss", background);
  if (background) {
    return (
      <div className="mainWindow">
        <div className="settingsWindow">
          <div className="item item-1" style={{ fontSize: "x-large" }}>
            Nastavenia
          </div>
          <div className="item item-2">
            <div className="settWA">
              <div className="itemA item-1A" style={{ padding: "1em 0 0 0" }}>
                <label htmlFor="font-size" style={{ fontSize: "x-large" }}>
                  Font Size:
                </label>
                <input
                  type="range"
                  id="font-size"
                  min="20"
                  max="80"
                  value={myProps.fontSize}
                  onChange={(e) => myProps.setFontSize(Number(e.target.value))}
                />
              </div>
              <div className="itemA item-1A" style={{ fontSize: "x-large" }}>
                <label htmlFor="notifications" style={{ flex: 2 }}>
                  Zobraz akordy:
                </label>
                <input
                  type="checkbox"
                  id="notifications"
                  checked={myProps.showAkordy}
                  onChange={(e) => myProps.setShowAkordy(e.target.checked)}
                />
              </div>
              <div className="itemA item-1A">item2</div>
              <div className="itemA item-1A">item2</div>
            </div>
          </div>

          <div className="item item-3">
            <button className="btn" onClick={handleClick}>
              Navrat
            </button>
          </div>
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
