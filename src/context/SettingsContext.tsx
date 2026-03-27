import React, { createContext, useState, useContext, ReactNode } from 'react';
import { localData } from '../localData';

type ColorScheme = 'light' | 'dark';

export type SettingsContextType = {
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  colorScheme: ColorScheme;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorScheme>>;
  showAkordy: boolean;
  setShowAkordy: React.Dispatch<React.SetStateAction<boolean>>;
  verzia: string;
  setVerzia: React.Dispatch<React.SetStateAction<string>>;

}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function normalizeFontSize(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 30;
  }

  return Math.min(80, Math.max(20, numeric));
}

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<number>(() => normalizeFontSize(localData.get("fontSize")));
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => (localData.get("colorScheme") as ColorScheme) || "dark");
  const [showAkordy, setShowAkordy] = useState<boolean>(() => Boolean(localData.get("showAkordy")));
  const [verzia, setVerzia] = useState<string>(() =>localData.get("verzia") || "")

  React.useEffect(() => {
    localData.set("fontSize", normalizeFontSize(fontSize));
  }, [fontSize]);

  React.useEffect(() => {
    localData.set("verzia", verzia);
  }, [verzia]);

  React.useEffect(() => {
    localData.set("colorScheme", colorScheme);
  }, [colorScheme]);

  React.useEffect(() => {
    localData.set("showAkordy", showAkordy);
  }, [showAkordy]);

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize, colorScheme, setColorScheme, showAkordy, setShowAkordy, verzia, setVerzia }}>
      {children}
    </SettingsContext.Provider>
  );
}
