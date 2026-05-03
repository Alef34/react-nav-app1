import React, {
  createContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";

type ColorScheme = "light" | "dark";

export type SettingsContextType = {
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  chordSizeMultiplier: number;
  setChordSizeMultiplier: React.Dispatch<React.SetStateAction<number>>;
  projectorFontSizeMultiplier: number;
  setProjectorFontSizeMultiplier: React.Dispatch<React.SetStateAction<number>>;
  projectorBgColor: string;
  setProjectorBgColor: React.Dispatch<React.SetStateAction<string>>;
  projectorTextColor: string;
  setProjectorTextColor: React.Dispatch<React.SetStateAction<string>>;
  homeChordColor: string;
  setHomeChordColor: React.Dispatch<React.SetStateAction<string>>;
  colorScheme: ColorScheme;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorScheme>>;
  showAkordy: boolean;
  setShowAkordy: React.Dispatch<React.SetStateAction<boolean>>;
  showAkordyProjector: boolean;
  setShowAkordyProjector: React.Dispatch<React.SetStateAction<boolean>>;
  verzia: string;
  setVerzia: React.Dispatch<React.SetStateAction<string>>;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

type StoredSettings = {
  fontSize: number;
  chordSizeMultiplier: number;
  projectorFontSizeMultiplier: number;
  projectorBgColor: string;
  projectorTextColor: string;
  homeChordColor: string;
  colorScheme: ColorScheme;
  showAkordy: boolean;
  showAkordyProjector: boolean;
  verzia: string;
};

const DEFAULT_SETTINGS: StoredSettings = {
  fontSize: 30,
  chordSizeMultiplier: 1,
  projectorFontSizeMultiplier: 1,
  projectorBgColor: "#000000",
  projectorTextColor: "#ffffff",
  homeChordColor: "#0000ff",
  colorScheme: "dark",
  showAkordy: false,
  showAkordyProjector: false,
  verzia: "",
};

function getOfflineApiSettingsUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3001/api/settings";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:3001/api/settings`;
}

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

function normalizeChordSizeMultiplier(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 1;
  }

  return Number(Math.min(1.6, Math.max(0.7, numeric)).toFixed(2));
}

function normalizeHexColor(value: unknown, fallback: string): string {
  const color = String(value ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }
  return fallback;
}

function normalizeStoredSettings(
  raw: Partial<StoredSettings> | unknown,
): StoredSettings {
  const safe =
    raw && typeof raw === "object" ? (raw as Partial<StoredSettings>) : {};
  return {
    fontSize: normalizeFontSize(safe.fontSize),
    chordSizeMultiplier: normalizeChordSizeMultiplier(safe.chordSizeMultiplier),
    projectorFontSizeMultiplier: normalizeProjectorFontSizeMultiplier(
      safe.projectorFontSizeMultiplier,
    ),
    projectorBgColor: normalizeHexColor(
      safe.projectorBgColor,
      DEFAULT_SETTINGS.projectorBgColor,
    ),
    projectorTextColor: normalizeHexColor(
      safe.projectorTextColor,
      DEFAULT_SETTINGS.projectorTextColor,
    ),
    homeChordColor: normalizeHexColor(
      safe.homeChordColor,
      DEFAULT_SETTINGS.homeChordColor,
    ),
    colorScheme: safe.colorScheme === "light" ? "light" : "dark",
    showAkordy: Boolean(safe.showAkordy),
    showAkordyProjector: Boolean(safe.showAkordyProjector),
    verzia: String(safe.verzia ?? ""),
  };
}

async function fetchSettingsFromApi(): Promise<StoredSettings> {
  const response = await fetch(getOfflineApiSettingsUrl());
  if (!response.ok) {
    throw new Error(`Nacitavanie settings zlyhalo (${response.status}).`);
  }
  const raw = (await response.json()) as Partial<StoredSettings>;
  return normalizeStoredSettings(raw);
}

async function saveSettingsToApi(settings: StoredSettings): Promise<void> {
  const response = await fetch(getOfflineApiSettingsUrl(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`Ulozenie settings zlyhalo (${response.status}).`);
  }
}

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<number>(DEFAULT_SETTINGS.fontSize);
  const [chordSizeMultiplier, setChordSizeMultiplier] = useState<number>(
    DEFAULT_SETTINGS.chordSizeMultiplier,
  );
  const [projectorFontSizeMultiplier, setProjectorFontSizeMultiplier] =
    useState<number>(DEFAULT_SETTINGS.projectorFontSizeMultiplier);
  const [projectorBgColor, setProjectorBgColor] = useState<string>(
    DEFAULT_SETTINGS.projectorBgColor,
  );
  const [projectorTextColor, setProjectorTextColor] = useState<string>(
    DEFAULT_SETTINGS.projectorTextColor,
  );
  const [homeChordColor, setHomeChordColor] = useState<string>(
    DEFAULT_SETTINGS.homeChordColor,
  );
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    DEFAULT_SETTINGS.colorScheme,
  );
  const [showAkordy, setShowAkordy] = useState<boolean>(
    DEFAULT_SETTINGS.showAkordy,
  );
  const [showAkordyProjector, setShowAkordyProjector] = useState<boolean>(
    DEFAULT_SETTINGS.showAkordyProjector,
  );
  const [verzia, setVerzia] = useState<string>(DEFAULT_SETTINGS.verzia);
  const [hasHydratedFromApi, setHasHydratedFromApi] = useState(false);
  const lastSavedPayloadRef = useRef<string>("");

  const normalizedSettings = useMemo(
    () =>
      normalizeStoredSettings({
        fontSize,
        chordSizeMultiplier,
        projectorFontSizeMultiplier,
        projectorBgColor,
        projectorTextColor,
        homeChordColor,
        colorScheme,
        showAkordy,
        showAkordyProjector,
        verzia,
      }),
    [
      fontSize,
      chordSizeMultiplier,
      projectorFontSizeMultiplier,
      projectorBgColor,
      projectorTextColor,
      homeChordColor,
      colorScheme,
      showAkordy,
      showAkordyProjector,
      verzia,
    ],
  );

  React.useEffect(() => {
    let isMounted = true;

    const hydrateFromApi = async () => {
      try {
        const apiSettings = await fetchSettingsFromApi();
        if (!isMounted) {
          return;
        }

        setFontSize(apiSettings.fontSize);
        setChordSizeMultiplier(apiSettings.chordSizeMultiplier);
        setProjectorFontSizeMultiplier(apiSettings.projectorFontSizeMultiplier);
        setProjectorBgColor(apiSettings.projectorBgColor);
        setProjectorTextColor(apiSettings.projectorTextColor);
        setHomeChordColor(apiSettings.homeChordColor);
        setColorScheme(apiSettings.colorScheme);
        setShowAkordy(apiSettings.showAkordy);
        setShowAkordyProjector(apiSettings.showAkordyProjector);
        setVerzia(apiSettings.verzia);
        lastSavedPayloadRef.current = JSON.stringify(apiSettings);
      } catch {
        // Keep defaults when API is temporarily unavailable.
      } finally {
        if (isMounted) {
          setHasHydratedFromApi(true);
        }
      }
    };

    hydrateFromApi();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!hasHydratedFromApi) {
      return;
    }

    const payload = JSON.stringify(normalizedSettings);
    if (payload === lastSavedPayloadRef.current) {
      return;
    }

    lastSavedPayloadRef.current = payload;
    saveSettingsToApi(normalizedSettings).catch(() => {
      // Ignore transient network failures; periodic sync will retry.
    });
  }, [hasHydratedFromApi, normalizedSettings]);

  React.useEffect(() => {
    if (!hasHydratedFromApi) {
      return;
    }

    let isMounted = true;
    const intervalId = window.setInterval(async () => {
      try {
        const apiSettings = await fetchSettingsFromApi();
        if (!isMounted) {
          return;
        }

        const apiPayload = JSON.stringify(apiSettings);
        const localPayload = JSON.stringify(normalizedSettings);
        if (apiPayload === localPayload) {
          return;
        }

        lastSavedPayloadRef.current = apiPayload;
        setFontSize(apiSettings.fontSize);
        setChordSizeMultiplier(apiSettings.chordSizeMultiplier);
        setProjectorFontSizeMultiplier(apiSettings.projectorFontSizeMultiplier);
        setProjectorBgColor(apiSettings.projectorBgColor);
        setProjectorTextColor(apiSettings.projectorTextColor);
        setHomeChordColor(apiSettings.homeChordColor);
        setColorScheme(apiSettings.colorScheme);
        setShowAkordy(apiSettings.showAkordy);
        setShowAkordyProjector(apiSettings.showAkordyProjector);
        setVerzia(apiSettings.verzia);
      } catch {
        // Keep current values when polling request fails.
      }
    }, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [hasHydratedFromApi, normalizedSettings]);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", colorScheme);
    }
  }, [colorScheme]);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", colorScheme);
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        chordSizeMultiplier,
        setChordSizeMultiplier,
        projectorFontSizeMultiplier,
        setProjectorFontSizeMultiplier,
        projectorBgColor,
        setProjectorBgColor,
        projectorTextColor,
        setProjectorTextColor,
        homeChordColor,
        setHomeChordColor,
        colorScheme,
        setColorScheme,
        showAkordy,
        setShowAkordy,
        showAkordyProjector,
        setShowAkordyProjector,
        verzia,
        setVerzia,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
