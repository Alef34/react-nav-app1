import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Song, SongVerse, Udaje } from "../types/myTypes";
import {
  getCurrentSession,
  isSupabaseConfigured,
  supabase,
} from "../api/supabaseClient";
import { DataMode, getDataMode, setDataMode } from "../api/dataMode";
import {
  createSongInSupabase,
  deleteSongsFromSupabase,
  loadAllSongsForAdmin,
  loadSongForEdit,
  replaceSongsInSupabase,
  syncLocalToSupabase,
  syncSupabaseToLocal,
  SongWithId,
  updateSongInSupabase,
  upsertSongsToSupabase,
} from "../api/supabaseSongs";

type ImportState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

type DeleteState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

type EditForm = {
  id: number;
  cisloP: string;
  nazov: string;
  kategoria: string;
  source: string;
  poradieSlohRaw: string;
  slohy: SongVerse[];
};

type AddForm = {
  cisloP: string;
  nazov: string;
  kategoria: string;
  source: string;
  poradieSlohRaw: string;
  slohy: SongVerse[];
};

function sortSongsForAdmin(items: SongWithId[]): SongWithId[] {
  return [...items].sort((a, b) => {
    const byNumber = a.cisloP.localeCompare(b.cisloP, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    if (byNumber !== 0) {
      return byNumber;
    }

    return a.nazov.localeCompare(b.nazov, undefined, {
      sensitivity: "base",
    });
  });
}

function normalizePayload(raw: unknown): Udaje {
  const wrapped = raw as {
    content?: unknown;
    verzia?: unknown;
    piesne?: unknown;
  };

  if (wrapped && Array.isArray(wrapped.content)) {
    return {
      verzia: String(wrapped.verzia ?? "1"),
      piesne: wrapped.content,
    };
  }

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

function formatImportError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const maybe = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    const parts = [maybe.message, maybe.details, maybe.hint, maybe.code]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => String(value));

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return "Neznama chyba pri importe.";
}

function normalizeSongNumber(value: string): string {
  return value.trim().replace(/\.$/, "").toLocaleLowerCase();
}

function parseCommaSeparatedQuery(query: string): string[] {
  return query
    .split(",")
    .map((part) => normalizeSongNumber(part))
    .filter((part) => part.length > 0);
}

function parseVerseOrderInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function getNextVerseLabel(verses: SongVerse[]): string {
  const used = new Set(
    verses.map((v) => String(v.cisloS ?? "").trim().toUpperCase()),
  );

  let index = 1;
  while (used.has(`V${index}`)) {
    index += 1;
  }

  return `V${index}`;
}

export default function AdminImport() {
  const [dataMode, setDataModeState] = useState<DataMode>(() => getDataMode());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [replaceAllBeforeImport, setReplaceAllBeforeImport] = useState(false);
  const [adminSongs, setAdminSongs] = useState<SongWithId[]>([]);
  const [adminSongsLoaded, setAdminSongsLoaded] = useState(false);
  const [adminSongsLoading, setAdminSongsLoading] = useState(false);
  const [adminFilter, setAdminFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteState, setDeleteState] = useState<DeleteState>({
    status: "idle",
    message: "",
  });
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaveState, setEditSaveState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [addForm, setAddForm] = useState<AddForm | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addSaveState, setAddSaveState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [importState, setImportState] = useState<ImportState>({
    status: "idle",
    message: "",
  });
  const [replaceLocalOnSync, setReplaceLocalOnSync] = useState(false);
  const [replaceSupabaseOnSync, setReplaceSupabaseOnSync] = useState(false);
  const [syncState, setSyncState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const verseRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const addVerseRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    const handleDataModeChanged = (event: Event) => {
      const customEvent = event as CustomEvent<DataMode>;
      setDataModeState(customEvent.detail === "offline" ? "offline" : "online");
    };

    window.addEventListener("data-mode-changed", handleDataModeChanged);
    return () => window.removeEventListener("data-mode-changed", handleDataModeChanged);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (dataMode === "offline") {
        setIsLoggedIn(false);
        setIsAuthLoading(false);
        return;
      }

      const session = await getCurrentSession();
      setIsLoggedIn(Boolean(session));
      setIsAuthLoading(false);
    };

    initialize();
  }, [dataMode]);

  const isOfflineMode = dataMode === "offline";
  const canSyncWithSupabase = isSupabaseConfigured && isLoggedIn;

  const canUseImport = useMemo(
    () => isOfflineMode || (isSupabaseConfigured && isLoggedIn),
    [isOfflineMode, isLoggedIn],
  );

  const filteredAdminSongs = useMemo(() => {
    if (!adminFilter.trim()) return adminSongs;
    const lower = adminFilter.toLowerCase().trim();
    const commaSeparatedTerms = parseCommaSeparatedQuery(lower);
    const shouldUseCommaFilter =
      lower.includes(",") && commaSeparatedTerms.length > 0;

    return adminSongs.filter(
      (s) => {
        const normalizedSongNumber = normalizeSongNumber(s.cisloP);
        const songTitleLower = s.nazov.toLowerCase();
        const songCategoryLower = s.kategoria.toLowerCase();

        return shouldUseCommaFilter
          ? commaSeparatedTerms.some(
              (term) =>
                normalizedSongNumber === term ||
                songTitleLower.includes(term) ||
                songCategoryLower.includes(term),
            )
          : s.cisloP.toLowerCase().includes(lower) ||
              songTitleLower.includes(lower) ||
              songCategoryLower.includes(lower);
      },
    );
  }, [adminSongs, adminFilter]);

  const allVisibleSelected =
    filteredAdminSongs.length > 0 &&
    filteredAdminSongs.every((s) => selectedIds.has(s.id));

  async function handleLoadAdminSongs() {
    setAdminSongsLoading(true);
    try {
      const songs = await loadAllSongsForAdmin();
      setAdminSongs(songs);
      setAdminSongsLoaded(true);
      setSelectedIds(new Set());
    } catch (err) {
      setDeleteState({ status: "error", message: formatImportError(err) });
    } finally {
      setAdminSongsLoading(false);
    }
  }

  function handleToggleSong(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredAdminSongs.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredAdminSongs.forEach((s) => next.add(s.id));
        return next;
      });
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    setDeleteState({ status: "loading", message: "Mazem skladby..." });
    try {
      const ids = [...selectedIds];
      const count = await deleteSongsFromSupabase(ids);
      setAdminSongs((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      setDeleteState({
        status: "success",
        message: `Vymazanych ${count} skladieb.`,
      });
    } catch (err) {
      setDeleteState({ status: "error", message: formatImportError(err) });
    }
  }

  async function handleEditSong(id: number) {
    setEditSaveState({ status: "idle", message: "" });
    try {
      const songData = await loadSongForEdit(id);
      setEditForm({
        id: songData.id,
        cisloP: songData.cisloP,
        nazov: songData.nazov,
        kategoria: songData.kategoria ?? "",
        source: songData.source ?? "",
        poradieSlohRaw: Array.isArray(songData.poradieSloh)
          ? songData.poradieSloh.join(", ")
          : "",
        slohy:
          songData.slohy.length > 0
            ? songData.slohy
            : [{ cisloS: "V1", textik: "" }],
      });
    } catch (err) {
      setDeleteState({ status: "error", message: formatImportError(err) });
    }
  }

  function handleVerseTextChange(index: number, text: string) {
    if (!editForm) return;
    const newSlohy = editForm.slohy.map((v, i) =>
      i === index ? { ...v, textik: text } : v,
    );
    setEditForm({ ...editForm, slohy: newSlohy });
  }

  function handleVerseLabelChange(index: number, label: string) {
    if (!editForm) return;
    const newSlohy = editForm.slohy.map((v, i) =>
      i === index ? { ...v, cisloS: label } : v,
    );
    setEditForm({ ...editForm, slohy: newSlohy });
  }

  function handleSplitVerse(index: number) {
    if (!editForm) return;
    const ta = verseRefs.current[index];
    const text = editForm.slohy[index].textik;
    let pos = ta ? ta.selectionStart : 0;
    if (pos === 0 || pos === text.length) {
      const nl = text.indexOf("\n");
      pos = nl > 0 ? nl : Math.floor(text.length / 2);
    }
    const before = text.slice(0, pos).trimEnd();
    const after = text.slice(pos).trimStart();
    const newSlohy = [...editForm.slohy];
    const nextLabel = getNextVerseLabel(newSlohy);
    newSlohy[index] = { ...newSlohy[index], textik: before };
    newSlohy.splice(index + 1, 0, { cisloS: nextLabel, textik: after });
    setEditForm({ ...editForm, slohy: newSlohy });
  }

  function handleRemoveVerse(index: number) {
    if (!editForm || editForm.slohy.length <= 1) return;
    const newSlohy = editForm.slohy.filter((_, i) => i !== index);
    setEditForm({ ...editForm, slohy: newSlohy });
  }

  function handleAddVerse() {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      slohy: [
        ...editForm.slohy,
        { cisloS: getNextVerseLabel(editForm.slohy), textik: "" },
      ],
    });
  }

  function openAddSongForm() {
    setAddSaveState({ status: "idle", message: "" });
    setAddForm({
      cisloP: "",
      nazov: "",
      kategoria: "Nabozenske",
      source: "",
      poradieSlohRaw: "",
      slohy: [{ cisloS: "V1", textik: "" }],
    });
    addVerseRefs.current = [];
  }

  function handleAddVerseTextChange(index: number, text: string) {
    if (!addForm) return;
    const newSlohy = addForm.slohy.map((v, i) =>
      i === index ? { ...v, textik: text } : v,
    );
    setAddForm({ ...addForm, slohy: newSlohy });
  }

  function handleAddVerseLabelChange(index: number, label: string) {
    if (!addForm) return;
    const newSlohy = addForm.slohy.map((v, i) =>
      i === index ? { ...v, cisloS: label } : v,
    );
    setAddForm({ ...addForm, slohy: newSlohy });
  }

  function handleAddSplitVerse(index: number) {
    if (!addForm) return;
    const ta = addVerseRefs.current[index];
    const text = addForm.slohy[index].textik;
    let pos = ta ? ta.selectionStart : 0;
    if (pos === 0 || pos === text.length) {
      const nl = text.indexOf("\n");
      pos = nl > 0 ? nl : Math.floor(text.length / 2);
    }

    const before = text.slice(0, pos).trimEnd();
    const after = text.slice(pos).trimStart();
    const newSlohy = [...addForm.slohy];
    const nextLabel = getNextVerseLabel(newSlohy);
    newSlohy[index] = { ...newSlohy[index], textik: before };
    newSlohy.splice(index + 1, 0, { cisloS: nextLabel, textik: after });
    setAddForm({ ...addForm, slohy: newSlohy });
  }

  function handleAddRemoveVerse(index: number) {
    if (!addForm || addForm.slohy.length <= 1) return;
    const newSlohy = addForm.slohy.filter((_, i) => i !== index);
    setAddForm({ ...addForm, slohy: newSlohy });
  }

  function handleAddAddVerse() {
    if (!addForm) return;
    setAddForm({
      ...addForm,
      slohy: [...addForm.slohy, { cisloS: getNextVerseLabel(addForm.slohy), textik: "" }],
    });
  }

  async function handleSaveAddSong() {
    if (!addForm) return;

    setAddLoading(true);
    setAddSaveState({ status: "loading", message: "Ukladam novu skladbu..." });
    try {
      const song: Song = {
        cisloP: addForm.cisloP.trim(),
        nazov: addForm.nazov.trim(),
        kategoria: addForm.kategoria.trim(),
        source: addForm.source.trim(),
        poradieSloh: parseVerseOrderInput(addForm.poradieSlohRaw),
        slohy: addForm.slohy,
      };

      const created = await createSongInSupabase(song);
      setAdminSongs((prev) => sortSongsForAdmin([...prev, created]));
      setAdminSongsLoaded(true);
      setAddSaveState({ status: "success", message: "Nova skladba pridana." });
      setAddForm(null);
    } catch (err) {
      setAddSaveState({ status: "error", message: formatImportError(err) });
    } finally {
      setAddLoading(false);
    }
  }

  async function handleSaveEdit() {
    if (!editForm) return;
    setEditLoading(true);
    setEditSaveState({ status: "loading", message: "Ukladam..." });
    try {
      const song: Song = {
        cisloP: editForm.cisloP.trim(),
        nazov: editForm.nazov.trim(),
        kategoria: editForm.kategoria.trim(),
        source: editForm.source.trim(),
        poradieSloh: parseVerseOrderInput(editForm.poradieSlohRaw),
        slohy: editForm.slohy,
      };
      await updateSongInSupabase(editForm.id, song);
      setAdminSongs((prev) =>
        prev.map((s) =>
          s.id === editForm.id
            ? {
                ...s,
                cisloP: song.cisloP,
                nazov: song.nazov,
                kategoria: song.kategoria ?? "",
                source: song.source ?? "",
              }
            : s,
        ),
      );
      setEditSaveState({ status: "success", message: "Skladba ulozena." });
    } catch (err) {
      setEditSaveState({ status: "error", message: formatImportError(err) });
    } finally {
      setEditLoading(false);
    }
  }

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
    if (isOfflineMode) {
      return;
    }

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setImportState({ status: "idle", message: "Odhlaseny." });
  }

  function removeDuplicatesByKey(songs: any[]) {
    const seen = new Set();
    return songs.filter((song) => {
      const key = `${String(song?.cisloP ?? "").trim()}|${String(
        song?.nazov ?? "",
      ).trim()}`;
      if (key === "|") {
        return true;
      }
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
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
      const payload = normalizePayload(parsed);
      //console.log("Normalized payload:", payload); // pridaj toto

      if (!payload || payload.piesne.length === 0) {
        throw new Error("Import neobsahuje ziadne validne skladby.");
      }
      //console.log("Upserting songs to Supabase..."); // pridaj toto

      const uniqueSongs = removeDuplicatesByKey(payload.piesne);
      //console.log(
      //  `Removed duplicates, ${uniqueSongs.length} unique songs remain.`
      //); // pridaj toto

      const uniquePayload: Udaje = {
        ...payload,
        piesne: uniqueSongs,
      };

      const count = replaceAllBeforeImport
        ? await replaceSongsInSupabase(uniquePayload)
        : await upsertSongsToSupabase(uniquePayload);
      const removedDuplicates = payload.piesne.length - uniqueSongs.length;
      //const count = await upsertSongsToSupabase(payload);
      //console.log(`Upserted ${count} songs to Supabase.`); // pridaj toto
      setImportState({
        status: "success",
        message: `Import uspesny. Ulozenych skladieb: ${count}. Duplicity odstranene: ${removedDuplicates}. Rezim: ${
          replaceAllBeforeImport ? "nahradit vsetko" : "preskocit existujuce"
        }.`,
      });
      console.log(`Import uspesny. Ulozenych skladieb: ${count}.`); // pridaj toto
    } catch (error) {
      const message = formatImportError(error);
      setImportState({ status: "error", message });
    } finally {
      event.target.value = "";
    }
  }

  function handleDataModeChange(nextMode: DataMode) {
    setDataMode(nextMode);
    setDataModeState(nextMode);
    setImportState({
      status: "idle",
      message:
        nextMode === "offline"
          ? "Offline rezim aktivny. Pouzije sa lokalna DB v zariadeni."
          : "Online rezim aktivny. Pouzije sa Supabase.",
    });
    setAdminSongs([]);
    setAdminSongsLoaded(false);
    setSelectedIds(new Set());
    setDeleteState({ status: "idle", message: "" });
    setEditForm(null);
    setEditSaveState({ status: "idle", message: "" });
    setAddForm(null);
    setAddSaveState({ status: "idle", message: "" });
    setSyncState({ status: "idle", message: "" });
  }

  function confirmSyncAction(direction: "supabase-to-local" | "local-to-supabase", replaceAll: boolean): boolean {
    const directionText =
      direction === "supabase-to-local"
        ? "Supabase -> Lokal"
        : "Lokal -> Supabase";

    const modeText = replaceAll
      ? "REZIM: PREPISAT CIEL (existujuce data budu zmazane)."
      : "REZIM: PRIDAT NOVE (existujuce data zostanu).";

    return window.confirm(
      `Spustit synchronizaciu ${directionText}?\n\n${modeText}`,
    );
  }

  async function handleSyncSupabaseToLocal() {
    if (!canSyncWithSupabase) {
      setSyncState({
        status: "error",
        message:
          "Pre sync zo Supabase sa prepni na Online rezim a prihlas sa.",
      });
      return;
    }

    if (!confirmSyncAction("supabase-to-local", replaceLocalOnSync)) {
      return;
    }

    setSyncState({ status: "loading", message: "Synchronizujem Supabase -> lokal..." });
    try {
      const count = await syncSupabaseToLocal(replaceLocalOnSync);
      setSyncState({
        status: "success",
        message: `Hotovo. Prenesenych ${count} skladieb do lokalnej DB (${replaceLocalOnSync ? "prepisat ciel" : "pridat nove"}).`,
      });

      if (adminSongsLoaded && isOfflineMode) {
        await handleLoadAdminSongs();
      }
    } catch (err) {
      setSyncState({ status: "error", message: formatImportError(err) });
    }
  }

  async function handleSyncLocalToSupabase() {
    if (!canSyncWithSupabase) {
      setSyncState({
        status: "error",
        message:
          "Pre sync do Supabase sa prepni na Online rezim a prihlas sa.",
      });
      return;
    }

    if (!confirmSyncAction("local-to-supabase", replaceSupabaseOnSync)) {
      return;
    }

    setSyncState({ status: "loading", message: "Synchronizujem lokal -> Supabase..." });
    try {
      const count = await syncLocalToSupabase(replaceSupabaseOnSync);
      setSyncState({
        status: "success",
        message: `Hotovo. Prenesenych ${count} skladieb do Supabase (${replaceSupabaseOnSync ? "prepisat ciel" : "pridat nove"}).`,
      });

      if (adminSongsLoaded && !isOfflineMode) {
        await handleLoadAdminSongs();
      }
    } catch (err) {
      setSyncState({ status: "error", message: formatImportError(err) });
    }
  }

  return (
    <div
      style={{ padding: 20, maxWidth: 800, margin: "0 auto", color: "black" }}
    >
      <h1>Admin Import</h1>
      <p>
        {isOfflineMode
          ? "Offline rezim uklada skladby do lokalnej DB v tomto zariadeni (bez internetu)."
          : "Online rezim uklada skladby do Supabase. Po importe budu skladby dostupne v publikovanej aplikacii bez noveho deployu."}
      </p>
      <p>
        <Link to="/">Spat na domov</Link>
      </p>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #bbb",
          backgroundColor: "#f8f8f8",
        }}
      >
        <strong>Datovy rezim:</strong>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="data-mode"
              checked={dataMode === "online"}
              onChange={() => handleDataModeChange("online")}
            />
            Online (Supabase)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="data-mode"
              checked={dataMode === "offline"}
              onChange={() => handleDataModeChange("offline")}
            />
            Offline (lokalna DB)
          </label>
        </div>
      </div>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #bbb",
          backgroundColor: "#f8f8f8",
        }}
      >
        <strong>Synchronizacia databaz</strong>
        <p style={{ marginTop: 8, marginBottom: 8 }}>
          Prenos skladieb medzi Supabase a lokalnou DB.
        </p>
        {!canSyncWithSupabase && (
          <p style={{ marginTop: 0, color: "#b00" }}>
            Pre sync je potrebny Online rezim + prihlasenie do Supabase.
          </p>
        )}
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={handleSyncSupabaseToLocal}
              disabled={!canSyncWithSupabase || syncState.status === "loading"}
              style={{ padding: "8px 12px" }}
            >
              Supabase {"->"} Lokal
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={replaceLocalOnSync}
                onChange={(e) => setReplaceLocalOnSync(e.target.checked)}
              />
              Prepisat lokalnu DB
            </label>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={handleSyncLocalToSupabase}
              disabled={!canSyncWithSupabase || syncState.status === "loading"}
              style={{ padding: "8px 12px" }}
            >
              Lokal {"->"} Supabase
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={replaceSupabaseOnSync}
                onChange={(e) => setReplaceSupabaseOnSync(e.target.checked)}
              />
              Prepisat Supabase
            </label>
          </div>
        </div>

        {syncState.message && (
          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              padding: 10,
              borderRadius: 8,
              backgroundColor:
                syncState.status === "error"
                  ? "var(--color-danger-bg)"
                  : syncState.status === "success"
                  ? "var(--color-success-bg)"
                  : "var(--color-panel-bg)",
            }}
          >
            {syncState.message}
          </p>
        )}
      </div>

      {!isOfflineMode && !isSupabaseConfigured && (
        <div
          style={{
            padding: 12,
            border: "1px solid var(--color-danger)",
            borderRadius: 8,
            backgroundColor: "var(--color-danger-bg)",
          }}
        >
          Chyba konfiguracia Supabase. Nastav VITE_SUPABASE_URL a
          VITE_SUPABASE_ANON_KEY.
        </div>
      )}

      {!isOfflineMode && isSupabaseConfigured && isAuthLoading && <p>Overujem session...</p>}

      {!isOfflineMode && isSupabaseConfigured && !isAuthLoading && !isLoggedIn && (
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
          {!isOfflineMode && (
            <div>
              <button
                type="button"
                onClick={handleLogout}
                style={{ width: 180, padding: "10px 12px" }}
              >
                Odhlasit sa
              </button>
            </div>
          )}
          <label>
            {isOfflineMode
              ? "Vyber JSON subor pre lokalnu DB (format: Udaje/piesne)"
              : "Vyber JSON subor (format: Udaje/piesne)"}
            <input
              type="file"
              accept="application/json"
              onChange={handleFileImport}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={replaceAllBeforeImport}
              onChange={(e) => setReplaceAllBeforeImport(e.target.checked)}
            />
            Pred importom vymazat existujuce skladby (nahradit vsetko)
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
                ? "var(--color-danger-bg)"
                : importState.status === "success"
                ? "var(--color-success-bg)"
                : "var(--color-panel-bg)",
          }}
        >
          {importState.message}
        </p>
      )}

      {canUseImport && (
        <div
          style={{
            marginTop: 32,
            borderTop: "1px solid #ddd",
            paddingTop: 20,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Mazanie skladieb</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <button
              type="button"
              onClick={handleLoadAdminSongs}
              disabled={adminSongsLoading}
              style={{ padding: "8px 16px" }}
            >
              {adminSongsLoading
                ? "Nacitavam..."
                : adminSongsLoaded
                ? "Obnovit zoznam"
                : "Nacitat skladby z DB"}
            </button>
            <button
              type="button"
              onClick={openAddSongForm}
              style={{ padding: "8px 16px" }}
            >
              Pridat novu skladbu
            </button>
          </div>
          {adminSongsLoaded && (
            <>
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Filtrovat text alebo mix (napr. 2,33,som)..."
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleToggleAllVisible}
                  />
                  Vybrat vsetkych zobrazenych ({filteredAdminSongs.length})
                </label>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={deleteState.status === "loading"}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#c00",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Vymazat vybranych ({selectedIds.size})
                  </button>
                )}
              </div>
              <div
                style={{
                  maxHeight: 400,
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              >
                {filteredAdminSongs.length === 0 ? (
                  <p style={{ padding: 8, color: "#888" }}>Ziadne vysledky.</p>
                ) : (
                  filteredAdminSongs.map((song) => (
                    <label
                      key={song.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 8px",
                        cursor: "pointer",
                        backgroundColor: selectedIds.has(song.id)
                          ? "#fff3cd"
                          : "transparent",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(song.id)}
                        onChange={() => handleToggleSong(song.id)}
                      />
                      <span style={{ minWidth: 50, color: "#666" }}>
                        {song.cisloP}
                      </span>
                      <span style={{ flex: 1 }}>{song.nazov}</span>
                      <span style={{ color: "#888", fontSize: 12 }}>
                        {song.kategoria}
                      </span>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditSong(song.id);
                        }}
                        style={{
                          fontSize: 12,
                          padding: "2px 8px",
                          border: "1px solid #aaa",
                          borderRadius: 3,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Upravit
                      </button>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
          {deleteState.message && (
            <p
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                backgroundColor:
                  deleteState.status === "error"
                    ? "var(--color-danger-bg)"
                    : deleteState.status === "success"
                    ? "var(--color-success-bg)"
                    : "var(--color-panel-bg)",
              }}
            >
              {deleteState.message}
            </p>
          )}
        </div>
      )}

      {editForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
            padding: "24px 12px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditForm(null);
              setEditSaveState({ status: "idle", message: "" });
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              width: "100%",
              maxWidth: 640,
              color: "black",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Upravit skladbu</h2>
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              <label>
                Cislo:
                <input
                  value={editForm.cisloP}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cisloP: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Nazov:
                <input
                  value={editForm.nazov}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nazov: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Kategoria:
                <input
                  value={editForm.kategoria}
                  onChange={(e) =>
                    setEditForm({ ...editForm, kategoria: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Source:
                <input
                  value={editForm.source}
                  onChange={(e) =>
                    setEditForm({ ...editForm, source: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Poradie sloh:
                <input
                  value={editForm.poradieSlohRaw}
                  onChange={(e) =>
                    setEditForm({ ...editForm, poradieSlohRaw: e.target.value })
                  }
                  placeholder="napr. R, V1, R, V2, R, V3"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
                <small style={{ color: "#555" }}>
                  Prazdne = standardne poradie podla sloh. Mozes pouzit ciarku, bodkociarku alebo novy riadok.
                </small>
              </label>
            </div>
            <h3 style={{ marginBottom: 8 }}>Slohy</h3>
            {editForm.slohy.map((verse, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <input
                    value={verse.cisloS}
                    onChange={(e) => handleVerseLabelChange(i, e.target.value)}
                    style={{ width: 72, padding: "2px 6px", boxSizing: "border-box" }}
                    placeholder="V1"
                    title="Nazov slohy (napr. V1, R, B)"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSplitVerse(i)}
                    style={{ fontSize: 12, padding: "2px 8px" }}
                    title="Umiestni kurzor v texte a klikni pre rozdelenie"
                  >
                    Rozdelit (pri kurzore)
                  </button>
                  {editForm.slohy.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVerse(i)}
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        color: "#c00",
                        border: "1px solid #c00",
                        cursor: "pointer",
                      }}
                    >
                      Odstranit
                    </button>
                  )}
                </div>
                <textarea
                  ref={(el) => {
                    verseRefs.current[i] = el;
                  }}
                  value={verse.textik}
                  onChange={(e) => handleVerseTextChange(i, e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 80,
                    padding: 6,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddVerse}
              style={{ marginBottom: 16 }}
            >
              + Pridat slohu
            </button>
            {editSaveState.message && (
              <p
                style={{
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 8,
                  backgroundColor:
                    editSaveState.status === "error" ? "var(--color-danger-bg)" : "var(--color-success-bg)",
                }}
              >
                {editSaveState.message}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editLoading}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {editLoading ? "Ukladam..." : "Ulozit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditForm(null);
                  setEditSaveState({ status: "idle", message: "" });
                }}
                style={{ padding: "8px 20px" }}
              >
                Zavrit
              </button>
            </div>
          </div>
        </div>
      )}

      {addForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
            padding: "24px 12px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAddForm(null);
              setAddSaveState({ status: "idle", message: "" });
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              width: "100%",
              maxWidth: 640,
              color: "black",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Pridat novu skladbu</h2>
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              <label>
                Cislo:
                <input
                  value={addForm.cisloP}
                  onChange={(e) =>
                    setAddForm({ ...addForm, cisloP: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Nazov:
                <input
                  value={addForm.nazov}
                  onChange={(e) =>
                    setAddForm({ ...addForm, nazov: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Kategoria:
                <input
                  value={addForm.kategoria}
                  onChange={(e) =>
                    setAddForm({ ...addForm, kategoria: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Source:
                <input
                  value={addForm.source}
                  onChange={(e) =>
                    setAddForm({ ...addForm, source: e.target.value })
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Poradie sloh:
                <input
                  value={addForm.poradieSlohRaw}
                  onChange={(e) =>
                    setAddForm({ ...addForm, poradieSlohRaw: e.target.value })
                  }
                  placeholder="napr. R, V1, R, V2, R, V3"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 6,
                    boxSizing: "border-box",
                  }}
                />
                <small style={{ color: "#555" }}>
                  Prazdne = standardne poradie podla sloh. Mozes pouzit ciarku, bodkociarku alebo novy riadok.
                </small>
              </label>
            </div>
            <h3 style={{ marginBottom: 8 }}>Slohy</h3>
            {addForm.slohy.map((verse, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <input
                    value={verse.cisloS}
                    onChange={(e) => handleAddVerseLabelChange(i, e.target.value)}
                    style={{ width: 72, padding: "2px 6px", boxSizing: "border-box" }}
                    placeholder="V1"
                    title="Nazov slohy (napr. V1, R, B)"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleAddSplitVerse(i)}
                    style={{ fontSize: 12, padding: "2px 8px" }}
                    title="Umiestni kurzor v texte a klikni pre rozdelenie"
                  >
                    Rozdelit (pri kurzore)
                  </button>
                  {addForm.slohy.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddRemoveVerse(i)}
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        color: "#c00",
                        border: "1px solid #c00",
                        cursor: "pointer",
                      }}
                    >
                      Odstranit
                    </button>
                  )}
                </div>
                <textarea
                  ref={(el) => {
                    addVerseRefs.current[i] = el;
                  }}
                  value={verse.textik}
                  onChange={(e) => handleAddVerseTextChange(i, e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 80,
                    padding: 6,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAddVerse}
              style={{ marginBottom: 16 }}
            >
              + Pridat slohu
            </button>
            {addSaveState.message && (
              <p
                style={{
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 8,
                  backgroundColor:
                    addSaveState.status === "error" ? "var(--color-danger-bg)" : "var(--color-success-bg)",
                }}
              >
                {addSaveState.message}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={handleSaveAddSong}
                disabled={addLoading}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {addLoading ? "Ukladam..." : "Pridat"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddForm(null);
                  setAddSaveState({ status: "idle", message: "" });
                }}
                style={{ padding: "8px 20px" }}
              >
                Zavrit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
