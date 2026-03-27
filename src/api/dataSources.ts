
import { Song, Udaje } from "../types/myTypes";
import { localData } from "./localData";
import { checkInternetConnection } from "./myTools";

const LOCAL_SONGS_URL = `${import.meta.env.BASE_URL}songs.json`;
const REMOTE_SONGS_URL = "https://texty-piesni-csv.azurewebsites.net/WeatherForecast";

function logSongsDebug(source: string, songs: Song[]): void {
  const countryIds = songs
    .filter((song) => (song.kategoria ?? "").trim().toLocaleLowerCase() === "country")
    .map((song) => song.cisloP);

  console.log(
    `[songs] source=${source} total=${songs.length} countryCount=${countryIds.length} countryIds=${countryIds.join(",") || "-"}`
  );
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
console.log("nacitavam...");

    const localSongs = await loadLocalSongs();
    if (localSongs) {
      localData.set('udaje', localSongs);
      ud = localSongs.piesne;
      logSongsDebug("local", ud);

      return ud.filter((piesen) =>
        Object.values(piesen).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(filter)
        )
      );
    }

    if (localData.get('udaje')!= undefined)
    {
      const vvNew:string = await getVersion();
      const vvOld:string =  localData.get('udaje').verzia;
      if(vvNew!=vvOld)
        {
          const jeInternet : boolean =await  checkInternetConnection();
          if (jeInternet) 
            localData.remove('udaje');
          else
            alert('su nove udaje');

          console.log('treba nahrat nove udaje z webu', vvNew,'->', vvOld);
        }

    }
    
    if (localData.get('udaje')== undefined)
    {
      const response = await fetch(REMOTE_SONGS_URL);
      const noveData:Udaje = await response.json();
      ud = noveData.piesne;
      localData.set('udaje', noveData);
      logSongsDebug("remote", ud);
    }
    else
    {
      const jsonData = localData.get('udaje'); // Načítaj reťazec z localStorage
      if (jsonData) {    
        ud = jsonData.piesne;
        logSongsDebug("cache", ud);
      }
    }
      const poslaneData:Song[] = ud.filter((piesen) =>
      Object.values(piesen).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(filter)
      )
    );
  
    return poslaneData;
  
  }


  export async function getVersion():Promise<string> {
    
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