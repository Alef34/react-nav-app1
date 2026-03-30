
import { Song, Udaje } from "../types/myTypes";
import { localData } from "./localData";
import { checkInternetConnection } from "./myTools";
import { isSupabaseConfigured } from "./supabaseClient";
import { getDataMode } from "./dataMode";
import { loadSongsFromSupabase } from "./supabaseSongs";

const LOCAL_SONGS_URL = `${import.meta.env.BASE_URL}songs.json`;
const REMOTE_SONGS_URL = "https://texty-piesni-csv.azurewebsites.net/WeatherForecast";

function normalizeSong(raw: unknown): Song {
  const song = (raw ?? {}) as Partial<Song>;
  const rawVerses = Array.isArray(song.slohy) ? song.slohy : [];
  const rawOrder = Array.isArray(song.poradieSloh) ? song.poradieSloh : [];

  return {
    cisloP: String(song.cisloP ?? "").trim(),
    nazov: String(song.nazov ?? "").trim(),
    source: song.source ? String(song.source) : "",
    kategoria: song.kategoria ? String(song.kategoria) : "",
    poradieSloh: rawOrder
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0),
    slohy: rawVerses.map((verse, index) => {
      const safeVerse = (verse ?? {}) as { cisloS?: unknown; textik?: unknown };
      return {
        cisloS: String(safeVerse.cisloS ?? `V${index + 1}`),
        textik: String(safeVerse.textik ?? ""),
      };
    }),
  };
}

function normalizeSongs(rawSongs: unknown): Song[] {
  if (!Array.isArray(rawSongs)) {
    return [];
  }

  return rawSongs
    .map((item) => normalizeSong(item))
    .filter((song) => song.cisloP.length > 0 && song.nazov.length > 0);
}

async function loadLocalSongs(): Promise<Udaje | undefined> {
  try {
    const cacheBustedUrl = `${LOCAL_SONGS_URL}?ts=${Date.now()}`;
    const response = await fetch(cacheBustedUrl, { cache: "no-store" });
    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as Udaje;
    if (!data?.piesne || !Array.isArray(data.piesne)) {
      return undefined;
    }

    return data;
  } catch {
    return undefined;
  }
}

export async function getSongs(filter: string):Promise<Song[]> {
    let ud:Song[]=[];
    const loweredFilter = filter.toLowerCase();
    const dataMode = getDataMode();

    if (dataMode === "offline" || isSupabaseConfigured) {
      try {
        return await loadSongsFromSupabase(loweredFilter);
      } catch {
        // Fallback to local JSON/cache path when Supabase is unavailable.
      }
    }

    const localSongs = await loadLocalSongs();
    if (localSongs) {
      localData.set('udaje', localSongs);
      ud = normalizeSongs(localSongs.piesne);

      return ud.filter((piesen) =>
        Object.values(piesen).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(loweredFilter)
        )
      );
    }

    const cachedUdaje = localData.get('udaje');

    if (cachedUdaje != undefined)
    {
      const vvNew:string = await getVersion();
      const vvOld:string =  String(cachedUdaje?.verzia ?? "");
      if(vvNew!=vvOld)
        {
          const jeInternet : boolean =await  checkInternetConnection();
          if (jeInternet) 
            localData.remove('udaje');
          else
            alert('su nove udaje');
        }

    }
    
    if (localData.get('udaje')== undefined)
    {
      const response = await fetch(REMOTE_SONGS_URL);
      const noveData:Udaje = await response.json();
      ud = normalizeSongs(noveData.piesne);
      localData.set('udaje', noveData);
    }
    else
    {
      const jsonData = localData.get('udaje'); // Načítaj reťazec z localStorage
      if (jsonData) {    
        ud = normalizeSongs(jsonData.piesne);
      }
    }
      const poslaneData:Song[] = ud.filter((piesen) =>
      Object.values(piesen).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(loweredFilter)
      )
    );
  
    return poslaneData;
  
  }


  export async function getVersion():Promise<string> {
    const dataMode = getDataMode();

    if (dataMode === "offline") {
      return "offline-local-db";
    }

    if (isSupabaseConfigured) {
      return "supabase";
    }

    let ver:string = "";
    
      const localSongs = await loadLocalSongs();
      if (localSongs?.verzia) {
        return localSongs.verzia;
      }

      const response = await fetch(REMOTE_SONGS_URL);
      const noveData:Udaje = await response.json();
      ver = noveData.verzia;
      //localData.set('udaje', noveData);
    
  
    return ver;
  
  }