const novePiesne10 = {
  verzia:"1",
  piesne:
  [
  {
    cisloP: "1",
    nazov: "Čoooooo o mne vieš?",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "[G]Tak ako príboj s brehom sa [C]hrá\n[G]Tak ako dúha k slnku sa[C]dá [C/H]\n[hmi]Ja môžem len dúfať, že šancu mi [D]dáš\n[hmi]a nesmelo skúšať, že rada ma [C]máš[D]",
      },
      {
        cisloS: "R",
        textik:
          "Čo o mne [G]vieš, skúšať ma [Gmaj7/H]smieš\n na hodine [C]lásky\nČo o mne [G]vieš, ja dúfam, že [Gmaj7/H]tiež\nnerob si v[C] rásky\nTen starý [hmi]song zo starej [D]pásky\nv kúte [G]hrá",
      },
      {
        cisloS: "V2",
        textik:
          "Chcem sa dotknúť tvojich pier. Som taký, aký som, tak sa s tým zmier. No ak ma chceš skúšať a šancu mi dáš, ja budem len dúfať, že rada ma máš",
      },
      {
        cisloS: "R2",
        textik:
          "Čo o mne [G]vieš, skúšať ma [Gmaj7/H]smieš\n na hodine [C]lásky\nČo o mne [G]vieš, ja dúfam, že [Gmaj7/H]tiež\nnerob si v[C] rásky\nTen starý [hmi]song zo starej [D]pásky\nKto a z čo[hmi]ho má na tvári [C]vrásky\nv kúte [D]hrá",
      },
    ],
  },
]};

const fetchData = async(url:any)=>{
  try{
      console.log("A");
      const response = await fetch(url, { mode: 'no-cors'});
      console.log("B");
      console.log("data110");
      const json = await response.json();
      console.log(json.result);
      return json.result;
 //     setData(json.results);
    }catch(error:any){
      console.log("C");
   //   setError(error);
    //  setIsLoading(false);
  }
}

const API_ENDPOINT= `https://texty-piesni-csv.azurewebsites.net/WeatherForecast`

//const test = fetchData(API_ENDPOINT);
const novePiesne1 =novePiesne10;// 
export default novePiesne1;
