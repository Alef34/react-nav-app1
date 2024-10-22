
import { Song, Udaje } from "../types/myTypes";
import { localData } from "./localData";
import { checkInternetConnection } from "./myTools";

export async function getSongs(filter: string):Promise<Song[]> {
    let ud:Song[]=[];
console.log("nacitavam...");
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
      const url =  `https://texty-piesni-csv.azurewebsites.net/WeatherForecast`;
      const response = await fetch(url);
      const noveData:Udaje = await response.json();
      ud = noveData.piesne;
      localData.set('udaje', noveData);
    }
    else
    {
      const jsonData = localData.get('udaje'); // Načítaj reťazec z localStorage
      if (jsonData) {    
        ud = jsonData.piesne;
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
    
      const url =  `https://texty-piesni-csv.azurewebsites.net/WeatherForecast`;
      const response = await fetch(url);
      const noveData:Udaje = await response.json();
      ver = noveData.verzia;
      //localData.set('udaje', noveData);
    
  
    return ver;
  
  }