import React, { createContext, useState, ReactNode } from "react";
import { localData } from "../localData";

type ColorScheme = "light" | "dark";

export type SettingsContextType = {
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  projectorFontSizeMultiplier: number;
  setProjectorFontSizeMultiplier: React.Dispatch<React.SetStateAction<number>>;
  projectorBgColor: string;
  setProjectorBgColor: React.Dispatch<React.SetStateAction<string>>;
  projectorTextColor: string;
  setProjectorTextColor: React.Dispatch<React.SetStateAction<string>>;
  colorScheme: ColorScheme;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorScheme>>;
  showAkordy: boolean;
  setShowAkordy: React.Dispatch<React.SetStateAction<boolean>>;
  verzia: string;
  setVerzia: React.Dispatch<React.SetStateAction<string>>;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

function normalizeFontSize(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 30;
  }

  return Math.min(80, Math.max(20, numeric));
}

function normalizeProjectorFontSizeMultiplier(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 1;
  }

  return Math.min(1.5, Math.max(0.7, numeric));
}

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<number>(() =>
    normalizeFontSize(localData.get("fontSize")),
  );
  const [projectorFontSizeMultiplier, setProjectorFontSizeMultiplier] =
    useState<number>(() =>
      normalizeProjectorFontSizeMultiplier(
        localData.get("projectorFontSizeMultiplier"),
      ),
    );
  const [projectorBgColor, setProjectorBgColor] = useState<string>(
    () => (localData.get("projectorBgColor") as string) || "black",
  );
  const [projectorTextColor, setProjectorTextColor] = useState<string>(
    () => (localData.get("projectorTextColor") as string) || "white",
  );
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    () => (localData.get("colorScheme") as ColorScheme) || "dark",
  );
  const [showAkordy, setShowAkordy] = useState<boolean>(() =>
    Boolean(localData.get("showAkordy")),
  );
  const [verzia, setVerzia] = useState<string>(
    () => localData.get("verzia") || "",
  );

  React.useEffect(() => {
    localData.set("fontSize", normalizeFontSize(fontSize));
  }, [fontSize]);

  React.useEffect(() => {
    localData.set(
      "projectorFontSizeMultiplier",
      normalizeProjectorFontSizeMultiplier(projectorFontSizeMultiplier),
    );
  }, [projectorFontSizeMultiplier]);

  React.useEffect(() => {
    localData.set("projectorBgColor", projectorBgColor);
  }, [projectorBgColor]);

  React.useEffect(() => {
    localData.set("projectorTextColor", projectorTextColor);
  }, [projectorTextColor]);

  React.useEffect(() => {
    localData.set("verzia", verzia);
  }, [verzia]);

  React.useEffect(() => {
    localData.set("colorScheme", colorScheme);

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", colorScheme);
    }
  }, [colorScheme]);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", colorScheme);
    }
  }, []);

  React.useEffect(() => {
    localData.set("showAkordy", showAkordy);
  }, [showAkordy]);

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        projectorFontSizeMultiplier,
        setProjectorFontSizeMultiplier,
        projectorBgColor,
        setProjectorBgColor,
        projectorTextColor,
        setProjectorTextColor,
        colorScheme,
        setColorScheme,
        showAkordy,
        setShowAkordy,
        verzia,
        setVerzia,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
