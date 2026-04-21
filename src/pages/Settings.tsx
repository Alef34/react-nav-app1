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
  const label = { inputProps: { "aria-label": "Zobraz akordy" } };
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
                  Font Size (Home):
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
              <div className="itemA item-1A">
                <label
                  htmlFor="projector-font-size"
                  style={{ fontSize: "x-large" }}
                >
                  Font Size (Projektor):{" "}
                  {(myProps.projectorFontSizeMultiplier * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  id="projector-font-size"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={myProps.projectorFontSizeMultiplier}
                  onChange={(e) =>
                    myProps.setProjectorFontSizeMultiplier(
                      Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="itemA item-1A">
                <label
                  htmlFor="projector-bg-color"
                  style={{ fontSize: "x-large", marginRight: 10 }}
                >
                  Farba pozadia (Projektor):
                </label>
                <input
                  type="color"
                  id="projector-bg-color"
                  value={myProps.projectorBgColor}
                  onChange={(e) => myProps.setProjectorBgColor(e.target.value)}
                  style={{ width: 50, height: 40, cursor: "pointer" }}
                />
              </div>
              <div className="itemA item-1A">
                <label
                  htmlFor="projector-text-color"
                  style={{ fontSize: "x-large", marginRight: 10 }}
                >
                  Farba písma (Projektor):
                </label>
                <input
                  type="color"
                  id="projector-text-color"
                  value={myProps.projectorTextColor}
                  onChange={(e) =>
                    myProps.setProjectorTextColor(e.target.value)
                  }
                  style={{ width: 50, height: 40, cursor: "pointer" }}
                />
              </div>
              <div className="itemA item-1A" style={{ fontSize: "x-large" }}>
                <label htmlFor="notifications" style={{ flex: 2 }}>
                  Zobraz akordy (Home):
                </label>
                <Checkbox
                  {...label}
                  checked={myProps.showAkordy}
                  onChange={(e) => {
                    myProps.setShowAkordy(e.target.checked);
                  }}
                  sx={{ "& .MuiSvgIcon-root": { fontSize: 50 } }}
                />
              </div>
              <div className="itemA item-1A" style={{ fontSize: "x-large" }}>
                <label htmlFor="projector-chords" style={{ flex: 2 }}>
                  Zobraz akordy (Projektor):
                </label>
                <Checkbox
                  inputProps={{ "aria-label": "Zobraz akordy projektor" }}
                  id="projector-chords"
                  checked={myProps.showAkordyProjector}
                  onChange={(e) => {
                    myProps.setShowAkordyProjector(e.target.checked);
                  }}
                  sx={{ "& .MuiSvgIcon-root": { fontSize: 50 } }}
                />
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
