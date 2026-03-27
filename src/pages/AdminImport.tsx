import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Udaje } from "../types/myTypes";
import {
  getCurrentSession,
  isSupabaseConfigured,
  supabase,
} from "../api/supabaseClient";
import { upsertSongsToSupabase } from "../api/supabaseSongs";

type ImportState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

function normalizePayload(raw: unknown): Udaje {
  if (Array.isArray(raw)) {
    return {
      verzia: "1",
      piesne: raw,
    };
  }
  const typed = raw as Partial<Udaje>;
  return {
    verzia: String(typed?.verzia ?? "1"),
    piesne: Array.isArray(typed?.piesne) ? typed.piesne : [],
  };
}

export default function AdminImport() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [importState, setImportState] = useState<ImportState>({
    status: "idle",
    message: "",
  });

  useEffect(() => {
    const initialize = async () => {
      const session = await getCurrentSession();
      setIsLoggedIn(Boolean(session));
      setIsAuthLoading(false);
    };

    initialize();
  }, []);

  const canUseImport = useMemo(
    () => isSupabaseConfigured && isLoggedIn,
    [isLoggedIn]
  );

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    setImportState({ status: "loading", message: "Prihlasujem..." });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setImportState({
        status: "error",
        message: `Prihlasenie zlyhalo: ${error.message}`,
      });
      return;
    }

    setIsLoggedIn(true);
    setImportState({ status: "success", message: "Prihlasenie uspesne." });
  }

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setImportState({ status: "idle", message: "Odhlaseny." });
  }

  function removeDuplicatesById(songs: any[]) {
    const seen = new Set();
    return songs.filter((song) => {
      if (!song.id) return true; // alebo podľa potreby
      if (seen.has(song.id)) return false;
      seen.add(song.id);
      return true;
    });
  }

  async function handleFileImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    //console.log("Selected file:", file); // pridaj toto
    if (!file) {
      return;
    }
    //console.log("Starting import..."); // pridaj toto
    setImportState({ status: "loading", message: "Importujem skladby..." });
    //console.log("Reading file content..."); // pridaj toto
    try {
      const text = await file.text();
      //console.log("File content:", text); // pridaj toto
      const parsed = JSON.parse(text);
      //console.log("Parsed JSON:", parsed); // pridaj toto
      const songsArray = Array.isArray(parsed) ? parsed : parsed.piesne;
      //console.log("songsArray:", songsArray); // pridaj toto
      if (!Array.isArray(songsArray)) {
        throw new Error(
          "JSON musí byť pole skladieb alebo objekt s kľúčom 'piesne' obsahujúcim pole."
        );
      }

      const payload = normalizePayload(songsArray);
      //console.log("Normalized payload:", payload); // pridaj toto

      if (!payload || payload.length === 0) {
        throw new Error("Import neobsahuje ziadne validne skladby.");
      }
      //console.log("Upserting songs to Supabase..."); // pridaj toto

      const uniqueSongs = removeDuplicatesById(payload.piesne);
      //console.log(
      //  `Removed duplicates, ${uniqueSongs.length} unique songs remain.`
      //); // pridaj toto

      const uniquePayload: Udaje = {
        ...payload,
        piesne: uniqueSongs,
      };

      const count = await upsertSongsToSupabase(uniquePayload);
      //const count = await upsertSongsToSupabase(payload);
      //console.log(`Upserted ${count} songs to Supabase.`); // pridaj toto
      setImportState({
        status: "success",
        message: `Import uspesny. Ulozenych skladieb: ${count}.`,
      });
      console.log(`Import uspesny. Ulozenych skladieb: ${count}.`); // pridaj toto
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Neznama chyba pri importe.";
      setImportState({ status: "error", message });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div
      style={{ padding: 20, maxWidth: 800, margin: "0 auto", color: "black" }}
    >
      <h1>Admin Import</h1>
      <p>
        Tato stranka je urcena na trvaly import skladieb do Supabase. Po importe
        budu skladby dostupne v publikovanej aplikacii bez noveho deployu.
      </p>
      <p>
        <Link to="/">Spat na domov</Link>
      </p>

      {!isSupabaseConfigured && (
        <div
          style={{
            padding: 12,
            border: "1px solid #b00",
            borderRadius: 8,
            backgroundColor: "#ffecec",
          }}
        >
          Chyba konfiguracia Supabase. Nastav VITE_SUPABASE_URL a
          VITE_SUPABASE_ANON_KEY.
        </div>
      )}

      {isSupabaseConfigured && isAuthLoading && <p>Overujem session...</p>}

      {isSupabaseConfigured && !isAuthLoading && !isLoggedIn && (
        <form
          onSubmit={handleLogin}
          style={{ display: "grid", gap: 10, maxWidth: 360 }}
        >
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            Heslo
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <button type="submit" style={{ width: 180, padding: "10px 12px" }}>
            Prihlasit sa
          </button>
        </form>
      )}

      {canUseImport && (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <button
              type="button"
              onClick={handleLogout}
              style={{ width: 180, padding: "10px 12px" }}
            >
              Odhlasit sa
            </button>
          </div>
          <label>
            Vyber JSON subor (format: Udaje/piesne)
            <input
              type="file"
              accept="application/json"
              onChange={handleFileImport}
            />
          </label>
        </div>
      )}

      {importState.message && (
        <p
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            backgroundColor:
              importState.status === "error"
                ? "#ffecec"
                : importState.status === "success"
                ? "#e9ffe9"
                : "#f4f4f4",
          }}
        >
          {importState.message}
        </p>
      )}
    </div>
  );
}
