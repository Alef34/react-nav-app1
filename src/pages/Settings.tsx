import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  SettingsContext,
  SettingsContextType,
} from "../context/SettingsContext";
import Checkbox from "@mui/material/Checkbox";

export const Modal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
  const label = { inputProps: { 'aria-label': 'Zobraz akordy' } };
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
                <Checkbox {...label} 
                  checked={myProps.showAkordy}
                  onChange={(e) => {
                    myProps.setShowAkordy(e.target.checked);
                 }}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 50 } }}/>
                
              </div>
              <div className="itemA item-1A" style={{ fontSize: "x-large" }}>
                <label htmlFor="color-scheme" style={{ marginRight: 10 }}>
                  Tema:
                </label>
                <select
                  id="color-scheme"
                  value={myProps.colorScheme}
                  onChange={(e) =>
                    myProps.setColorScheme(e.target.value as "light" | "dark")
                  }
                  style={{ fontSize: "x-large", padding: "6px 10px" }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="itemA item-1A" style={{ fontSize: "large" }}>
                Aktivna tema: {myProps.colorScheme === "dark" ? "Dark" : "Light"}
              </div>
            </div>
          </div>

          <div className="item item-3">
            <button
              className="btn"
              onClick={handleClick}
              style={{
                backgroundColor: "var(--color-surface-bg)",
                color: "var(--color-text)",
                border: "2px solid var(--color-border)",
                fontWeight: 700,
              }}
            >
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
