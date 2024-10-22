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

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState(() => localData.get("fontSize") || 0);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => (localData.get("colorScheme") as ColorScheme) || "dark");
  const [showAkordy, setShowAkordy] = useState(() => localData.get("showAkordy") || false);
  const [verzia, setVerzia] = useState<string>(() =>localData.get("verzia") || "")

  React.useEffect(() => {
    localData.set("fontSize", fontSize);
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
