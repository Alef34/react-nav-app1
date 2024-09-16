import { version } from "react";
import Song from "./Song";

interface SongVerse {
  cisloS: string;
  textik: string;
}

interface Song {
  cisloP: string;
  nazov: string;
  slohy: SongVerse[];
}

interface Udaje{
  verzia:string;
  piesne:Song[];
}
export const fetchDataTQ = async (suborSdatami: Udaje): Promise<Udaje> => {
  //await query:any

  //new Promise((resolve)=>setTimeout(resolve, 1000));

  //const queryna = query.trim();
  localStorage.removeItem("apiData");
  const storedData = localStorage.getItem("apiData");
  if (storedData) {

    const mojeUdaje: Udaje = JSON.parse(storedData) as Udaje;
    //console.log("kraaasa");
    //console.log("NNNNNN:",mojeUdaje.verzia);
    const songs: Song[] =mojeUdaje.piesne;
    
    // toto je ok const songs: Song[] = JSON.parse(storedData) as Song[];
 
    return {verzia:"1", piesne:[...songs]};
  } else {
    console.log("No data found in localStorage");
  }

  console.log("KKK", suborSdatami);
  const poslaneData = suborSdatami.piesne.filter((piesen) =>
    Object.values(piesen).some(
      (value) => typeof value === "string" && value.toLowerCase().includes("")
    )
  );
  //queryna.toLowerCase()
  //console.log("UUUABBB:", "+", "", "+", poslaneData.length);
  return {verzia:suborSdatami.verzia, piesne:[ ...poslaneData]};
 
};

const novePiesne ={
  verzia:"1",
  piesne: [
  {
    cisloP: "1",
    nazov: "Ale - aleluja",
    slohy: [
      {
        cisloS: "R",
        textik: "/: [h]Ale, [e]alelu [Fis]ja,\n[G]a[A]le, [Fis7]alelu[h]ja.:/",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Tvoje skutky [D]lásky \n[A]zmenili [D]nás,\n[G]znovu smieme [D]ísť \npo [G]tvojich [A]ces[D]tách, \n[H7]nebo [e]máme [h]otvore[Fis]né.",
      },
      {
        cisloS: "V2",
        textik:
          "Každý môže rátať s Božou mocou,\nslobodne si kráčať dňom i nocou. \nTeba vzýva zem i vesmír.",
      },
      {
        cisloS: "V3",
        textik:
          "Národy sa zídu pred tvoju tvár,\npočúvajú v bázni tvoje slová,\nty máš súdy spravodlivé.",
      },
    ],
  },

  {
    cisloP: "2",
    nazov: "Aleluja – hlásať mám",
    slohy: [
      { cisloS: "R", textik: "[h]Aleluja, [A]aleluja, [G]alelu[Fis]ja!  " },
      {
        cisloS: "V1",
        textik:
          "[D]Hlásať mám, že Pán je [A]láskavý, \n[h]jeho láska nekon[Fis]čí.\n[D]Strápených a chorých [A]uzdraví, \n[h]jeho lás[G]ka nekon[Fis]čí.",
      },
      {
        cisloS: "V2",
        textik:
          "Skľúčený utekám k Pánovi,\non je v núdzi pomocou.\nBráni ma vždy proti útokom,\nodolám nepriateľom.",
      },
      {
        cisloS: "V3",
        textik:
          "Pána chcem velebiť piesňou chvál,\non je spásou mojich dní.\nV ňom plesám, lebo Pán víťazí,\nhriechy láskou porazí.",
      },
      {
        cisloS: "V4",
        textik:
          "Božie brány, buďte dokorán,\nmôžu vstúpiť pozvaní. \nVstúpim tam, kde na mňa Pán čaká,\nmiesto mám pripravené.",
      },
      {
        cisloS: "V5",
        textik:
          "Chválu vzdám, lebo je úžasný,\nnech sa každý presvedčí.\nHlásať chcem, že Pán je láskavý,\njeho láska nekončí.",
      },
    ],
  },

  {
    cisloP: "3",
    nazov: "Aleluja – chváľže duša moja",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[a]Ale[F]luja, [G]alelu[C]ja, [E] [a]alel[F]uja, [H7]ale[E7]lu[a]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[a]Chváľže, duša [D]moja, \n[E]svojho Pá[E7]na, \ntys’ [a]veľký [e7]vznešený [d]Pán.[G7] \n[a]Z teba žiari [D]jasné \n[E]svetlo zrá[E7]na, \nuž [a]znie hlas [D]nebes[E7]kých [a]chvál.",
      },
      {
        cisloS: "V2",
        textik:
          "Nebesia rozpínaš ako svoj stan \na schádzaš z oblakov k nám. \nNašu zem si spevnil zo všetkých strán, \nty vládneš nad všetkým sám.",
      },
      {
        cisloS: "V3",
        textik:
          "Prameň môže stiecť do potokov, riek, \non láka divokú zver. \nZo zeme vyvádzaš víno i chlieb, \nty dávaš ľuďom svoj smer.",
      },
      {
        cisloS: "V4",
        textik:
          "Keď prestieraš tmu, tak noc nastáva \na mesiac zažiari tmou.\nLen čo vyjde slnko, človek vstáva \na kráča si za prácou.",
      },
      {
        cisloS: "V5",
        textik:
          "Tak veľkolepé sú tvoje diela, \nže poznať v nich tvoju tvár. \nZem sa hemží množstvom divých zvierat, \nto všetko je Boží dar. ",
      },
      {
        cisloS: "V6",
        textik:
          "Celá zem nech chváli svojho Pána, \nveď on ťa chce obnoviť.\nStále túžim svojmu Bohu spievať \na hrať mu, kým budem žiť.",
      },
    ],
  },

  {
    cisloP: "4",
    nazov: "Aleluja – Pánovi nech znie",
    slohy: [
      {
        cisloS: "R",
        textik: "[a]Aleluja, [G]aleluja, [F]aleluja, [e]alelu[a]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[a]Pánovi nech znie v [e]nebesiach [a]sláva, \n[G]svätému [C]Bohu [G]česť nech [e]sa [a]vzdáva! \n[F]Velebte [G/D]Pána, [a]mocnos[e]ti [a]neba, \nvelebte [e]Pána, zástupy v [a]nebi!",
      },
      {
        cisloS: "V2",
        textik:
          "Slnko a mesiac, velebte Pána, \nžiarivé hviezdy, velebte Pána, \nnebesia nebies, velebte Pána, \nvody pod nebom, velebte Pána!",
      },
      {
        cisloS: "V3",
        textik:
          "Pánovo meno nech všetci chvália, \nna jeho slovo povstalo všetko, \nlen jeho meno je hodné chvály, \nnaveky nech ho stvorenie chváli!",
      },
      {
        cisloS: "V4",
        textik:
          "On svojmu ľudu veľkú moc dáva \na z prachu dáva a povýši biednych. \nVo svojich svätých zjavuje slávu \nPán Izraela, veľký a mocný.",
      },
      {
        cisloS: "V5",
        textik:
          "Sláva buď nášmu Otcu svätému \ni jeho Synu, Pánovi nášmu, \nDuchu Svätému, ktorý je v nás, \npo všetky veky vekov. Amen.",
      },
    ],
  },

  {
    cisloP: "5",
    nazov: "Aleluja – vstaň a vzdaj",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/: (Aleluja) [F]A[B]le[C]luja! \n(Aleluja) [g7/C]A[C]le[B]lu[F]ja! :/ ",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Vstaň a vzdaj Bohu  [B]chválu, česť, \n[g]ospevuj Kráľa, [a]ktorý [B]láme [C7]chlieb, \n[F]prijmi sám večnej [B]spásy dar, \n[d]nájdeš novú [g7/C]tvár[C7].",
      },
      {
        cisloS: "V2",
        textik:
          "On je Pán, svetlo dáva nám,\nobetoval sa, potom z mŕtvych vstal,\nláskou nám putá rozviazal,\non je večný Kráľ.",
      },
      {
        cisloS: "V3",
        textik:
          "Pán Ježiš poslal hlásať nás\nradostnú správu, ktorá lieči svet.\nAj ty v láske dnes nádej máš,\nsmútku v srdci niet. ",
      },
    ],
  },

  {
    cisloP: "6",
    nazov: "Aleluja - vzdávame vďaku",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Alelu[g]ja, a[C]lelu[F]ja, \n[d]alelu[G]ja, a[A7]lelu[d]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Vzdávame [g]vďaku, [C]chválu, [F]česť, \n[B]všemo[C]húci [d]Bo[A]že [d]náš, \n[d]že si sa [g]ujal [C4]svojej veľkej [F]moci \n[B]a za[C]čal si [d]kra[A]ľo[d]vať.",
      },
      {
        cisloS: "V2",
        textik:
          "Nastala teraz spása, moc \nikráľovstvo Kristovo. \nŽalobca bratov zvrhnutý je navždy, \nnoc stratila svoju moc.",
      },
      {
        cisloS: "V3",
        textik:
          "Nebesia chválu vzdávajú, \nradujú sa z víťazstva. \n'Zvíťazili sme Baránkovou krvou,' \nvšetci svätí spievajú.",
      },
      {
        cisloS: "V4",
        textik:
          "Dnes tebe, Otče, sláva znie, \ntebe Ježiš, sláva buď.\nSlávu ti večnú, Duchu Svätý, vzdáme, \naleluja, amen.",
      },
    ],
  },

  {
    cisloP: "7",
    nazov: "Alleluia – jubilate",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Alle[B]lu[F]ia! Alle[A]lu[d]ia, \n[B]jubilate [C4]De[C]-[d]o! \nAlle[B]lu[F]ia! Alle[A]lu[d]ia, \n[B]jubilate, [C4]al[C]lelu[F]ia",
      },
      {
        cisloS: "V1",
        textik:
          "Pána [F]chváľ, dobrý je [d]on, ale[B]lu[C]ja.\nStvoril [F]svet, miluje [d]nás, ale[B]lu[C]ja.\nOd ve[F]kov až nave[d]ky, ale[B]lu[C]ja,\nje voči [F]nám milosrd[d]ný, ale[B]lu[C]-[F]ja.",
      },
      {
        cisloS: "V2",
        textik:
          "Vzácny Boh dobrotivý, aleluja. \nDáva dar, Syna pre nás, aleluja.\nMária požehnaná, aleluja, \nz teba tvoj Pán je zrodený, aleluja.",
      },
      {
        cisloS: "V3",
        textik:
          "Kvôli nám on niesol kríž, aleluja.\nK úbohým sa naklonil, aleluja.\nHriechy vzal na seba sám, aleluja,\nslobodu máš, tak zaplesaj, aleluja.",
      },
      {
        cisloS: "V4",
        textik:
          "Dnes už viem, živý je Pán, aleluja.\nDáva mi silu mať rád, aleluja.\nLásky Duch vedie ma sám, aleluja,\na preto dnes mu pieseň hrám, aleluja.",
      },
    ],
  },

  {
    cisloP: "8",
    nazov: "Boh nám z lásky",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Boh nám z [C/E]lásky \n[B]svojho [g]Syna [C]dáva, \n[F]E[C]manu[d]el meno [C]má. \n[F]Nech sa [C/E]svetom \n[B]nesie [g]táto [C]správa. \n[B]Ale[C]lu[F]ja!",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Prišiel k nám nebeskou [C]bránou, \n[d]keď Otec povedal [a]áno,\n[B]v ľudskom tele on ku [F]nám šiel, \n[g7]ó, Emanu[C]el!",
      },
      {
        cisloS: "V2",
        textik:
          "Boh pravý, čo s nami bývaš, \nod vekov v srdciach ukrývaš\nso svetlom i živú nádej, \nó, Emanuel!",
      },
      {
        cisloS: "V3",
        textik:
          "Nad biednym si sa vždy skláňal, \nokovy väzneným zlámal,\nberieš na seba náš údel, \nó, Emanuel!",
      },
      {
        cisloS: "V4",
        textik:
          "Patríme do Božích plánov, \nnech sa zem ozýva chválou,\nobjavíme pohľad z krídel, \nó, Emanuel!",
      },
    ],
  },

  {
    cisloP: "9",
    nazov: "Bohu chvála nekonečná",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Bohu chvála [D]nekoneč[e]ná,\nvďaka [a]tebe, Je[C]žiš, \nmôj [a] Vykupi[D]teľ, \ntebe[G]chvála, [D]Duchu Svä[e]tý, \nteba, [a]Trojjedi[D]ný, \nznova [C]chválim a [G]ctím.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Otec dra[C]hý, \nvečne [D]vládneš svetom\nA [C]dávaš dary [D]svojim de[G]ťom.\n[G7]Stvoriteľ [e]môj, \ntebe [a]dôveru[D]jem, \ndo [H7]tvojich dla[e]ní \nsi srdce [a]rád ukry[D]jem.",
      },
      {
        cisloS: "V2",
        textik:
          "Spasiteľ môj, keď sa začína deň, \nnech k tebe stúpa moja pieseň. \nSrdce tvoje v tichu adorujem,\ndo tvojich očí, Ježiš, sa zamilujem.",
      },
      {
        cisloS: "V3",
        textik:
          "Duchu Boží, Duchu Posvätiteľ, \nty najláskavejší Učiteľ, \nzostúp na nás,prosím, na cestu svieť \na rozpaľuj v nás plamene pre celý svet.",
      },
    ],
  },

  {
    cisloP: "10",
    nazov: "Bože večný",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/:[a]Bože večný, [F]najvyšší [C]Pán, \n[G]tebe buď [E]sláva [a]neko[e]neč[a]ná. :/",
      },
      {
        cisloS: "V1",
        textik:
          "Len v [a]tebe je [e]sila i [F]múd[C]rosť.\n[d]Dostala krídla [E7]láska.\nS [d]tebou sa [d7]môžeme [d]vzniesť \nk večnému [E]chrámu.",
      },
      {
        cisloS: "V2",
        textik:
          "Aj do môjho srdca si vstúpil. \nTemnoty moc sa stráca,\nžiarivé svetlo si sám, \nmôj večný Pán.",
      },
      {
        cisloS: "V3",
        textik:
          "Veď len tebe patrí vždy sláva. \nPočuješ nás a vnímaš. \nPokorných privedieš sám \nk svojim cestám.",
      },
      {
        cisloS: "V4",
        textik:
          "Dnes tebe nech znie, Otče, sláva, \nSynovi česť sa vzdáva,\nchvála ti, Duchu Svätý, \ntrojjediný.",
      },
    ],
  },

  {
    cisloP: "11",
    nazov: "Celý svet nech jasá",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Celý svet [A]nech jasá chválou,\nnech sa [E]raduje zem, \n[fis]Boh je [D]úžasný [E]Pán.\nJemu aj [A]obloha chválu \nspieva, [E]raduj sa tiež, \n[D]hraj, a[E]lelu[A]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[Cis]Boh z nebies sa nám [fis]dáva,\n[Cis]zem zohrial jeho [D]lúč.\nAk [E]mu spievame [fis]„sláva“,\nradosť [D]vchádza do našich [E4]sŕdc[E].",
      },
      {
        cisloS: "V2",
        textik:
          "Náš pokoj mizol v prázdne, \ndnes už môže v nás rásť. \nTakto pôsobí Pán\nsvojou zázračnou silou v nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Prijmi z úst našich chválu,\ndnes ti z nás každý hrá,\nhlas otvára nám bránu,\nty si z mŕtvych vstal, si náš Pán.",
      },
    ],
  },

  {
    cisloP: "12",
    nazov: "Dnes jasajte národy",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Dnes [F]jasajte [d]národy, \n[g]zdvihnite [C]hlas,\n[A]veľký [d]Kráľ prišiel \n[g]sem, medzi [C]nás.\nTak [F]jasajme, [d]Boh si vzal \n[g]naše te[C]lo,\n[A]spievaj[d]me smelo, \n[g]ale[C] lu[F]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Pretože dieťa je [a]nám dané,\n[d]pretože zrodil sa [C]Syn, \nvečný [F]Boh, Knieža [C]pokoja, [d]Pán,\n[g]naveky sklonil sa k [C]nám.",
      },
      {
        cisloS: "V2",
        textik:
          "Boha nikto nevidel,\nale v Synovi zjavil sa nám, \naby ukázal láskavú tvár, \nJežiša nám daroval.",
      },
      {
        cisloS: "V3",
        textik:
          "On pre naše spasenie,\naby navrátil poblúdené, \naby priniesol pokoj na zem,\npreto sa znížil až sem.",
      },
      {
        cisloS: "V4",
        textik:
          "Keď bol čas naplnený,\nBoh sa narodil z čistej Panny, \nstal sa dieťaťom nemohúcim,\nhoci je všemohúci.",
      },
      {
        cisloS: "V5",
        textik:
          "Včera, dnes je tu s nami,\nzajtra ostáva medzi nami, \npreto hlásajme radostný čas:\n'Boh zostal uprostred nás.'",
      },
    ],
  },

  {
    cisloP: "13",
    nazov: "Dvíhame svoj zrak k výšinám",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Dvíhame svoj zrak k [fis]výšinám: \n[G]„Príď, ó, Bože svä[D]tý!“ \n[G]Vstúp, naše vnútro [fis]zmeň rados[h]ťou, \nveď [G]ty si [e]spásou [A]nám, \nlen [G]ty ver[A]ný si [D]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Keď volám ťa, môj [fis]Pán, \nskloníš [G]k nám [A]s láskou [D]tvár. \n[D]Vstúp aj dnes, Vzneše[fis]ný,\nchcem ťa [G]chvá[A]liť, môj [D]Kráľ.",
      },
      {
        cisloS: "V2",
        textik:
          "Ty svoj ľud nesieš sám, \nna mňa s láskou hľadíš. \nK pastvinám vedieš nás, \nbrány nám otvoríš.",
      },
      {
        cisloS: "V3",
        textik:
          "Tým, ktorí hľadať chcú, \nsrdce sám naplníš. \nTým, ktorí volajú, \nsvoju dlaň otvoríš.",
      },
    ],
  },

  {
    cisloP: "14",
    nazov: "Hoden chvál",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Ak [e7]náš dobrý Pán je vždy s nami, \ntakkto je proti [A4]nám [A]?\nVzdajme [G]vďaku [A]Páno[h7]vi\n[e7]za jeho lás[A]ku več[D]nú[D7].\nOn [G]nás ňou [A]napl[h7]ní, \n[e7]radosť nám dá [A]každý [D]deň.",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Hoden chvál je môj Pán, \njemu[fis]hrám, \npri ňom [G]mi nikdy nič nechý[A]ba,\n[Fis]na ze[h7]lených pastvi[Gmaj]nách \nsa [e7]o mňa posta[A]rá.\nKaždý [D]deň hoden chvál \nje náš [fis]Pán,\npozná túž[G]by v srdciach ukry[A]té.\n[Fis]Stojme [h7]stále pevne v [Gmaj]ňom!",
      },
      {
        cisloS: "V2",
        textik:
          "Keď som s ním, zlého sa nebojím,\naj keď kráčam tmavou dolinou,\njeho prút a palica,\ntie sú mi útechou.\nV temnotách, keď nás strach prekvapí, \nnechajme sa jeho Duchom viesť.\nKráčajme, nebojme sa!",
      },
      {
        cisloS: "V3",
        textik:
          "Predo mnou, Pane, prestieraš stôl,\npred tvárou mojich nepriateľov\nsvojho Ducha vylievaš,\noplývam milosťou.\nAni púšť nech vieru nezlomí,\nsmrťou Pán každý hriech porazil.\nPokoj náš sa nestratí.",
      },
    ],
  },

  {
    cisloP: "15",
    nazov: "Hosanna – dnes vítame Kráľa",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Hosan[C]na, ho[H]san[e]na,\ndnes [C]vítame [G]Kráľa, \n[a]dvíhame [H]hlas.\n[G]Hosan[C]na, ho[H]san[e]na \nuž [C]vchádza do [G]chrámu \n[a]Spasi[D]teľ [G]náš.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Tvoja je [C]zem i [H] všetko na [e]nej, \n[C]bohatstvo [G]hviezd i [a] krútňavy [H] vôd.\n[G]Patria ti [C] národy [H]požehna[e]né, \n[C]pohoria [G]splietaš [a]do veľ[D]kých [G]hôr. ",
      },
      {
        cisloS: "V2",
        textik:
          "Prekryl si plášťom posvätný vrch, \nkončiare halíš do bielych rúch.\nAko smiem vojsť na posvätnú zem? \nSo srdcom čistým sťa diadém.",
      },
      {
        cisloS: "V3",
        textik:
          "Len čistým dávaš požehnanie, \nodmenu od Boha, Spasiteľa.\nV bázni ťa hľadá pokolenie \ntých, ktorí vedia, že Boh je ich Kráľ.",
      },
      {
        cisloS: "V4",
        textik:
          "Prastaré brány, zdvihnite hlavice, \nlebo má vstúpiť sľúbený Kráľ.\nKto je ten kráľ, čo prichádza k nám? \nVíťaz nad smrťou, to je ten Kráľ.",
      },
      {
        cisloS: "V5",
        textik:
          "Nech sa vyvýšia prastaré brány, \nlebo má vstúpiť sľúbený Kráľ.\nKto je ten kráľ, čo prichádza k nám? \nJe to Pán zástupov, to je ten Kráľ.",
      },
    ],
  },

  {
    cisloP: "16",
    nazov: "Chcem spievať vrúcne hymny",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Chcem [D]spievať [C]vrúcne \n[G]hymny lásky, môj [A]Pán, \na [D]chváliť [h]chcem [e]meno [A4]sláv[A]ne. \nDnes [D]príď, som [C]tvoj, \nty [G]vstúpiť môžeš, môj [A4]Kráľ[A], \ntvoj [D]vzácny [h] hlas [e]rozpoz[A]nám. ",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Hľa, [Fis7]ja [h]som tu dnes, \nmôj [e]Pán.\nTvoj [A]hlas volá ma: „Buď [D]môj!“\nMo[Fis7]je [h]srdce krajší [e]hlas \n[C]nepoz[A4]ná[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Všetko s dôverou ti dám. \nKeď zaznie tvoj tichý hlas, \nduša spieva v náručí \nslobodná.",
      },
      {
        cisloS: "V3",
        textik:
          "Hriech a smrť, čo vládla v nás, \nuž stráca pred tebou moc.\nVstal si z mŕtvych, tiež smiem stáť, \nsi môj Kráľ.",
      },
    ],
  },

  {
    cisloP: "17",
    nazov: "Chcem spievať žalm",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[h]Chcem [C]spievať žalm, \ntebe [D]chválu vzdám. \nMôj [e]život je tvoj [h]chrám. \nV ňom [C]tancujem \nako [D]Dávid, kráľ, \na [e]vzývam [h]ťa, môj [e]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "Tvoja [G]láska k nám \nje vždy [D]úprimná, \nona [e]dáva pravde v nás [h]rásť.\nVojdi, [C]Duch Svätý, naplň [D]nás, \n[e]chvála buď!",
      },
      {
        cisloS: "V2",
        textik:
          "Áno, vždy si bol Otec pravdivý.\nTy si Boh svätý, si môj Pán, \nSkala, na ktorej budem stáť, \nchvála buď!",
      },
      {
        cisloS: "V3",
        textik:
          "Ty si Pán verný, všade prítomný,\nvždy si blízko tých, čo sú v tmách, \npreto svoj život ti dám rád, \nchvála buď!",
      },
    ],
  },

  {
    cisloP: "18",
    nazov: "Christus idem",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Chris[H]tus [fis]i[cis]dem \n[A]he[E]ri [fis]ho[E]di[H]e et [E]sem[H]per, \n[E]Chris[H]to [fis]glori[Gis]a \n[fis]nunc et [E/Gis]in [A6]sae[H]cu[E]la!",
      },
      {
        cisloS: "V1",
        textik:
          "[A]Quis [E/Gis]nos \n[fis7]se[E/Gis]pa[A6]ra[cis]bit \na [h]ca[cis]ri[D]ta[cis]te [H4]Chris[H]ti? \n[fis]Si [E/Gis]De[H7]us \npro [cis]no[H/Dis]bis [E]est \nquis [D]erit [fis]contra [H4]nos[H]? ",
      },
      {
        cisloS: "V2",
        textik:
          "Who will separate us \nfrom Jesus' love that saves us? \nWho will be against us\nif the Lord is by our side?",
      },
      {
        cisloS: "V3",
        textik:
          "Ktože nás odlúči \nod Kristovej lásky? \nAk je živý Boh za nás, \ntak kto je proti nám?",
      },
      {
        cisloS: "V4",
        textik:
          "Qui nous privera \nde l'amour dont Dieu nous aime? \nSi Dieu lui-meme est pour nous, \nqui sera contre nous? ",
      },
      {
        cisloS: "V5",
        textik:
          "Was kann uns noch trennen \nvon Gottes großer Liebe? \nWenn Gott selber für uns ist, \nwer wird gegen uns sein?",
      },
    ],
  },

  {
    cisloP: "19",
    nazov: "Chválou naplňme chrám",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Chvá[C]lou [D]naplňme [H]chrám, \nlebo [e]Pán [C]je [a]blíz[D]ko. \n[G]Chvá[C]lou [D]naplňme [H]chrám,\nlebo [e]vchádza [D]náš [G]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "[G] Kráča[D] júc v deji[C]nách, \n[C]pevne [D]stáť radost[e]ní \nje [C]výsa[D]dou pre [H]tých, kto[e]rí \n[C]spoznali, kto je [D]Kráľ.",
      },
      {
        cisloS: "V2",
        textik:
          "Sem do Pánových rúk \nodlož ťarchu a kríž \na s nádejou, čo vníma cieľ, \nBožiu tvár uvidíš.",
      },
      {
        cisloS: "V3",
        textik:
          "Boh pravý pokoj dá,\nčistým prúdom je Pán, \nlen on ma s láskou privedie \nk nebeským pastvinám.",
      },
    ],
  },

  {
    cisloP: "20",
    nazov: "Chválu ti vzdám",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Chválu ti vzdám, \npokorne [H]vyznávam, \nže ty si [cis7]Kristus, Boh a [A]Pán.\nHľadíme [E]na tvoj kríž, \nBaránok [H]víťazný, \nSpasiteľ [A]náš, ty [H]vládni [E]nám.",
      },
      {
        cisloS: "V1",
        textik:
          "[D9]Cestu otváraš predo [A]mnou \n[H4]a moju [H]nádej posil[cis]níš.\n[A]Strachu viac [E]niet, \nchcem [D]kráčať pred te[cis]bou,\n[A]dôveru [E]mám, aj [D]keď som [H]v tmách.",
      },
      {
        cisloS: "V2",
        textik:
          "Aj keď som v skúškach, Pane môj,\nkeď boje zvádzam so sebou,\nv tebe som víťaz, vieru zachovám,\nsilu mi dávaš, nie som sám.",
      },
      {
        cisloS: "V3",
        textik:
          "Do srdca nám vlej pravdy lúč, \ntvoj zákon lásky doňho vpíš.\nV tichosti príď k nám, sám vyučuj nás, \nna obraz svoj pretváraj nás.",
      },
    ],
  },

  {
    cisloP: "21",
    nazov: "Chválu vzdávaj duša Pánovi",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[fis]Chválu vzdávaj, duša, [D]Pánovi.\n[E]Pán je môjho žitia [A]sviecou,\n[Cis7]dáva mi svetlo mojej [fis]viery. \n[E]Pán živé slová [A]má, \n[Cis7]Pán živé slová [fis]má.",
      },
      {
        cisloS: "V1",
        textik:
          "[fis]Blažení sú [cis]tí, čo s Pánom \n[D]kráča[E]jú. \n[A]Úprimne [fis]chcem \ntvoje [cis]slovo zacho[D]vať.\n[E]Uč ma, Pane [A]môj, \n[h]lás[cis7]ke ty [fis]sám.",
      },
      {
        cisloS: "V2",
        textik:
          "Blažení sú tí, čo v Pána dúfajú. \nPríkazy Pána chcem verne zachovať,\njeho pravdu dnes ohlasovať mám.",
      },
      {
        cisloS: "V3",
        textik:
          "Blažení sú tí, čo plnia zákon tvoj. \nViac ako diamanty teba milujem, \nvieru v teba mám, chválu ti vzdám.",
      },
      {
        cisloS: "V4",
        textik:
          "Blažení sú tí, čo múdrosť hľadajú. \nVrúcnosťou Pán moje srdce naplnil, \nradovať sa chcem zo všetkých síl.",
      },
    ],
  },

  {
    cisloP: "22",
    nazov: "Chválu vzdávame",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Alelu[h]ja, ty [(H)]láskou [e]vládneš, \nalelu[a]ja, si Ví[e]ťaz, [D]Kráľ. \nAlelu[h]ja, ty lás[(H)]kou [e]vládneš, \nradostne [a]hráme. [D7]A[G]men.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Chválu [C]vzdáva[G]me, \nteba [C]víta[G]me. \nKaždé [e]srdce s [a]láskou [D ]spieva, \nže [C]Kráľ moc[G]ný a [C]Boh ver[G]ný \nide [e]s nami [a]k víťaz[D]stvám.",
      },
      {
        cisloS: "V2",
        textik:
          "Tvojím víťazstvom \ntemno stráca moc. \nPánov anjel všetkých vedie \ndo nádvorí ku Kráľovi, \ntam je svadba nebeská.",
      },
      {
        cisloS: "V3",
        textik:
          "Preto v slávnostnom \nšate vstúpme dnes \nspolu s ním do jeho slávy. \nTam nás čaká náš Pán a Boh, \nbuďme jeho nevestou.",
      },
    ],
  },

  {
    cisloP: "23",
    nazov: "Je čas opustiť hroby temné",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Je čas [d]opustiť [a]hroby tem[d]né, \nprejsť do svetla zo [C]spánku no[F]cí \na [g7]kráčať jasa[C]júc, že náš [F]Boh \nje [e7]trojjedi[A4]ný[A].",
      },
      {
        cisloS: "V1",
        textik:
          "Ty, [d]Víťaz nad [g]smrťou, \nsi [C]vzkriese[F]ný, \nv tebe [d]vidíme [C]Otcovu [G4]tvár[G]. \nTy [d]si naším [g]svetlom, \nnašou [C]rados[F]ťou, \nslobod[d]ní dnes \n[B]chválu, [g]česť ti [C4]vzdá[C]me.",
      },
      {
        cisloS: "V2",
        textik:
          "Ty, Víťaz nad hriechom, si vzkriesený, \nchceme spoločne za tebou ísť. \nTy nás vedieš k Otcovi a chrániš nás, \nnech sa vznáša k tebe pieseň chvál.",
      },
      {
        cisloS: "V3",
        textik:
          "Ty Svätého Ducha si poslal nám, \non je oheň, čo horí aj v nás. \nJe vánkom i hlasom Božím tajomným, \nDuch Svätý, vždy silu daj a chráň!",
      },
      {
        cisloS: "V4",
        textik:
          "Ty, Kráľ všetkých sŕdc, \nKriste vzkriesený,\nty si Boh mocný, hľadíš na nás. \nTy vrátiš sa znova, k sebe vezmeš nás. \nTy si Pán, tak nemeškaj a príď!",
      },
    ],
  },

  {
    cisloP: "24",
    nazov: "Ježiš je Kráľ",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Ježiš je [D]Kráľ, \nza tri dni [G]postavil [D]chrám,\n[C]hrob je už [C/G]práz[G]dny, \non [a]vrátil sa [D]k nám.\n[G]Jasavá [D]pieseň, čo [G]svet zobu[D]dí, \n[a]znie,[G]a[C]lelu[G]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[h]Pieseň lásky vďačne [e]hrám, \n[D4]vnáša [D]svetlo našim [G]tmám,\n[a]nad smrťou Pán [e]víťa[C]zí, \n[a7]on je [F]vzkriese[D4]ný[D]!",
      },
      {
        cisloS: "V2",
        textik:
          "Chóry slávne plesajú, \nsvojho Kráľa vítajú,\ncelé ľudstvo spieva v ňom: \non je vzkriesený!",
      },
      {
        cisloS: "V3",
        textik:
          "Láska zvláštnu silu má, \nhrob sa ňou otvoriť dá,\nplač na tanec v nás mení, \non je vzkriesený!",
      },
      {
        cisloS: "V4",
        textik:
          "Láska Pána nesie nás,\ns ním život chuť neba má,\nkaždý k nemu môže prísť, \non je vzkriesený!",
      },
    ],
  },

  {
    cisloP: "25",
    nazov: "Ježiš, láskavý Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[a]Ježiš, [E7]láskavý [a]Pán, \n[A7]cesta [d]pre mňa [g6]priprave[d]ná, \nty [(Ddim)]si [a]pravda [a7]aj život [F]náš, \n[E7]stále veď [a]nás.",
      },
      {
        cisloS: "V1",
        textik:
          "Veru [d]nik ešte k nám \ntakto [G7]nehovoril. \nNikto [e7]viac ako on \nzázra[A7]ky nespraví, \n[F]Pán, E[H7]manu[E7]el.",
      },
      {
        cisloS: "V2",
        textik:
          "Vraví Ján Krstiteľ: \n'Hľa, Baránok Boží!'\nJe to on, koho Boh \npredstavil: 'Hľa, môj Syn.'\nMôžeme ho zrieť.",
      },
      {
        cisloS: "V3",
        textik:
          "Kto verí vo mňa, má \nv sebe život večný.\nPôjdem s ním po cestách, \naj za nocí temných. \nSvietiť mu chcem sám.",
      },
      {
        cisloS: "V4",
        textik:
          "Moje kráľovstvo, ver, \nnie je z tohto sveta. \nJa som Kráľ a len ten, \nkto dnes pravdu hľadá, \nten pozná hlas môj.",
      },
      {
        cisloS: "V5",
        textik:
          "Z môjho vnútra tečú \nprúdy živej vody.\nMôj Duch vás naplní, \nbuďte mi svedkami. \nDôveru vám dám.",
      },
    ],
  },

  {
    cisloP: "26",
    nazov: "Ježiš mi dal život",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/: Ježiš mi [F]dal život, \nsom jeho [B]vzácny [C]chrám,\n[a]on je ži[B]vý, a[g7]lelu[F]ja. :/",
      },
      {
        cisloS: "V1",
        textik:
          "My sme [F]Pánovou sviecou, \n[a7]svieťme, \naby [B]žiarila láskou [F]zem. \nSpolu zahrňme Pána [a7]chválou, \non už [B]prichystal verným [C]sieň.",
      },
      {
        cisloS: "V2",
        textik:
          "Kde sme kráčali tmou, on vchádza, \naby rozsekol závoj chmár. \nZem už plápolá krásnou túžbou\nv Bohu rozžiariť prázdnu tvár.",
      },
      {
        cisloS: "V3",
        textik:
          "Ježiš naznačil nám smer k cieľu, \nako zúrodniť mŕtvu zem. \nOhňom pravdy zapáliť vieru,\nspolu ohlásiť Pánov deň.",
      },
      {
        cisloS: "V4",
        textik:
          "V svojom srdci nás spája láskou,\nlebo deťmi Božími sme. \nOslavujme a chváľme Pána, \non je pravou cestou, je smer.",
      },
    ],
  },

  {
    cisloP: "27",
    nazov: "Kristus z mŕtvych vstal",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Kris[B]tus [F]z mŕtvych vstal [C]nám, \nale[d]lu[B]ja, smrť [F]nemá viac [C]moc. \n[F]Kris[B]tus [F]z mŕtvych vstal [C]nám, \nale[d7]lu[B]ja, on [F]vykúpil [C]nás.",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Hrob [G]prázdny je, \n[C]kameň od[G]valený, \n[a]s rá[F]nom [a]prichádza [G]on. \n[d]Pán [a7]z mŕtvych vstal, \n[d]hľa, hrob je [a]prázdny, tak [F]ver: \n[C/E]Kristus je [F]víťaz, a[C]men!",
      },
      {
        cisloS: "V2",
        textik:
          "Náš Pán Ježiš žije, tak veríme, \nv láske vykúpil nás. \nBoh svojho Syna v smrti nenechal, \npoď, tešme sa, aleluja!",
      },
      {
        cisloS: "V3",
        textik:
          "Zem, nebo i celý vesmír chváli \nPána, Kráľa kráľov. \nSmrť, kde máš svoj osteň? \nVeď zvíťazil on. \nZnej: Amen, aleluja!",
      },
    ],
  },

  {
    cisloP: "28",
    nazov: "Len teba vzývam",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[a]Len teba vzývam, [F]chválu ti vzdám.\n[a]Len ty si slávny [d]Boh, môj [E]Pán. \n[C]Kráľ najvyšší, [e]Boh jediný, \n[a]láskou a dôverou [E]dvíhaš [a]nás.",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Priviňme sa k Srdcu, [G]chváľme, \n[d]spievajme: On je [E]Pán!\n[C]Na citaru hrajme [G]piesne, \n[d]nech každý chválu [E]vzdá.",
      },
      {
        cisloS: "V2",
        textik:
          "Vždy, keď som sa topil v hriechu, \ncítil som pohľad tvoj.\nZo zajatia si ma viedol, \nsám niesol pred svoj trón.",
      },
      {
        cisloS: "V3",
        textik:
          "Počúvajme slová Pána: \nVráť sa mi späť, syn môj, \npšenicou ťa budem sýtiť, \naj svoje srdce dám.",
      },
    ],
  },

  {
    cisloP: "29",
    nazov: "Len ty si Pán môj",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Len ty si [B]Pán [F]môj, \nob[B]jímaš celý [F]svet.\nLen ty si [B]Kráľ [F]môj, \nbez [B]teba spásy [F]niet. \nBoh, plný [a]lás[d]ky, \n[B]život [g]v tvoju náruč [B]vložím [C4]rád[C].",
      },
      {
        cisloS: "V1",
        textik:
          "[a]Pán nežný, [B]vždy ti \n[g7]rád odpus[d7]tí, \n[B]láskavý Otec [C4]náš[C]. \n[a]On verný [B]je i [g7]trpezli[d7]vý \na [B]k svojim deťom vždy [a]dobroti[C]vý.",
      },
      {
        cisloS: "V2",
        textik:
          "Pán dobrý, prisľúbeniam verný, \nk dôvere volá nás.\nPravdivý je vo všetkých slovách \na spravodlivý v tom, čo koná.",
      },
      {
        cisloS: "V3",
        textik:
          "Pán pomáha tým, čo klesajú, \nblízko je skľúčeným. \nOn je Pán svätý, nekonečný, \nhoden je chvály a veleby.",
      },
      {
        cisloS: "V4",
        textik:
          "Čím sa Pánovi dnes odvďačím \nza všetko, čo mi dal? \nChválou v ňom moje srdce plesá \na radosť moja je nekonečná.",
      },
    ],
  },

  {
    cisloP: "30",
    nazov: "Len ty si, Pane, spása moja",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Len [a]ty si, Pane, [d]spá[G]sa mo[C]ja, \nty si [a]štít a Vy[d]kupiteľ[E]môj, \nsi [F]pevnos[G]ťou, čo [C-E7]chrá[a]ni, \nsi [d]Pán, Boh [E]môj.",
      },
      {
        cisloS: "V1",
        textik:
          "Vždy, keď [a]v núdzi [G]volám \n[C]k Páno[a]vi, \n[d]počuje môj hlas proseb[E]ný.\nMojich [F]nepria[G]teľov [C]po[E7]ra[a]zí, \n[F]preto jeho [d]tvár vele[E]bím[E7].",
      },
      {
        cisloS: "V2",
        textik:
          "V ňom sa ukryť smiem, on je môj štít, \nopevnený hrad kamenný,\npreto všetkým ľuďom zvestujem: \nBoh tvoj život rád premení.",
      },
      {
        cisloS: "V3",
        textik:
          "No tak povedz, kto je pravý Boh, \nak to nie je Boh vznešený?\nOn ma novou silou obdaril,\nnech je svätý Kráľ uctený!",
      },
    ],
  },

  {
    cisloP: "31",
    nazov: "Nám sa zjavil Ježiš",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[fis]Nám sa zjavil Ježiš, \n[D]poď, aj ty uveríš, \n[E]tiež sa [E7]stretneš [Cis]s ním. \n[fis]Spásu nesie svetu, \n[D]z mŕtvych vstal a je tu,\n[E]on je [D]živý, náš [fis]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "[A]Rýchlo vstaň, vošiel [cis]k nám \n[D]známy muž, plný [E]rán.\n[A]Znie už hlas Otcov [D]v nás: \n[h]Hľa, môj Syn je váš[Cis]Pán!",
      },
      {
        cisloS: "V2",
        textik:
          "On sa stal bratom nám, \nsám odniesol môj kríž.\nSyn Boží, Svätý Kráľ, \nmôžem s ním svetom ísť.",
      },
      {
        cisloS: "V3",
        textik:
          "Zblúdených prišiel nájsť, \ntých, čo tápajú v tmách.\nOn je Pastierom stád, \nmá všetkých ľudí rád.",
      },
      {
        cisloS: "V4",
        textik:
          "Ak veríš a chceš rásť, \nmáš večný život s ním.\nAk veríš a chceš rásť, \nvedz, len v ňom radosť máš.",
      },
    ],
  },

  {
    cisloP: "32",
    nazov: "Náš Pán, Emanuel",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Náš [A]Pán, Emanu[h]el, \nmeno [D]máš nádher[E]né,\ntvoja [A]tvár, keď žiari v tm[E4]ách[E], \nkaždý [h]z nás v nej svetlo [D]náj[E]de.\nTy [A]láskou k nám ho[h7]ríš, \nzapla[D]víš svet ce[E]lý.\nDuch Svä[A]tý, zostúp na [E4]nás[E],\nbuduj [h]v nás tvoj svätý [G]chrám[E].",
      },
      {
        cisloS: "V1",
        textik:
          "[A]Svet bol skrz [h7]teba, Ježiš, \n[D]stvore[E]ný, \n[A]krásou tvo[fis]jou som, Pane, \n[G]nadše[E]ný.\n[A]Ty dávaš [h7]svojmu ľudu \n[D]šat no[E]vý, \ndal si [h]nám život več[E]ný, \náno, [D]viem, prebývaš [G]v nás[E].",
      },
      {
        cisloS: "V2",
        textik:
          "Ježišu, ty si Kráľom pokorným, \nvšetko, čo mám, si smrťou vydobyl. \nDaj, nech sa nikdy viac už nestratím,\nnech tvoj Duch ma posilní, \nsrdce chválou naplní.",
      },
      {
        cisloS: "V3",
        textik:
          "Pane, buď zvelebený nad všetkým, \npred tebou nech sa každý pokloní.\nNech každý jazyk v pravde vyznáva:\nTy si Pán, Boh môj a Kráľ, \nty si slávou Otcovou.",
      },
      { cisloS: "V4", textik: "[A]Alelu[h7]ja! Náš [G]Pán, Emanu[E]el! " },
    ],
  },

  {
    cisloP: "33",
    nazov: "Náš Pán mocný a vznešený",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Náš [F/E]Pán, [d]mocný a [C]vznešený, \n[d]vchá[d/C]dza [G]do slávy [A]v znamení \n[B]krí[g]ža, [C7]prináša [F]spásu \n[g7]nám [C]nave[F]ky.",
      },
      {
        cisloS: "V1",
        textik:
          "/: [F]Ty, Baránok Bo[C]ží, :/ \n/: [d]si sa obeto[a]val :/ \n/:[B]svoju krv si vy[F]lial, :/ \n[d]len [G7]kvôli [C4]nám[C].",
      },
      {
        cisloS: "V2",
        textik:
          "/: Otec sa radoval, /:\n/: slávne meno ti dal, :/ \n/: je nad všetky mená, :/ \nJežiš, náš Pán.",
      },
      {
        cisloS: "V3",
        textik:
          "/: V nebi i na zemi, :/ \n/: všetko sa pokloní, :/ \n/: každý jazyk vyzná, :/ \nže ty si Pán.",
      },
    ],
  },

  {
    cisloP: "34",
    nazov: "Náš Pán prebýva v chvále",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Náš [B/D]Pán pre[g]býva [C]v chvále, \n[F]do [B/D]slávy [g]skryl svoj [C]trón, \n[F]s lás[B/D]kou tu [g]chváli [C]stále \n[F]ľud [B/D]Kráľa [C]náro[F]dov.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Pane, teba [C/E]chválime \n[g]v tvojom svätom [C]chráme, \n[B]hlahol našich [C]sŕdc [a]nech sa \n[d]nesie oblo[C]hou. \n[F]Pane, teba [C/E]chválime \n[g]v tvojich [C]lávnych, \n[B]piesne oslav[C]né žiaria \n[d]Božou vele[C]bou.",
      },
      {
        cisloS: "V2",
        textik:
          "Pane, teba chválime \njasným zvukom poľníc, \nrozochvený tón vanie \nharfou, citarou. \nPane, teba chválime \nbubnom,spevom, tancom, \nchválu vyjadríme aj \nlýrou i flautou.",
      },
      {
        cisloS: "V3",
        textik:
          "Pane, teba chválime \nzvučnými cimbalmi, \nv našich rukách chváli aj \ncimbal jasavý. \nVšetko, čo len dýcha, tu \nchválu Bohu spieva, \naleluja spieva a \naleluja hrá.",
      },
    ],
  },

  {
    cisloP: "35",
    nazov: "Nebesia rozprávajú",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Nebesia [B]rozpráva[C]jú: \n„Boh je [F]slávny.“\n[d]Obloha [g]hlása [C]dielo jeho [F]rúk.\n[d]Deň o tom [B]novému [C]dňu \ndáva [F]správu,\n[d]stvorenie [g]nemôže [A7]naň zabud[d]núť.",
      },
      {
        cisloS: "V1",
        textik:
          "Tvoje [d]slovo sa aj [C]nás \nbytostne [F]týka, \n[g7]dáva [A7]čistú [d]radosť.\nTy si ustanovil [C]dokonalý [F]zákon, \n[g7]osvie[A7]žuje [d]dušu.",
      },
      {
        cisloS: "V2",
        textik:
          "Všetky rozhodnutia Pánove \nsú správne, \npotešujú srdce.\nVšetky prikázania Pánove sú jasné, \nosvecujú oči.",
      },
      {
        cisloS: "V3",
        textik:
          "Tvoje výroky sú pravdivé a múdre, \nvzácnejšie než zlato.\nTvoje slovo chutí ako včelie plásty, \nako kvapky medu.",
      },
      {
        cisloS: "V4",
        textik:
          "Preto ťa oslávim vždy svojou piesňou,\npoklonu vzdám a teba velebím.\nSrdce ti otváram, viem, už si vstúpil, \ndo tvojich dlaní svoj život položím.",
      },
    ],
  },

  {
    cisloP: "36",
    nazov: "Nové svetlo sa sklonilo k nám",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Nové [F]svetlo sa [G]sklonilo [a]k nám.\nV jeho [F]lúčoch [G]srdce ho[a]rí. \nTýmto [F]slnkom [G]si ty, môj [a]Pán. \nTvojej [F]láske [G]vždy otvo[a]rím.",
      },
      {
        cisloS: "V1",
        textik:
          "Teš sa, [C]pláň, tiež [d]zaplesaj, [G]zem. \nRadosť [C]veľká [d]horí aj [G]v nás.\n[F]Kráča s nami náš [e]Boh \na [F]je[C]ho [F]láska [d]dvíha [G]nás.",
      },
      {
        cisloS: "V2",
        textik:
          "Slepí vidia, zaplesajú.\nHluchí v bázni zajasajú. \nBoh je prítomný v nás, \ntak poďme hlásať: 'Vstúpil Kráľ!'",
      },
      {
        cisloS: "V3",
        textik:
          "Božia láska pozvala nás.\nV nebi sú aj naše mená, \npreto hlásajme zvesť, \nže každý môže pravdu nájsť.",
      },
    ],
  },

  {
    cisloP: "37",
    nazov: "Oslavujme Pána",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[a]Osla[d]vujme [a]Pá[F]na \n[G]za všet[C]ko, [d]čo [E4]z lásky [E]nám dal,\n[a]osla[d]vujme [a]Pá[F]na, \n[G]zaspie[C]vaj[d]me [E]pieseň [a]chvál.",
      },
      {
        cisloS: "V1",
        textik:
          "/: [G]Zem ako [C]chrám, :/\n/: [F]nebeskí [E]an[a]jeli, :/\n/: [d7]oblaky od [G]rána :/ \nchvália [C]svoj[d]ho [E]Pá[a]na.",
      },
      {
        cisloS: "V2",
        textik:
          "/: Slnko, mesiac, :/\n/: ligotavé hviezdy, :/\n/: chladná rosa zrána :/ \nchvália svojho Pána.",
      },
      {
        cisloS: "V3",
        textik:
          "/: Zima i mráz, :/\n/:páľava i vietor :/\n/: pokojne sa skláňa, :/ \nchvália svojho Pána.",
      },
      {
        cisloS: "V4",
        textik:
          "/: Pramene vôd, :/\n/: rastliny na zemi, :/\n/: vrchy odpradávna :/ \nchvália svojho Pána.",
      },
      {
        cisloS: "V5",
        textik:
          "/: Národ Boží, :/\n/: synovia človeka :/\n/: i nebeská brána :/ \nchvália svojho Pána.",
      },
    ],
  },

  {
    cisloP: "38",
    nazov: " Otvárajme už je tu Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Otvárajme, [C]už je tu [d]Pán,\n[B]vo svojej sláve [g]vstupuje [C]k nám.\n[F]Zaľúbme sa [C]do jeho [d]slov,\nzahorme [B]láskou [g]a vele[C]bou.",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Chválou mi dnes moje \n[a/E]srdce pla[d]nie,\n[B]pred tvojou velebou, \n[g]dobrý Pa[C7]ne.\n[F]Spasil si milosťou \n[a/E]celý náš [d]rod,\n[B]s vďakou ti spievame, \n[g ]ty si náš [C7]Boh.",
      },
      {
        cisloS: "V2",
        textik:
          "Stvoriteľ vesmíru nekonečný,\nod vekov naveky si Boh večný.\nLáskou si nás stvoril, v srdci nás máš,\ndo svojho kráľovstva pozývaš nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Svätý si, Bože náš, plný slávy,\nvšetko, čo podnikneš, sa ti zdarí.\nAnjeli velebia tvoj majestát,\ns nimi ti zaspievam, že mám ťa rád.",
      },
    ],
  },

  {
    cisloP: "39",
    nazov: "Pána dnes zahrňme chválou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Pána dnes [e]zahrňme [D]chválou, \nnech sa [C]rozozvučí tento [D]chrám,\n[G]piesňou a [e]velebou [H7]stá[C]lou, \nlebo [a]Ježiš je [G]Pán, jemu [D]neodo[G]lám.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Keď Pán pri[C]vádzal \nnaspäť [D]zajatých, \n[G]všetci sme stáli \nvôkol [D4]ako vo [D]snách,\n[C]radosť napĺňa ústa [G]slobodných, \n[D7]rozohrá pieseň na pe[G ]rách.",
      },
      {
        cisloS: "V2",
        textik:
          "Vtedy sa niesla správa k pohanom: \n'Veľké veci urobil s nimi Pán.'\nVeľké veci urobil s nami Pán, \nradostne v piesni zaplesám.",
      },
      {
        cisloS: "V3",
        textik:
          "Vstúp do mňa, prejdi mojím zajatím, \ntak ako púšťou živé vody riek. \nTým, čo sejú v slzách, sa nestratí \nobilie v lánoch, bude zrieť.",
      },
      {
        cisloS: "V4",
        textik:
          "Cestou domov idúcky plakali. \nNeistú nádej azda ponesú? \nNo keď sa vrátia, pôjdu s jasotom, \nsnopy zo žatvy prinesú.",
      },
    ],
  },

  {
    cisloP: "40",
    nazov: "Pane, sláva ti",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Pane, [a]sláva [F]ti, \nty radosť [G]dávaš [C]nám,\n[F]tebe, svä[C]tý Boh, [h7]sláva [E]buď! \nPane, [a]sláva [F]ti, \nlebo si [G]kráľov [a]Kráľ. \n[F]Amen, [G]alelu[a]ja!",
      },
      {
        cisloS: "V1",
        textik:
          "Pán je [C]moja spása, \nnemusím sa [G]báť,\non sa [d]pre môj život stal pevnos[a]ťou.\nZnova [F]smiem prebývať tam, \nkde je môj [a]Pán, \n[F]obdivo[d]vať jeho [E]chrám.",
      },
      {
        cisloS: "V2",
        textik:
          "Moje srdce v láske teba velebí,\nv rukách smrti svoj ľud mrieť nenecháš,\nv tvojom dome túžim zostať, Pane môj,\nv tvojich dlaniach ukrytý.",
      },
      {
        cisloS: "V3",
        textik:
          "Nech sa nesie chvála Boha \nz každých úst, ohlasujme národom: 'On je Kráľ!'\nBlažený, kto naňho hľadí s dôverou,\nostáva vždy slobodný.",
      },
    ],
  },

  {
    cisloP: "41",
    nazov: "Pre tvoje diela",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[(d)]Pre tvoje [A7]diela \na všetky [d]zázraky\nteba pred [C7]svetom vele[F]bím\na celý [g]svoj život \ndo tvojich [d]rúk vkladám,\nna teba [A7]s dôverou hľa[d]dím.",
      },
      {
        cisloS: "V1",
        textik:
          "Keď cítim [A7]úzkosť, \ntopím sa [d]v smútku,\nviem, že ty [g]počuješ ten [d]môj plač.\nDlaňami [A7]lásky \nchrániš, jemne [d]dvíhaš,\nvo svojom [A7]náručí ma [d]nesieš.",
      },
      {
        cisloS: "V2",
        textik:
          "Do tvojich dlaní odovzdám všetko,\nako dar nesiem svoje vnútro.\nVeď ktože zbúra múry mojich hriechov?\nLen ty ma zaodeješ spásou.",
      },
      {
        cisloS: "V3",
        textik:
          "Bez teba hyniem, si mojím slnkom,\nvyrastiem v žiari tvojej tváre.\nBudem ti spievať, chvála dá mi nádej,\npo každej noci príde ráno.",
      },
    ],
  },

  {
    cisloP: "42",
    nazov: "Predstúpme spoločne",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[a]Predstúpme [d]spoločne \n[G]sem, až pred jeho [C]tvár, \n[F7]v ňom sme všetci [d]slobodní, \n[G]on je [E7]náš [a]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "Aj [a]my sme [G]jeho [F]chrám \na [G]on je [e7]našou [a]skalou,\npieseň [G]rados[F]tná \nvždy [G]vrúcne [e7]jemu [a]znie.",
      },
      {
        cisloS: "V2",
        textik:
          "On sám sa ľuďom dal \na stal sa živým chlebom,\nnáš nebeský Kráľ \nnám srdcia naplní.",
      },
      {
        cisloS: "V3",
        textik:
          "Veď v ňom ti srdce hrá, \nten nástroj ľubozvučný,\npieseň radostná \ndnes všetkých poteší.",
      },
      {
        cisloS: "V4",
        textik:
          "Len on je Pravda sám, \nje Slovo, ktoré spasí.\nSkúsme chvíľu stáť, \nveď on k nám hovorí.",
      },
    ],
  },

  {
    cisloP: "43",
    nazov: "Pripravujme cestu",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/: [e]Pripravujme cestu, \n[a]prí[D7]de [G]k nám\n[H7]hosť čaka[e]ný \n[a7]on, náš [H]Pán. :/",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Prichádza ku [H]nám náš [e]Pán, \n[a]svojho posla ve[e]die [H]k nám. \n[e]Lampu, čo horí, [e7]vo tmách zažiari \n[C]ten hlas, čo [a]stále \npravdu hovo[H4]rí[H].",
      },
      {
        cisloS: "V2",
        textik:
          "Prichádza ku nám náš Pán, \nlebo čas už dozrel v nás.\nŽeníchov priateľ dáva na zreteľ: \n'Hľa, to je on, ten Baránok Boží.'",
      },
      {
        cisloS: "V3",
        textik:
          "Prichádza ku nám náš Pán, \nvraví hlasom pokojným.\nTrsť nalomenú nechá ďalej rásť, \nknôtik, čo zháša, nedohasí v nás.",
      },
      {
        cisloS: "V4",
        textik:
          "Prichádza ku nám náš Pán, \nmajme srdcia dokorán.\nTen, kto vytrvá, slovo zachová, \nvchádza so slávou do nebeských brán.",
      },
    ],
  },

  {
    cisloP: "44",
    nazov: "Rád spievam, Bože",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Rád [A/E]spievam, Bože, \n[H/E]chválo[E]spev, \n[E]báz[A/E]ňou sa napl[D]ním[H],\n[E]vstú[A/E]pim do sveta [H/E]zázra[E]kov,\nkeď [fis7]vo viere [A/H]ťa obja[E]vím.",
      },
      {
        cisloS: "V1",
        textik:
          "Aj [Gis]moja duša [cis]chváli Pána,\n[Gis]môj duch jasá [cis]v ňom. \n[Gis]Milosrdne [cis]na mňa zhliadol, \n[D]spásu nesie [H4]náro[H]dom.",
      },
      {
        cisloS: "V2",
        textik:
          "Tak veľké veci s veľkou láskou \nvo mne konal sám. \nMilosrdný býva on k tým,\nčo sa pred ním skláňajú.",
      },
      {
        cisloS: "V3",
        textik:
          "On mocnárom ich tróny zrúcal,\nbiednych povýšil. \nHladných kŕmi dobrotami, \nboháč ruky prázdne má.",
      },
      {
        cisloS: "V4",
        textik:
          "To, čo si sľúbil dávnym otcom,\nsľúbil si aj nám. \nViem, že nikdy neopustíš \ntých, čo v teba dúfajú.",
      },
    ],
  },

  {
    cisloP: "45",
    nazov: "Rozjasni tvár",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[B/F]Rozjasni [F]tvár, \nak si [B/F]pokore[F]ný, \n[B]Boh ťa má [C]rád, \nje tvoj [d7]Otec ver[C]ný, \n[B/F]poď, uvi[F]díš, \ndôvod k [B/F]radosti [F]máš, \n[B]prichádza [C]k nám Mesi[B/F]áš[F].",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Verný môj [a7]Pán, \nteba [B]vždy vele[F]bím,\n[B]duša ja[a]sá, \nv tebe [g7]raduje [C]sa. \n[d]Len malič[a7]kí, \nktorí [B]počúva[F]jú,\n[g7]uzrú aj dnes tvoju [C4]tvár[C].",
      },
      {
        cisloS: "V2",
        textik:
          "Zaspievať žalm iba pre teba chcem, \nkeď zavolám, ty mi vždy odpovieš. \nZo všetkej hrôzy ma vyslobodíš,\nv preslávne meno verím.",
      },
      {
        cisloS: "V3",
        textik:
          "Pohliadni naň, lebo on je tvoj Pán,\nkto naň hľadí, skrze neho žiari.\nKeď v okovách úbožiak zavolá,\nvždy Pán ho vyslobodí.",
      },
      {
        cisloS: "V4",
        textik:
          "Šťastný je ten, kto sa k nemu vinie,\npretože chýbať mu nič nebude.\nKto mu načúva a pokoj hľadá,\nten nájde, čo je dobré.",
      },
    ],
  },

  {
    cisloP: "46",
    nazov: "Si Boh, ktorý nám kráča v ústrety",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/: [fis]Si Boh, ktorý nám \nkráča [cis7]v ústrety.\nTo [fis]z tvojho kríža [D]vzišla nádej,\n[cis7]svieti [fis]v nás. :/ ",
      },
      {
        cisloS: "V1",
        textik:
          "Si [A]Kráľom, tak príď, \nláska, [E]vstúp, nemeš[(Cis7)]kaj.\nJa [fis]viem, že v srdci máš \nstále [cis7]dôveru [(E7)]v nás. \nMôj [A]túžobný vzdych \nspieva:[E]'Príď  buď [(Cis7)]môj!'\nSi [fis]môjmu srdcu veľmi blízky, \n[cis7]mám ťa [fis]rád.",
      },
      {
        cisloS: "V2",
        textik:
          "Tak rád by som šiel \ndnes na hostinu tam, \nkde nám ponúkaš med, \nmlieko, víno aj chlieb. \nA túžim dať dar, \nmyrhu, v nej život svoj. \nNech lásku môjho srdca cítiš, \nmôj milý.",
      },
      {
        cisloS: "V3",
        textik:
          "Nech ten, kto bol v tmách, \nrýchlo vráti sa späť, \nveď on je ten, čo vie \nláskou uzdraviť nás. \nTak poďme ho dnes \nvítať záplavou sviec: \n„Hľa, náš ženích prichádza!“ \nspieva zbor svätých.",
      },
    ],
  },

  {
    cisloP: "47",
    nazov: "Si môj Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Si môj Pán, \nv tebe [C]jasám, [d]spievam, \n[B]pieseň chvál [g]nekon[C]čí.\n[F]Si môj Pán, v tebe [C]jasám, [d]spievam, \n[B]piesňou chvál meno [g]sväté [C]ctím. \n[B]Si môj Pán, tvoje [C]meno [F]ctím.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Každý jazyk nech [a]piesňou [G]znie, \n[d]v tebe, Ježiš, tá [C]nádej tkvie, \n[F]nech sa rozlieha [C]spev mocný, \n[F]toto je [B]náš Boh, [g]vždy ver[C]ný.",
      },
      {
        cisloS: "V2",
        textik:
          "Požehnaný si nad všetkým, \nnad nepriateľom víťazíš. \nZem celá skláňa svoju tvár, \ndosvedčí hviezdam: Ty si Pán!",
      },
      {
        cisloS: "V3",
        textik:
          "Po vode k nám ty kráčaš sám, \nsvoju ruku dnes dávaš nám.\nKeď naša viera nestačí, \ntvoja moc nech v nás víťazí.",
      },
      {
        cisloS: "V4",
        textik:
          "K sebe domov nás privedieš, \nvďaku ti vzdávame už dnes, \ncez teba radosť prúdi k nám, \nkráľovstvo večné daruj nám.",
      },
    ],
  },

  {
    cisloP: "48",
    nazov: "Si svetlom, vo tme nádejou",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[d]Si svetlom, [A7]vo tme [B]náde[d]jou. \n[B]Príď, môj [F]Pán, \n[g]chválu [A7]chcem ti [d]spievať. \nRadosť [A7]vo mne [B]vládu [d]má, \n/: tvoja [B]láska \n[g]stále svieti [a]nado [d]mnou. :/ ",
      },
      {
        cisloS: "V2",
        textik:
          "Ty nesieš svetlo blúdiacim, \n spútaným okovy si zlámal. \nSvetlo z kríža svieti tmou, \n/: tvoja láska stále svieti nado mnou. :/",
      },
      {
        cisloS: "V3",
        textik:
          "Aj moja duša žíznivá \ns nádejou teba očakáva. \nV tebe hľadá svoj domov,\n/: tvoja láska stále svieti nado mnou. :/ ",
      },
      {
        cisloS: "V4",
        textik:
          "Do môjho srdca môžeš vojsť, \ndám ti kľúč, odomkni si bránu. \nDuch sa vznáša nad vodou, \n/: tvoja láska stále svieti nado mnou. :/ ",
      },
      {
        cisloS: "V5",
        textik:
          "To pred tebou sa skláňam rád,\npriateľ môj, oslavovaný brat. \nObjímaš ma v náručí, \n/: tvoja láska nikdy ku mne nekončí. :/",
      },
    ],
  },

  {
    cisloP: "49",
    nazov: "Sláva tebe, Bože náš",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Sláva [g]tebe, [a]Bože [d]náš, \nzázra[C]ky konáš [F]stá[A]le. \n[d]Zostávaš [F]v srdciach \n[C]vždy prítomný,\n[d]chválu [g]nave[a]ky ti [d]vzdám.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Chvála ti [g]dnes patrí, \n[C]lebo si [F]Boh verný,\n[d]stvoril si [g]nám vesmír, \n[C]dal si [a]život [A7]aj [d]nám.",
      },
      {
        cisloS: "V2",
        textik:
          "Vzýva ťa ľud svätý, \no milosť tu prosí, \ndlaň svoju nám podáš, \nviem, kto vykúpil nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Až tak nás on mal rád, \nsvoj život dal za nás, \nDuch Svätý nás volá, \nbýva uprostred nás.",
      },
    ],
  },

  {
    cisloP: "50",
    nazov: "Slávny si, môj Kráľ",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/: [a]Slávny si, môj [G]Kráľ, \nstvoril si nebo, [C]zem.\nSvoje deti žeh[G]náš, \nnesieš v náručí [a]svet, \nsi môj [E]Pán. :/",
      },
      {
        cisloS: "V1",
        textik:
          "Dal si [a]nám plody, ktoré [e]sýtia.\nDal si [a]nám moria plné [G]rýb.\nVšetky [C]vtáky aj poľnú [G]zver\nsi z lásky dal [a]nám, dobrý [E7]Pán.",
      },
      {
        cisloS: "V2",
        textik:
          "Dal si nám oheň a dal mráz.\nDal si nám tmavú noc aj deň.\nSilný vietor aj tichý dážď\nsi z lásky dal nám, dobrý Pán.",
      },
      {
        cisloS: "V3",
        textik:
          "Dal si nám vesmír plný krásy. \nSpásu dal si nám skrze kríž. \nDucha svojho aj život v ňom \n si z lásky dal nám, dobrý Pán.",
      },
      {
        cisloS: "V4",
        textik:
          "Chválu za všetko tebe vzdáme.\nTy si Boh svätý, živý v nás.\nTento najväčší pre nás dar \nsi z lásky dal nám, dobrý Pán.",
      },
    ],
  },

  {
    cisloP: "51",
    nazov: "Spievaj Bohu, celá zem",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Spievaj [F]Bohu,[G]celá [A]zem, \nveľký [B]Kráľ už [C7]z mŕtvych [A4]vstal[A], \n[d]spievaj [F]Bohu, [G]celá [A]zem, \nJežiš [B]vstal z mŕtvych, [g]ale[A7]lu[d]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "V toľkom [d]tichu [a7]pri hrobe \n[g]zavčas [A7]rá[d]na, \nkeď už [F]aj ľud[C]ská nádej \n[Es]bola már[B]na, \n[g]Kristus [E7]z mŕtvych [A4]vstal[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Veľkú radosť má z neho \nstvorený svet, \nlebo navždy smrť bola porazená, \nKristus z mŕtvych vstal.",
      },
      {
        cisloS: "V3",
        textik:
          "Čistý ženích bol pre nás \nusmrtený, \nale na tretí deň ho Otec vzkriesil, \nKristus z mŕtvych vstal.",
      },
      {
        cisloS: "V4",
        textik:
          "Baránkovi na tróne \nvzdajme chválu, \non svet vykúpil svojou drahou krvou, \nKristus z mŕtvych vstal.",
      },
    ],
  },

  {
    cisloP: "52",
    nazov: "Spievaj s radosťou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Spievaj s radosťou, \n[a7]ó, Jeruza[d]lem, \nzo srdca svojmu [g7]Bohu plesaj, \n[a7]dcéra sion[d]ská.\nOn radosť dáva,[a7]srdce rozo[d]spieva,\nraduj sa, veď [g7]s tebou býva \n[a7]tvoj Boh a [d]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Pán ťa [C]ochraňuje, \n[d]v prísľuboch [A7]je verný,\n[B]daj mu [g7]svoje srdce, \n[a7]on je tvoj [d]Boh.\n[F]Tvojich [C]nepriateľov \n[d]pred tebou [A7]pokoril, \n[B]zostá[g7]va uprostred \n[a7]nás živý [d]Pán.",
      },
      {
        cisloS: "V2",
        textik:
          "Slávny Jeruzalem, vstaň, \nviacej nemaj strach, \nv tebe zotrváva Pán, večný Boh. \nOn ťa vyzbrojuje láskou a radosťou, \non je Spasiteľ tvoj, on je tvoj Pán.",
      },
      {
        cisloS: "V3",
        textik:
          "Pán nad tebou zajasá \ns veľkou radosťou, \nláska Božia obnoví v tebe chrám. \nStále prespevuje nad tebou Boh verný.\nPlesať bude ako v dňoch sviatočných.",
      },
    ],
  },

  {
    cisloP: "53",
    nazov: "Spievajme sláva, náš Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Spievajme sláva, \n[D]náš Pán nebies je Kráľ,\n[G]ponúka spásu [D]každému človeku, \n[A]on chráni život [D]náš. \nZaplesaj Kráľovi, Jeruza[G]lem, \nv ňom [A]radosť [D]máš.",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Pretože z hriechu ťa on vyvedie, \núctu vzdaj,Jeruza[G]lem, \nv ňom [A]radosť [D]máš.\n[D]Skrz jeho smrť všetci slobodní sme, \núctuvzdaj, Jeruza[G]lem, \nv ňom [A]radosť [D]máš.",
      },
      {
        cisloS: "V2",
        textik:
          "A preto z lásky hriech zanechajme, \núctu vzdaj, Jeruzalem…\nOdpustil nám, on je milosrdný, \núctu vzdaj, Jeruzalem…",
      },
      {
        cisloS: "V3",
        textik:
          "Veríme, Pán dáva uzdravenie, \núctu vzdaj, Jeruzalem…\nPrijmime dar z neba, chlieb života, \núctu vzdaj, Jeruzalem…",
      },
      {
        cisloS: "V4",
        textik:
          "Zostáva Boh s nami, Emanuel, \núctu vzdaj, Jeruzalem…\nTo jeho duch žije v našich srdciach, \núctu vzdaj, Jeruzalem…",
      },
    ],
  },

  {
    cisloP: "54",
    nazov: "Teba chválim, ó, môj Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Teba chválim, ó, [C]môj [F]Pán, \nTvoje [B]meno [F]vždy vele[C]bím. \nSi [F]Kráľom, kto[F7]rý pote[B]ší, \naj moje [F]vnútro [C7]naveky ťa [F]ctí. [(B - F)]",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Vždy si [B]k nám bol \ndobrý [C]a než[F]ný, \nplný [B]lásky, v prísľu[C]boch ver[F]ný. \nTvoja láska je nám [C7]opo[F]rou, \ntvoje zľutovanie [C7]nás rozjas[F]ní.",
      },
      {
        cisloS: "V2",
        textik:
          "Dnes ťa ľud tvoj piesňou velebí. \nTvoju vernosť láskou oplatí, \nveď ty sám si sa dnes vydal nám. \nSpevom ohlasujeme: 'Ty si Pán!'",
      },
      {
        cisloS: "V3",
        textik:
          "Ty si cestou, k cieľu vedieš nás. \nTy si pravdou, vyučuješ nás. \nTy si dal svoju dôveru nám, \npreto celý sa ti dnes odovzdám.",
      },
    ],
  },

  {
    cisloP: "55",
    nazov: "Tebe, Pán môj, stále nech znie pieseň chvál",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Buď po[F]chvále[C]ný, \n[G]môj veľký [a]Kráľ,\ntvoje [F]diela [C]sú úžas[G]né.\nChvála, [F]sláva [C]znie [G]tebe, Pa[a]ne, \nsvojou [F]láskou [C]napĺňaš [G]nás.\nTebe, [C]Pán môj, \n[F]stále nech znie [G]pieseň [C]chvál.",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Svätý si, Pane, a [F]dávaš ži[C]vot, tebe, Pán môj, \n[F]stále nech znie [G]pieseň [C]chvál,\n[C]ty si pre nás, opo[F]rou, zášti[C]tou, \ntebe, Pán môj…\nRadosť a [F]nádej, tie [G]mám od te[a]ba, \ntebe, Pán môj…\nDôveru [F]vkladáme [G]v tvoje me[a]no, \ntebe, Pán môj…",
      },
      {
        cisloS: "V2",
        textik:
          "Pane, ty žiariš, keď blúdime v tme, \ntebe, Pán môj…\nty si svetlo naše, keď kráčame, \ntebe, Pán môj…\nPosilňuj nás vždy, keď prehrávame, \ntebe, Pán môj…\nUpevni nás, Pane, v našej viere, tebe…",
      },
      {
        cisloS: "V3",
        textik:
          "Prišiel si vykúpiť svoje deti, \ntebe, Pán môj…\nčo v tvoju dobrotu dôverujú, \ntebe, Pán môj…\nVo svojom trápení kričia k tebe, \ntebe, Pán môj…\nVypočuj, Pane, ich prosebný hlas, \ntebe, Pán môj…",
      },
      {
        cisloS: "V4",
        textik:
          "Vytrhol si ma z rúk nepriateľa, \ntebe, Pán môj…\nv tvojom mene, Ježiš, víťazstvo mám, \ntebe, Pán môj…\nStále chcem velebiť tvoje meno, \ntebe, Pán môj…\nUprostred národov chválu ti vzdám, \ntebe, Pán môj…",
      },
    ],
  },

  {
    cisloP: "56",
    nazov: "Ty si náš Boh a Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Ty si náš [a]Boh a Pán, \nčo [C]oslo[a]bodil [H4]nás[H]. \n[e]Kráľ mocný a [a]Boh verný,\nbuď [C]o[a]slá[h7]vený [e]v nás!",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Pane, ty si zjavil [a7]lás[h7]ku [e]nám, \nveď tvoj [a]Syn sa [D]do nej zaodel. \n[D7]V jeho mene [G]spása [a]prišla [D]k nám. \n[H7]Rados[e]ťou nám [a7]srdce [h7]zaja[e]sá.",
      },
      {
        cisloS: "V2",
        textik:
          "Ježiš za mňa život položil. \nV jeho smrť som pokrstený bol, \naby spolu s ním som zvíťazil. \nZ jeho lásky nový život mám.",
      },
      {
        cisloS: "V3",
        textik:
          "Tebe naše srdcia spievajú.\nMáš dar lásky pre každého z nás. \nTy si trojjediný, svätý Boh. \nSvojím slovom oživuješ nás.",
      },
    ],
  },

  {
    cisloP: "57",
    nazov: "Ty si Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Ty si Pán[fis], \n[G]tebe patrí [A]chvála, česť.\n[D]Ty si Pán[h7], \n[C]tebe patrí [A]sláva, moc. \n[D]Ty si Pán[fis], \n[G]teba budem [A]velebiť \n[e]na veky[A] vekov[D].",
      },
      {
        cisloS: "V1",
        textik:
          "[h]Zbor svätých i [Fis]chóry anjelské \n[h]pred tebou sa [Fis]k zemi skláňajú.\n[h]Všetko v láske [A]teba velebí. \n[G]Amen, alelu[Fis]ja.",
      },
      {
        cisloS: "V2",
        textik:
          "Tvoje súdy sú spravodlivé, \nmúdro súdiš končiny zeme. \nDnes ťa chvália malí i veľkí. \nAmen, aleluja.",
      },
      {
        cisloS: "V3",
        textik:
          "K nám zostúpiš znova ako Kráľ,\nnad nebom i nad zemou si Pán. \nPozvaní sú blahoslavení. \nAmen, aleluja.",
      },
    ],
  },

  {
    cisloP: "58",
    nazov: "Ty si Pán, Boh dobrý",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Ty si Pán, [G]Boh dobrý.\n[D]Ty si Pán, [A7]Boh verný.\n[D]Ty si Pán, [G]Boh dobrý, \n[D]a[A]lelu[D]ja!",
      },
      {
        cisloS: "V1",
        textik:
          "Nech [D]radostná ti [G]pieseň znie,\ndnes [D]dám ti srdce [A7]skľúčené.\nTy [D]láskou mi ho [G]sám plníš, \n[D]a[A]lelu[D]ja!",
      },
      {
        cisloS: "V2",
        textik:
          "Nech každý srdce otvorí, \nveď silou nám je Duch Svätý. \nOn všetky zámky rozlomí, \naleluja!",
      },
      {
        cisloS: "V3",
        textik:
          "Tvoj kríž je pre mňa záchranou,\nje svetlo v mojom trápení. \nOn dvíha srdcia k víťazstvám, \naleluja!",
      },
      {
        cisloS: "V4",
        textik:
          "Ja dávno viem, že dvíhaš nás, \nty sila, spása, svetlo v tmách.\nUž vzácna radosť v nás horí, \naleluja!",
      },
      {
        cisloS: "V5",
        textik:
          "Ty, dobrý Otec láskavý,\na Syn, Boh, človek, nám daný,\ni Duch Svätý, prúd ohnivý, \naleluja!",
      },
    ],
  },

  {
    cisloP: "59",
    nazov: "Ty si Pán, chcem ti hrať",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Ty si [e]Pán, chcem ti hrať, \nv tebe [H7]jasám a spievam ti [e]rád. \nAlelu, alelu, ale[H7]luja, alelu[e]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Vstávajme, lebo dnes \n[G]Pán vymení\n[H7]nám srdcia [e]zlo[D]me[G]né[G7], \n[C]on rany zahojí, \n[G]bôľ uzdraví,\n[H7]slávne [H4]zví[H7]ťa[e]zí.",
      },
      {
        cisloS: "V2",
        textik:
          "Túžime ďakovať, \nchválu priniesť,\nz nástrojov pieseň znie.\nSpievajme spoločne: \n'Sláva ti buď, \nvzácny Bože náš!'",
      },
      {
        cisloS: "V3",
        textik:
          "Roztancovať sa smieš, \nJeruzalem,\nrozjasať radosťou.\nTvoj Boh je uprostred, \nstrach odhoď preč,\nskláňa sa tvoj Kráľ.",
      },
      {
        cisloS: "V4",
        textik:
          "Stále ťa velebiť \nchcem, Bože môj,\nchválu dnes v srdci mám. \nHrať iba pre teba, \nvšetko ti dať, \nsvet aj život sám.",
      },
      {
        cisloS: "V5",
        textik:
          "Chválime ťa harfou \naj citarou,\ncimbalom jasavým. \nChválime ťa tancom \naj bubnami,\nlýrou i flautou.",
      },
      {
        cisloS: "V6",
        textik:
          "Chválu ti prinesie \nzvuk činelov\naj moje srdce s ním. \nVšetko, čo dýcha, nech \nchválu ti vzdá, \naleluja!",
      },
    ],
  },

  {
    cisloP: "60",
    nazov: "Ty si ten Boh verný",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Ty si ten [G]Boh verný, \nktorý nám [e]Syna dal \na svojou [a]láskou \ncelý svet [D]požehnal. \nPred tvojou [G]tvárou \nvšetci sa [e]skláňajú \na deťmi [a]tvojimi aj [D7]nás \nnazýva [G]jú.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Boh pravý, Otec [D]láska[e]vý,\nKráľ ži[C]vý, ty si [D]od vekov.\n[G]Žiarivé svetlo[D] náro[e]dov,\nty, oheň večný, [C]si [a]nekoneč[D]ný.",
      },
      {
        cisloS: "V2",
        textik:
          "Všemocný tvorca krásnych diel\nsvoj obraz vtlačil nám do sŕdc.\nVládnuť máme zo všetkých síl\nnad celou zemou, no aj nad sebou.",
      },
      {
        cisloS: "V3",
        textik:
          "Ó, dobrý Bože, Otče náš,\nstále máš o nás záujem.\nDávno sme boli stratení,\nno dobre poznáme, že si verný.",
      },
      {
        cisloS: "V4",
        textik:
          "V týchto dňoch, v časoch posledných\nSyn Boží zjavil tvoju tvár. \nOn sa stal človekom pre nás,\nsme Božím ľudom, on vykúpil nás.",
      },
      {
        cisloS: "V5",
        textik:
          "Dajme náš život búrlivý,\nnech sa v ňom oheň rozhorí.\nDuch Boží v tichu príde sem,\notvára nové nebo i zem.",
      },
    ],
  },

  {
    cisloP: "61",
    nazov: "Ty si Víťaz, Boh a Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Ty si [C]Víťaz, Boh a [G4]Pán[G],\ntebe [F]chválu, úctu [C]vzdám,\nmeno [a]máš Emanu[F]el, \nvždy si [d]blízko, keď vo[G]lám. \nOheň [a]lásky v nás ho[e]rí, \nvždy, keď [F]vstúpi Duch Svä[C]tý,\nteba [a]chváliť chcem, si [d]Kráľ,\nv Teba [F]nádej vždy vkla[G]dám.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Pokľakni, veď Kráľ ti dáva\n[G4]srdce, ktoré [G]k nám horí [C4]lás[C]kou.\nOn [F]sám to [C]zjavil [d]nám.\nJasajme, [F]chváľ[G]me!",
      },
      {
        cisloS: "V2",
        textik:
          "On nám dal na kríži spoznať\nsúcit, ktorý má voči biednym,\nže láskou horí k nám.\nJasajme, chváľme!",
      },
      {
        cisloS: "V3",
        textik:
          "Jeho hlas je v nás, tak čujte,\nspráva radostná dnes sa hlása,\nže Ježiš spasil nás.\nJasajme, chváľme!",
      },
    ],
  },

  {
    cisloP: "62",
    nazov: "Vďaka ti, Otče náš",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Vďaka ti, [e]Otče náš, za [C]Ježiša, \nktorý premohol [D]smrť aj [G]v nás[H7]. \nJasotom [e]slávnostným \nmu [C]všetci vzdajme chválu,\non je [D]Kráľ, on[h] je Boh [e]náš.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Vstaň a poď, veď on [D]dáva \nsvetu [G]žiari[D]vý, jas[e]ný deň. \n[e]Čuj Božie slovo [D]s úctou, \nlebo [G]spásu [A]v sebe [H4]má[H].",
      },
      {
        cisloS: "V2",
        textik:
          "On je tou pre nás vzácnou \nskalou útočišťa, spásy.\nVstúpme dnes k nemu s bázňou,\nlebo pozná život náš.",
      },
      {
        cisloS: "V3",
        textik:
          "Pán s tvojou službou ráta,\nty si vzácnym kameňom preň.\nAk mu svoj život dávaš,\nz teba stavia Boží dom.",
      },
      {
        cisloS: "V4",
        textik:
          "Ľud Boží, v svätých stánkoch\nprevolávajme na slávu.\nNech zuní hlahol chrámom,\nlebo on je večný Kráľ.",
      },
    ],
  },

  {
    cisloP: "63",
    nazov: "Vďaka za soľ",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Vďaka za [e]soľ, čo svetu [fis]dá[G]va \n[D]silu a [e]chuť životom [A4]krá[A]čať.\n[G]Lás[A]kou [fis]zjednote[h]ní\n[C]vo svetle môžeme [A]stáť,\nnekonečný[G]Pán[D].",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Pravdu môžeme [G/F]nájsť, \nkeď [e]pripojíš sa [a7]k nám,\nkeď [d7]čítaš Písma, \n[B]srdcia horia [A4]nám[A].\n[F]Keď si lámal [G/F]chlieb, \ntak [e]zrazu sme ťa             [a7]spoznali,\nno [d7]pravdu v láske \n[B]Duch nám odha[A4]lí[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Zbor svätých volá: 'Sláva, \nzvíťazil náš Pán!'\nAj spev anjelov \nzaniesol sa k nám.\nDnes aj z prázdnych úst \nsa nová pieseň ozvala,\nnech zastaví sa čas \na zneje chvála.",
      },
      {
        cisloS: "V3",
        textik:
          "Nám zostáva len úžas \nv ľudskom chápaní,\nže nás ľudí Boh \nvryl si do dlaní.\nDaj, nech páli nás \nten smäd, čo núti pravdu nájsť,\nnech tvoja láska \nvšade môže rásť.",
      },
      {
        cisloS: "V4",
        textik:
          "Bázeň pred tebou máme. \nSám sa skláňaš k nám.\nAj keď sme padli, \nvždy si dvihol nás.\nDnes už smieme klásť \nsi tvoje plody do dlaní\na vnímať krásu \nv Božom dávaní.",
      },
    ],
  },

  {
    cisloP: "64",
    nazov: "Víťaznou bránou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Víťaznou [A]bránou \nvstúp [G9]k nám, Je[A]žiš,\n[D]chválou ti [A]skrášlime [A4]trón[A].\n[B]Spievajme: [F]'Sláva, \n[B]Pán z mŕtvych [F]vstáva,\n[B]spásou sa [F]v srdciach \nraj ot[A4]vá[A]ra.'",
      },
      {
        cisloS: "V1",
        textik:
          "[h]Pánov hlas [A]rázne zvo[h]láva\n[h]ľud zo všet[A]kých náro[h]dov.\n[G]Otvorte brány, [e]verní, pokorní,\n[e]nastáva [C]čas nových [A4]dní[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Smiem k tebe vojsť úzkou bránou,\nútechu dávaš mi sám.\nPrijímaš ma rád takého, aký som,\nsvoj údel s láskou ti dám.",
      },
      {
        cisloS: "V3",
        textik:
          "Tvoj vzácny chrám teplom sála,\ntam nie je nik nešťastný. \nRoztváraš náruč, srdce dokorán, \ns dôverou skláňaš sa k nám.",
      },
      {
        cisloS: "V4",
        textik:
          "Ľúbeznú pieseň zaspievam,\nsám krajších chvíľ nepoznám.\nÓ, vzácny dar, chcem tvojou cestou ísť,\npríď, Duch Svätý, Bože, príď!",
      },
    ],
  },

  {
    cisloP: "65",
    nazov: "Vstaň, Jeruzalem",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Jeruzalem, [a]Jeruzalem, \n[G]sním už rúcho smútoč[H4]né[H]! \n[E]Jeruzalem, [a]Jeruzalem, \n[e]vstávaj, [H]tancuj, vchádza [e]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "/: [e]Vstaň, Jeruzalem, \nzažiar [H7]svetlom jasným, \nBožou slávou zaodel ťa [e]Pán. :/ \n[E]Pozri do diaľav, žiara \n[a]vchádza k nám, \n[D]srdce nech ti veselosťou [H7]zajasá. \n[e]Tvoji synovia k tebe [H7]prichádzajú, \ndcéry, čo ti patria, pone[e]sú.",
      },
      {
        cisloS: "V2",
        textik:
          "/: Sú tu všetky národy, z diaľav idú, \nkráli zeme sa ti klaňajú. :/ \nZáplavami tiav nech ťa pokryjú, \ntymian a zlato nech ti prinesú. \nBrány mesta sú znovu vyvýšené, \nzvestovať ti budú, kto je Pán.",
      },
      {
        cisloS: "V3",
        textik:
          "/: Postavia ti múry, veď prišiel tvoj čas, \nsvoje brány otvor pre všetkých. :/ \nMiesto pokoja z teba urobím, \nbudú ťa nazývať mestom Pánovým, \nlebo ja som Pán sveta, verný Boh tvoj. \nNeopustím ťa, veď ty si môj.",
      },
    ],
  },

  {
    cisloP: "66",
    nazov: "Vstúp k nám, ó, trojjediný Bože",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Vstúp k nám, ó, [g]trojjedi[d]ný Bože, \n[g]láska [E]nekoneč[A4]ná[A]. \n[d]Pán môj, dnes [g]tvoj ľud je [d]zídený, \n[g]spieva, [A]vďaku ti [d]vzdá.",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Pozdrave[C]ný buď, [g]Bože ver[B]ný,\nvšetko [C]v bázni [g]hľadá tvoju [A4]tvár[A].\n[F]Nebeský [C]Kráľ, buď [g]zvelebe[B]ný, [g]alelu[A4]ja[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Dnes si ťa ctí ľud vykúpený.\nTebe spieva vďačne tento chrám,\nlebo si vrátil slobodu nám, \naleluja.",
      },
      {
        cisloS: "V3",
        textik:
          "Celý vesmír ťa dnes velebí,\ns veľkou láskou novú pieseň hrá.\nVoláme s ním, že len ty si Pán, \naleluja.",
      },
    ],
  },

  {
    cisloP: "67",
    nazov: "Vykúpil si nás",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Vy[e]kúpil si [C]nás, alelu[D]ja,\ni [C]slobodu [D]dal, alelu[e]ja.\nUž chválospev [C]znie, alelu[D]ja,\nna [C]meno Je[D]žiš, alelu[e]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Jas Boží tmu pohl[D4]tí[D],\n[C]hriešnikov ty uzdra[G]víš.\n[e]Snímaš smútok z našich [D4]sŕdc,\n[D]radosť [C]k nám preni[H4]ká[H].",
      },
      {
        cisloS: "V2",
        textik:
          "Krížom sňal si ťarchu z nás,\nsmrť nevládne ani hriech.\nSpásu dávaš ako dar,\nvznešené meno máš.",
      },
      {
        cisloS: "V3",
        textik:
          "Keď Boží Duch žije v nás,\nsmieme kráčať slobodní.\nHlásať máme pre všetkých\nže náš Pán žije v nás.",
      },
    ],
  },

  {
    cisloP: "68",
    nazov: "Život v plnosti dávaš",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Život v plnosti dá[D]vaš, \n[a]svojím bolestným krí[e]žom \nsám vy[F]kúpil si [D]nás. \n[G]Život v plnosti dá[D]vaš, \n[a]nad smrťou ty si ví[e]ťaz. \nNavždy [F]náš Boh a [D]Pán, \nzvelebe[C]ný. [G]",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Bez pastiera som [C]šiel, \n[G]keď ku mne vravel [D4]Pán: [D]\n'Tys [F]môj syn milo[d7]va[C]ný, \ntebe život [D4]dá[D]vam.'",
      },
      {
        cisloS: "V2",
        textik:
          "Väznených mnoho ráz \nhriechom aj bolesťou \nvykúpil nás Ježiš sám, \nnový život dáva.",
      },
      {
        cisloS: "V3",
        textik:
          "Ak smrť vládu v nás má, \nBoh ku nám hovorí: \n'Tak vstaňte už z hrobov, \nja pre vás život mám!'",
      },
      {
        cisloS: "V4",
        textik:
          "Mrel na kríži za nás,\nSyn Boží, plný rán, \nBoh dávno nám odpustil, \nžiť s ním učí nás.",
      },
    ],
  },

  {
    cisloP: "69",
    nazov: "Máš meno tak slávne",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[h]Máš [D/A]meno tak [G]sláv[D/Fis]ne, \n[e7]ó, svätý [A4]Pán[A].\nSkloň [h]zrak, [D/A]v našich dňoch \n[G]stú[D/Fis]pa \n[e7]chvála [A7]k výši[D]nám.",
      },
      {
        cisloS: "V1",
        textik:
          "Máme [e]pred svetom [h]ohlásiť \n[A]radostnú [D]zvesť,\nže od [G]vekov si [D/Fis]nás \n[e7]mi[h]lo[A]val.\n[(h)]Tvoju [e]lásku ti [h]chceme dnes \n[A]opäto[D]vať,\nľuďmi             [G]chvály sme, [D/Fis]znie \n[e7]pieseň [A4]v nás[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Lebo napĺňaš pokladmi \nzbiedený ľud,\nty si otvoril svoj \nsvätý chrám.\nTvoja dobrota a láska \nnekonečná\nznova vzbudzuje v nás \npieseň chvál.",
      },
      {
        cisloS: "V3",
        textik:
          "Tvoje úžasné zázraky, \nvíťazstvo v nás,\nvravia jasnou rečou, \nsi náš Boh.\nV tvojej prítomnosti chceme \npokorne stáť,\nk tebe túžime vojsť \nbránou chvál.",
      },
    ],
  },

  {
    cisloP: "71",
    nazov: "Jas na nebi",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[ami]Jas na nebi, hlas veleby, \n[E]vznáša sa k nám. \n[dmi]Vstaňte, veď [E]zostúpil [F]Spasi[G]teľ, [ami]Kráľ. \n'[ami]Sláva Bohu buď na nebi,' \n[E]spievajú tí, čo [dmi] Pána [E]dúfa[ami]jú.",
      },
      {
        cisloS: "V1",
        textik:
          "On je [E]svetlom našich dní, \nSlovom [ami]večným a živým, \nz Panny [E]nám zrodeným. \nVzdajme [dmi]poklonu, veď je to [E7]Kráľ.",
      },
      {
        cisloS: "V2",
        textik:
          "On je skalou záchrannou, \nhradbou, čo sa nepoddá. \nBoh sa stal dieťaťom. \nVzdajme poklonu, veď je to Kráľ.",
      },
      {
        cisloS: "V3",
        textik:
          "On je mocný Spasiteľ, \nktorý nám bol sľúbený, \nhriechov nás Pán zbaví. \nVzdajme poklonu, veď je to Kráľ.",
      },
      {
        cisloS: "V4",
        textik:
          "Hľa, tu v strede národov \nnové svetlo žiari tmou. \nV ňom sa nám Boh zrodil. \nVzdajme poklonu, veď je to Kráľ.",
      },
      {
        cisloS: "V5",
        textik:
          "On je víťaz nad hriechom. \nV ňom je láska silnejšia. \nSilnejšia ako smrť. \nVzdajme poklonu, veď je to Kráľ.",
      },
    ],
  },

  {
    cisloP: "72",
    nazov: "Ako by som ťa nechválil?",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Ako by som ťa ne[A]chvá[H]lil? \nAko by som ťa ne[E-H]chvá[cismi]lil? \nAko by som ťa ne[fismi]chvá[H]lil, \nJežišu [E]môj? Ako len? Ako len?",
      },
      {
        cisloS: "V1",
        textik:
          "[E]Keď vôkol seba poze[A]rám, krásu vi[H]dím,\nJežišu [E]môj, [H]za ňu vďa[cismi]čím.\nAko by som ťa ne[fismi]chvá[H]lil, \nJežišu [E]môj? Ako len? Ako len?",
      },
      {
        cisloS: "V2",
        textik:
          "Keď vôkol seba pozerám, bratov vidím,\nJežišu môj, za nich vďačím.\nAko by som ťa nechválil, \nJežišu môj? Ako len? Ako len?",
      },
      {
        cisloS: "V3",
        textik:
          "Keď vôkol seba pozerám, sestry vidím,\nJežišu môj, za ne vďačím.\nAko by som ťa nechválil, \nJežišu môj? Ako len? Ako len?",
      },
    ],
  },

  {
    cisloP: "73",
    nazov: "Nech celý svet mu spieva",
    slohy: [
      { cisloS: "R", textik: "Aleluja, aleluja, aleluja, aleluja." },
      {
        cisloS: "V1",
        textik:
          "Nech celý svet mu spieva,\naj ty už vstaň, ak spíš.\nOn tvoje hriechy zmietol\na pribil na svoj kríž.\nOn viedol slávnych otcov,\non je ten víťaz náš.\nNech celý esmír spieva,\na jemu pieseň hrá.",
      },
      {
        cisloS: "V2",
        textik:
          "On spravil pre mňa zázrak,\non objať všetkých vie.\nJe verným Otcom všetkým,\na vždy nad nami bdie.\nZa zvuku trúb a poľníc\nuž celá zem jasá,\nja radosť mám a žasnem,\nlen jemu pieseň hrám.",
      },
      {
        cisloS: "V3",
        textik:
          "Je pre svet veľkým Kráľom,\non vládne nad všetkým.\nMy v neho smieme dúfať\na zostať navždy s ním.\nA každý morský príval,\naj každý skalný štít\nho oslavujú krásou\na ja ho velebím.",
      },
    ],
  },

  {
    cisloP: "74",
    nazov: "Dnes je nám daný",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Dnes je nám daný Boží Syn, Spasiteľ, nebo dáva spásu nám.\nJeho príchod zrel tichý kraj Betlehem,\n'Bohu sláva buď v nebesách!'",
      },
      {
        cisloS: "V1",
        textik:
          "Tam, kde vládli ľudské sváry,\nzaznel vzácny detský plač.\nV túto noc Boh svetlo dáva\ntým, čo stále dúfajú.",
      },
      {
        cisloS: "V2",
        textik:
          "Keď sme tápali v tme, v prázdne,\nzrazu hviezda svitla nám.\nJe tu dieťa, Boh Syn slávny,\njeho náruč víta nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Aj pre tých, čo smútok trápi,\nzaznie pieseň ľúbezná.\nIba s ním sa zmeniť dá svet,\nkeď mu chválu, úctu vzdám.",
      },
      {
        cisloS: "V4",
        textik:
          "Kvôli nemu buďme láskou,\nnech zavládne pokoj nám,\nlebo Milosrdný vládne,\nnaše Knieža, Pán a Kráľ.",
      },
      {
        cisloS: "V5",
        textik:
          "Túto noc nech každý slávi,\nnech sa bieda vytratí.\nA dar odpustenia príde,\njeho láska zvíťazí.",
      },
      {
        cisloS: "V6",
        textik:
          "Na tú maštaľ hľaďme dávnu,\nv ktorej dieťa tíško spí.\nTento Kráľ sa slabým stáva,\naby biednym nám dal síl.",
      },
      {
        cisloS: "V7",
        textik:
          "Tomu tajomstvu sa skláňam,\nz jasieľ vládne veľký Kráľ.\nJemu otvárajme vnútro,\naby vládol nám on sám.",
      },
    ],
  },

  {
    cisloP: "75",
    nazov: "Vstávajme s radosťou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Vstávajme s radosťou, s nami je Pán. \nChváľme ho s jasotom, je našou skalou.\nMocný Boh Stvoriteľ, nad kráľmi Kráľ, \nradostne kričme jeho meno sväté.",
      },
      {
        cisloS: "V1",
        textik:
          "Kráčajme pred Kráľom s veľkou vďakou, \nzázračne Boží ľud chráni.\nAj v žalmoch sviatočných oslávme ho: \n'Sláva tebe! Sláva, Kráľ!'",
      },
      {
        cisloS: "V2",
        textik:
          "Nám stvoril nebesia, moria i zem, \nkončiare rukami tvárni. \nSpieva mu celá zem, v rukách ju má. \nSlávny aj dobrý je Pán!",
      },
      {
        cisloS: "V3",
        textik:
          "Dal krásu stvorenstvu, zveril ho nám, \nhviezdam aj vesmíru vládne.\nZa všetko s radosťou chváliť ho mám. \nPán je navždy verný nám.",
      },
      {
        cisloS: "Bridge",
        textik:
          "Vykrič radosť! Tancuj a hraj! Spievaj pieseň, aleluja.\nVykrič radosť! On je tvoj Pán! Spievaj pieseň, Boh vládne nám.",
      },
    ],
  },

  {
    cisloP: "76",
    nazov: "Hoden chvály je Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Hoden chvály je Pán, navždy je môj Boh\njeho meno mi znie v srdci, on je Kráľ\nHoden chvály je Pán, nech mu každý volá: Hosana!",
      },
      {
        cisloS: "V1",
        textik:
          "Chvála ti buď Stvoriteľ náš\nTvoje sú hviezdy i vesmír.\nStvoril si Zem, aj moria na nej\nvšetko, čo len sa vidieť dá.",
      },
      {
        cisloS: "V2",
        textik:
          "Ktože tam z nás vystúpiť vie\na môže prísť pred Tvoju tvár?\nIba, kto dá ti srdce čisté\ntoho žehnáš a prijmeš sám.",
      },
      {
        cisloS: "V3",
        textik:
          "Túžime vstať, ujmi sa nás\nláskavý Boh a dobrý Pán.\nKu tebe s bázňou prichádzajú\nsmädní, čo v tmách čakajú dážď.",
      },
      {
        cisloS: "Coda",
        textik:
          "Vstávajte, otvorte srdcia!\nJe tu Boh, slávny a mocný!\nPane príď, premieňaj život, nám.",
      },
    ],
  },

  {
    cisloP: "201",
    nazov: "Boh tak veľmi",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Boh tak [A]veľmi [G]miloval [D]svet, \nže [h]z lásky [e7]svojho Syna dal [A]nám,\n[D]nie aby [A]súdil, G]ale vy[D]kúpil.\n[h]Kto uve[e7]rí, má život več[A]ný.",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Ja som [fis]chlieb [h]života, \n[h]kto bude jesť z tohto chleba, \n[e]bude žiť [A]naveky.\n[a]Kto je moje telo a pije moju [e]krv,\n[e7]zostáva vo mne a ja [A]v ňom.",
      },
      {
        cisloS: "V2",
        textik:
          "Ja som svetlo sveta,\nkto ma nasleduje, \nnebude chodiť vo tmách,\nale bude mať svetlo života.\nO mne vydá svedectvo \nOtec, ktorý ma poslal.",
      },
      {
        cisloS: "V3",
        textik:
          "Ja som dobrý pastier,\npoznám svoje ovce a \nmoje ovce poznajú mňa.\nSvoj život položím za svoje ovce\na nikto mi ich nevezme.",
      },
      {
        cisloS: "V4",
        textik:
          "Ja som vzkriesenie a život,\nkto verí vo mňa, aj keby \nzomrel, bude žiť.\nAle nik nezomrie naveky,\nkto žije a verí vo mňa.",
      },
    ],
  },

  {
    cisloP: "202",
    nazov: "Baží Baránok",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[a]Boží Ba[d]ránok, hľa, pre [G4-G]nás[e],\npre nás Boh [F]sám \n[d]porazil [E4]moc [E]tem[E4]no[E]ty.\n[a]Božím Ba[d]ránkom Otec [G4-G]nám[e] \nslobodu [F]dal[d], \ndaroval [E4]no[E]vý [E4]ži[E]vot.",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Bohu rov[g]ný \nstal sa [d]poníže[a]ným - \n- človek,[D]Boh, taký [F]blízky \na [e]pokor[A4]ný.[A]",
      },
      {
        cisloS: "V2",
        textik:
          "Zachránil nás, \nprijal bolesť i kríž,\naby hriechy sňal, \nbol nami ranený.",
      },
      {
        cisloS: "V3",
        textik:
          "Pastier dobrý \nbol aj Baránkom sám,\nBoží Syn stal sa človekom \nz lásky k nám.",
      },
      {
        cisloS: "V4",
        textik:
          "Nad smrťou zvíťazil, \non je Boh, Pán.\nNavždy vláda i moc \ntebe, kráľov Kráľ!",
      },
    ],
  },

  {
    cisloP: "203",
    nazov: "Cez tvoje srdce, Ježiš náš",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Cez tvoje srdce, Ježiš [e]náš[e7], \n[A]k nám prúdi [A7]láska, Duch Svä[D]tý. \n[h]On naše srdcia ako [e]chrám[e7] \n[A]pre pravú [A7]lásku posvä[D]tí.",
      },
      { cisloS: "V1", textik: "" },
    ],
  },

  {
    cisloP: "204",
    nazov: "Hľa, tu som, môj Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Hľa, tu som, môj [H]Pán, \nnech sa [C]stane, [H7]ako [e]chceš, \n[G]veď ty si [D]verný \n[C]a všetko [e]o [H7]mne [e]vieš.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Myšlienky [D]moje \n[C]dôver[H]ne po[e]znáš, \n[G]všetky [D]moje [G]skutky \n[a]pred o[e]čami [H]máš.\n[e]Tvoja [C]múdrosť mi [a]dá, \n[H7]po čom [e]túžim.",
      },
      {
        cisloS: "V2",
        textik:
          "V bolesti chrániš \nsvojou pravicou, \nvyslobodíš ma \npred búrkou, víchricou. \nTvoje meno chcem \nvelebiť, chváliť.",
      },
      {
        cisloS: "V3",
        textik:
          "Sám si ma skúmaš, \nvšetko o mne vieš, \nči sedím, či stojím, \nty nado mnou bdieš. \nBože, po tvojich \ncestách chcem kráčať.",
      },
    ],
  },

  {
    cisloP: "205",
    nazov: "Ja dúfam, Bože, v teba",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Ja dúfam, [a]Bože, [d]v teba, \n[F]môj [C7]Pán a [F]Kráľ, \nlen [B]ty si [C]nádejou [d]z neba, \n[g]nás [C]obno[A]víš. ",
      },
      {
        cisloS: "V1",
        textik:
          "Vieru [B]mám [C]v teba, môj [F]Pán, \nviac [g]nemu[C]sím sa [A]báť.\nVieru [B]mám [C]v teba, môj [d]Pán, \nlen[g]ty ma [C]v láske [d]zachováš.",
      },
    ],
  },

  {
    cisloP: "206",
    nazov: "Jasám radosťou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Jasám radosťou \n[B]v Pá[F-C]no[F]vi,\nnech chvála a [C]slá[F]va \n[C4]Bo[C7]hu [F]znie.",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Pretože Pán ma zaodial \n[F]rúchom spásy, \n[C]zahalil ma pláš[F]ťom spravod[C]li[d]vosti,\n[d]ako ženícha zdobeného [C7]vencom,\n[C7]ako nevestu okrášle[F]nú [C]šperkami.",
      },
      {
        cisloS: "V2",
        textik:
          "Lebo ako zem vydá rastliny,\nako záhrada dá vyklíčiť semenu,\ntak Pán Boh dá vyklíčiť spravodlivosti \na chvále pred všetkými národmi.",
      },
      {
        cisloS: "V3",
        textik:
          "Kvôli Sionu neutíchnem,\nkvôli Jeruzalemu nebudem mať pokoja,\nkým nezažiari ako svetlo \njeho spravodlivosť, \nkým sa jeho spása nerozhorí ako fakľa.",
      },
      {
        cisloS: "V4",
        textik:
          "[F]Pretože národy uvidia \ntvoju spravod[B]livosť \na všetci králi tvoju [F]slávu. \n[F]A budú ťa volať novým menom, \n[C]ktoré ur[F]čia Páno[C]ve [d]ústa. \n[d]Budeš žiarivou korunou \nv Pánovej [C7]ruke, \n[C7]kráľovským vencom \nv ruke svoj [F]ho [C]Boha.",
      },
      {
        cisloS: "V5",
        textik:
          "Ako sa junák snúbi s pannou, \ntak si ťa vezmú tvoji synovia,\na ako ženích má radosť z nevesty, \ntak z teba bude mať radosť tvoj Boh.",
      },
    ],
  },

  {
    cisloP: "207",
    nazov: "Jesu, adoramus te",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Jesu, adoramus te\n Jesu, adoramus te\nJesu, adoramus te\nadoramus te",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Je[A/D]žiš, ty [G/D]vnášaš ži[D]vot, \n[A]svetlo do tmy no[h]ci [G]žiari [A]nám, \n[D]veď Boží [A/D]Syn [G/D]je nám da[D]ný[A], \n[G]prišli sme, [A]klaniame sa [D]ti.",
      },
      {
        cisloS: "V2",
        textik:
          "Ježiš, ty, pravý Boh a človek, \nnarodený z Márie,\nzjednocuješ, v láske verný \nzostávaš vždy uprostred nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Ježiš, ty, Baránok Boží, \nmáš srdce pre nás ranené. \nKrv a voda z neho prúdia \nprameň, čo dušu očistí.",
      },
      {
        cisloS: "V4",
        textik:
          "Ježiš, ty, zmŕtvychvstalý, \noslobodil si nás od smrti.\nZjavil si sa oslávený, \nhľa, tu sme, klaniame sa ti.",
      },
    ],
  },

  {
    cisloP: "208",
    nazov: "Ježiš drahý",
    slohy: [
      { cisloS: "R", textik: " " },
      {
        cisloS: "V1",
        textik:
          "/: [e]-Ježiš dra[h]hý trpí za [e]nás. :/ \n/: [G]-Ježiš dra[a]hý [H7]-trpí za [e]nás. :/ ",
      },
      {
        cisloS: "V2",
        textik:
          "/: Krv z jeho rán obmýva nás. :/ \n/: Krv z jeho rán obmýva nás. :/ ",
      },
    ],
  },

  {
    cisloP: "209",
    nazov: "Ježiš, Ježiš",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Ježiš, [A]Ježiš, \n[e]Ježiš, [h]Ježiš. \n[h]Je[G]žiš, [D]Ježiš, \n[e7]Je[G]žiš, [D/A-A]Je[D]žiš. ",
      },
    ],
  },

  {
    cisloP: "210",
    nazov: "Ježiš, Ježiš (kánon)",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/: [a]Je[e]žiš, [F]Je[C]žiš, \n[d]Je[a]žiš, [F-G]Je[A]žiš. :/ ",
      },
    ],
  },

  {
    cisloP: "211",
    nazov: "Ježiš, len tebe sa klaniam",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Ježiš, [fis]Ježiš, \n[G]-len [e]tebe sa [D]kla[A]niam. \n[D]Ježiš, [fis]Ježiš, \n[G]-svoj [e]život ti [D]dá[A]vam.",
      },
      {
        cisloS: "V1",
        textik:
          "[h]Ježiš, ó, [Fis]Ježiš, \n[G]-teba [A]nebo, zem [D]chvália. \n[D]Ježiš, [fis]Ježiš, \nmôj [G]Pán [A]a môj [D]Boh.",
      },
    ],
  },

  {
    cisloP: "212",
    nazov: "Ježiš, pristúpiť smiem",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Je[D/Fis]žiš, [G]pristúpiť [A]smiem, \n[D]Je[D/Fis]žiš, [G]som biedny, [A]viem. \nV tebe sa [D]ovlažím, \n[G]na hruď sa [e]priviniem[A], \n[D]Je[D/Fis]žiš, [G]som [A]biedny, [D]viem.",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Slovo, ktoré [C]dávaš nám, \n[A]mi oči [D]otvorí,\n[h]do vnútra [e]vchádzaš sám, \n[A]srdce mám [Fis]dokorán[A7]. ",
      },
      {
        cisloS: "V2",
        textik:
          "Nerozmýšľať nad sebou, obrátiť k tebe tvár a v službe pre iných seba dať na oltár.",
      },
      {
        cisloS: "R2",
        textik:
          "Ježiš, Boh môj verný, Ježiš, brat dôverný, tvoj pohľad láskavý mi srdce preniká,Ježiš, brat dôverný.",
      },
    ],
  },

  {
    cisloP: "213",
    nazov: "Ježiš, si tu prítomný pre nás",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Ježiš, si tu prítomný pre nás, \n[e]ponížený služobník a Pán. \n[a]Ty najmocnej[D]ší, \ntak [G]pokorne sa [C]skláňaš, \n[a]ty prebývaš [h]v nás, ó, Pane [e]náš.",
      },
      {
        cisloS: "V1",
        textik:
          "Ten [a]chlieb, ktorý nám [D]dávaš, \n[H7]víno tajom[e]né -\n[a]- telo, krv presvä[H4]tá[H]. \nSvoj [a]život za nás dávaš, \n[e]srdce dokorán, \n[a]ty prebývaš [h]v nás, ó, Pane [e]náš.",
      },
      {
        cisloS: "V2",
        textik:
          "Cez tvoj života dar \nty túžiš navždy byť \nnašich sŕdc večný Kráľ. \nSi zapálený láskou \nk nám, vysmädnutý, \nty prebývaš v nás, ó, Pane náš.",
      },
      {
        cisloS: "V3",
        textik:
          "My s tebou spojení \ntiež túžime byť tým \nsvätostánkom živým. \nSme ľudstvo zblúdené, \nlen v tebe jednotní, \nty prebývaš v nás, ó, Pane náš.",
      },
    ],
  },

  {
    cisloP: "214",
    nazov: "Ježiš, viem, že obdaríš",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Ježiš, [a]viem, že obdaríš \nDu[C]chom [d]tých, ktorí \n[B/C]prosia s dô[C]ve[F]rou. \nMôj [g]Pán[C7], \nsvetu daruj [F]v nás [A7]tvoj o[d]heň, \n[B]prijmi obeť [C]našich živo[d]tov.",
      },
      { cisloS: "V1", textik: "" },
    ],
  },

  {
    cisloP: "215",
    nazov: "Keď k nebu hľadím",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Keď [D]k nebu hľadím, \nv duchu[A/Cis]volám, \na keď [e]prosím s dôve[Fis4]rou[Fis], \nvtedy [h]Pán mi dlaň po[fis]dáva \na ja [e]rád som v jeho ru[Fis4]kách[Fis], \nvtedy [h]Pán mi dlaň po[fis]dáva \na ja [e]rád som [D/A]v jeho [A7]ru[D]kách.",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Láska [H7]tvoja nekon[e]čí, \nani [D7]keď noc pokro[G]čí, \na keď [Fis7]vo tme svetlo [h]nebadám, \nviem, že [G]ty ma chrániš [A4]sám[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Nádej svoju v tebe mám, \nty ma dvíhaš, keď klesám, \nmoje rany s láskou ošetríš, \npokoj vnútra obnovíš.",
      },
      {
        cisloS: "V3",
        textik:
          "Chválou srdce zahorí, \nkeď mi brány otvoríš, \nživot svoj ti s úctou odovzdám, \nza vernosť ti lásku dám.",
      },
    ],
  },

  {
    cisloP: "216",
    nazov: "Keď na vás Duch spočíva",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "/: [e]Keď na [h]vás Duch [e]spo[D]čí[G]va, \nra[D]dosť [e]va[D]ša [e]je [h]stá[e]la. :/ \n[G]V láske [D]mojej [e]kto [D]zo[e]tr[h]vá, \n[G]príka[D]zy mo[e]je [D]za[e]cho[h]vá.\n[e]Ten, kto [h]vo mne [e]zos[D]tá[G]va, \nspĺ[D]ňa [e]tak [D]mo[e]je [h]slo[e]vá.",
      },
      {
        cisloS: "V2",
        textik:
          "/: Ak prosíte ako ja, \nOtec s radosťou dáva. :/ \nKto prosí, ten dostáva dar, \nradosťou mu zažiari tvár.\nAk trpíš a smäd cítiš, \nver, že ja som vždy blízko.",
      },
      {
        cisloS: "V3",
        textik:
          "/: Ja som si vyvolil vás, \nbuďte svedkami lásky.:/ \nAko som ja miloval vás, \ntak nech láska zažiari zas.\nBuďte svedkami lásky, \nbuďte svedkami lásky.",
      },
    ],
  },

  {
    cisloP: "217",
    nazov: "Keď skrývaš ma",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Keď [D]skrývaš ma [D/e]sám, \nOtče [D/Fis]môj, v náru[G]čí,\ntak [D]viem, že [e7]môžem byť šťast[A4]ný[A]. \nKeď [D]skrývaš ma [D/e]sám, \nOtče [G]môj, v náru[D]čí, \n[G]tak [D]viem, [G]že [e]môžem [A]byť šťast[D]ný.",
      },
      {
        cisloS: "V1",
        textik:
          "Na [h]nebesia poze[fis/A]rám, \nkde [e/G]pomoc obja[h]vím, \ndobre viem, že ty si [G]môj Boh a [A4]Pán[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Ty dýchaš prach z mojich ciest \na vôbec nezaspíš, \nani nedriemeš, ty stráž mojich dní. ",
      },
      {
        cisloS: "V3",
        textik:
          "Za dňa ma slnko nespáli, \nani mesiac za noci, \náno, ty si v noci stráž, vo dne tieň.",
      },
      {
        cisloS: "V4",
        textik:
          "Či odchádzam, či prichádzam, \nviem, že sa nestratím, \nlebo naveky ma chrániš, môj Pán.",
      },
    ],
  },

  {
    cisloP: "218",
    nazov: "Keď spoznáš dar",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[a]Keď spoznáš [e]dar, \nktorý dnes [e]dáva ti [e]Pán,\n[h]sám popro[e]síš, \nnech [h]dá ti plný [e]džbán.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Poďte, [D]pozrite sa, \n[G]či to nie je [a6]Spasiteľ sve[e]ta. \n[e]Poďte, [D]prisľúbil nám \n[G]vodu večné[a6]ho živo[e]ta.",
      },
      {
        cisloS: "V2",
        textik:
          "Veľké tajomstvo mi \nzvestoval tam, pri našej studni.\nTen, kto pije z jeho vody, \nnikdy nebude smädný.",
      },
      {
        cisloS: "V3",
        textik:
          "Lenže, kto by sa chcel \nnapiť živej vody z prameňa,\nmusí sa k nej skloniť \naž dolu, k zemi, na kolená.",
      },
    ],
  },

  {
    cisloP: "219",
    nazov: "Kiež by si poznal",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Kiež by si [B]poznal \n[g7]dar, čo ti [a]dávam, \n[B]živú vo[g7]du, ktorá [A7]smäd uhasí. \n[d]Ja som tvoj [B]Boh, \n[C]Stvoriteľ [A]tvoj, \n[B]pri mojom [g7]srd[a]ci sa [d]stíš.",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Ja som ťa [C]utvoril \n[d]v matkinom [a]lone, tak \n[B]uver, že [g7]si pre mňa [C]vzácny. \n[F]Pre teba [C]vzdal som sa \n[d]všetkého, [a]nemaj strach, \n[B]veď som ťa [g7]vy[a]slobo[d]dil.",
      },
      {
        cisloS: "V2",
        textik:
          "Keď rieku pre kročíš, \ntieň smrti zakúsiš, \nneboj sa, budem s tebou. \nVyvolil som si ťa, \nza ruku vediem ťa \na nikdy neopustím.",
      },
      {
        cisloS: "V3",
        textik:
          "Som Boh Izraela, \nStvoriteľ vesmíru, \nja som celý svet vykúpil. \nNebesia rozprestieram, \nvesmír v dlani mám, \nja som tvoj jediný Pán.",
      },
      {
        cisloS: "V4",
        textik:
          "Kráčam vždy pred tebou, \nza teba bojujem, \notváram ti všetky brány. \nZlámal som závory, \ncestu pripravil, veď \nja som Pán, iného niet.",
      },
      {
        cisloS: "V5",
        textik:
          "Otváram poklady \nv hlbinách ukryté, \nbohatstvom ťa obdarím. \nIzrael, počuj môj hlas, \nnavždy pamätaj, \nja som tvoj jediný Boh.",
      },
    ],
  },

  {
    cisloP: "220",
    nazov: "Láska, môj Pán",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Láska, môj [h]Pán, \nvždy si [C]blízko, chceš ma [G]viesť ty [G/Fis]sám, \n[e]z lásky môj [h]Pán, \nty si [a]miesto mňa vzal [D4]kríž[D]. \n[G]Tvoj som a [h]viem, \nže [C]v tvojich dlaniach [G]úkryt mám, \n[a]s vierou kráčam [G]k výšinám, \nkde [C]miesto [D4]mám, [D]môj [G4]Pán[G].",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Kto ma môže [h]chrániť \na [C]kto mi dlaň po[G4]dá[G]? \n[a]Všetko môže [G/H]Pán môj, \non [C]stvoril Zem pre [D]nás. \n[e]Keď ma nájde [h]v tiesni,\nhneď [C]roztrhá pu[G4]tá[G].\n[a]Verný je vždy [G/H]v láske, \nje [C]môjho srdca [D]Kráľ.",
      },
      {
        cisloS: "V2",
        textik:
          "Skôr, než som ťa vnímal, \ntvoj pohľad na mne tkvel, \nkeď som kráčal skúškou, \nsi mocne pri mne stál. \n Tvoja náruč lásky \nma silou naplní, \nveď ja som tvoj zázrak, \nčo k nebu môže ísť.",
      },
    ],
  },

  {
    cisloP: "221",
    nazov: "Len v tvojom náručí",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/:[d]Len v tvojom náručí \n[d]chcem odpočívať, \n[g]ó, Bože, Stvoriteľ [C]môj, \nveď [g6]srdce moje \n[A7]stále je nespokoj[d]né \n1)]a [g]túži v tebe [A]spočinúť. :/ \n2)]a[g]túži [A7]v tebe [d]spočinúť.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]-Ktože ma napl[g]ní, \n[C]-kto mi srdce poz[F]ná, \n[B]-ktože mi odpo[Edim]vie, \nkto sa vo mne vyz[A4]ná[A]?\n[d]-Pane dobroti[g]vý, \n[C]-len ty ma obži[F]víš,\n[B]-Bože, láska več[Edim]ná, \nkrása nekoneč[A4]ná[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Moja duša smädná \nje, Bože, za tebou, \nnapájaj ma, prosím, \nsvojou živou vodou. \nSvojho Ducha mi daj, \nnech ma unáša prúd, \n to v jeho objatí láske \nviem odomknúť.",
      },
      {
        cisloS: "V3",
        textik:
          "Bože, teraz poznám \ntvoju lásku vernú, \nvždy, keď sa jej poddám, \ndvere sa odomknú. \nNahraď plamene slov \nduchom milosrdným. \nUč ma podať pohár, \nuč ma byť posledným.",
      },
    ],
  },

  {
    cisloP: "222",
    nazov: "Mojou túžbou",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "Mojou [d]túžbou je [A]len \nzostať [B]úplne [A]tvoj, \nchcem [d]odovzdať sa [C]Láske, \n[F]tebe, Pane [A]môj. \nMojou [d]túž[C]bou je, [F]Láska, \n[g]v tebe [A7]spoči[d]núť.",
      },
      {
        cisloS: "V2",
        textik:
          "Inú cestu nepoznám, \nako byť zrodený \npre oheň Ducha lásky, \nbyť mu poddajný. \nInú cestu nepoznám, \nlen byť v ňom zrodený.",
      },
      {
        cisloS: "V3",
        textik:
          "Inú nádej nemám, \ntebe dnes všetko dám. \nKu darom tvojej lásky \nvernosť zachovám.\nInú nádej nemám, \ndnes tebe všetko dám.",
      },
      {
        cisloS: "V4",
        textik:
          "Iný dôvod nemám, \nprečo žiť, Pane môj, \nlen tvoje meno niesť \nna perách s oslavou. \nIný dôvod nemám, \npre život, Pane môj.",
      },
    ],
  },

  {
    cisloP: "223",
    nazov: "Môj Otče",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]le[D]bo [G]si môj [e]Otec, \nja [a]dôverujem [D]ti, \nlebo [G]si môj [e]Otec, \npat[a]rím ti [D]nave[G]ky.",
      },
      {
        cisloS: "V1",
        textik:
          "Môj [e]Otče, môj [D]Otče, \nja [C]sa ti oddá[G]vam. \n[e]Staň [D]sa [G/H]tak, \nako [a/C]chceš ty [H]sám. \n[e]Čokoľvek [D]robíš, \n[C]vždy ti chválu [D]vzdám, \n[H]som priprave[e/G]ný, \n[C/G]všetko prijí[D/A]mam. ",
      },
      {
        cisloS: "V2",
        textik:
          "Môj Otče, môj Otče,\nmám k tebe dôveru.\nDávam dušu \ndo tvojich rúk. \nTebe ju dávam \nso všetkou láskou, \njednu túžbu mám: \npatriť ti môj Pán.",
      },
    ],
  },

  {
    cisloP: "224",
    nazov: "Náš Boh je láska",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Náš Boh je [H/Dis]láska, \n[cis7]všetko obno[gis]ví. \n[A9]Náš Boh je lás[E]ka, \n[H4]v láske ťa [H]pretvorí. \n[E]Náš Boh je [H/Dis]láska, \n[cis7]všetko obno[gis]ví.",
      },
      {
        cisloS: "R1",
        textik:
          "[fis:]Otvor [E/Gis]srdce [A]doko[H4]rán[H], \n[fis]otvor [E/Gis]srdce [A]vchá[H]dza [A]Pán[E].",
      },
      { cisloS: "R2", textik: "Pán je mojou nádejou,\nnekonečnou láskou." },
      {
        cisloS: "V1",
        textik:
          "Ja [E4]som ťa milo[E]val \nskôr, [cis]než som ťa stvoril, \nty [A9]bol si v mojom srdci \nukry[H4]tý[H]. \nSvet [E]som ti daroval \npre [cis]teba stvorený, \n[A9]aby si sa tešil \n[H4]-a mal ma [H]rád!",
      },
      {
        cisloS: "V2",
        textik:
          "Ja som ťa miloval, \nkeď si sa odvrátil\na chcel si svojou vlastnou \ncestou ísť.\nJa šiel som za tebou, \nvždy som ťa hľadal, \nbysʼ navrátil sa domov \na znovu žil!",
      },
      {
        cisloS: "V3",
        textik:
          "Boh nám ukázal, \nako veľmi nás mal rád,\nkeď jediného Syna \nposlal k nám.\nV celom svete niet, \nniet väčšej lásky\nJežiš dáva život \nza nás na kríž!",
      },
    ],
  },

  {
    cisloP: "225",
    nazov: "Nech Pánovi znie",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[g]Alelu[Es]ja, [c]a[d]lelu[g]ja, \nalelu[Es]ja, [F]a[d]lelu[g]ja!",
      },
      {
        cisloS: "V1",
        textik:
          "/: Nech [g]Pánovi [d]znie \nhlas [Es]náš[F]- jasa[B]vý,\nnech [g]vzýva ho [d]Boží ľud, \nchválu mu [g]vzdá. :/",
      },
      {
        cisloS: "V2",
        textik:
          "Dnes chrám zaplesá, \nBoh sám ide k nám,\nhlas trúb mocne zavolá: \n„Ježiš je Pán!“",
      },
      {
        cisloS: "V3",
        textik:
          "Náš Pán úžasný \nnám tvár rozjasní,\non sám prišiel spasiť nás, \nkráčajme s ním.",
      },
    ],
  },

  {
    cisloP: "226",
    nazov: "Ó, Pane, ty si prítomný",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "Ó, [g]Pane, [F]ty si [B]prítom[D]ný tu, \n[g]v Eucha[D4]ris[D]ti[g]i,\nbuď [c]uctie[g]vaný, [F]zvele[B]bený\n[g]v tejto [D]hosti[g]i.",
      },
      {
        cisloS: "V2",
        textik:
          "Ty, svätý Boh, pre večnú spásu\nseba si nám dal\na za nás hriešnych si svoj život \nz lásky obetoval.",
      },
      {
        cisloS: "V3",
        textik:
          "Na svojich pleciach odniesol si \nťarchy našich vín\na svojou krvou dávaš nádej \nsrdciam úbohým.",
      },
      {
        cisloS: "V4",
        textik:
          "To z tvojho boku krv a voda \nmohla vytrysknúť,\nlen tvoj Svätý Duch dáva našim \nsrdciam precitnúť.",
      },
      {
        cisloS: "V5",
        textik:
          "Pre radosť z tvojho zmŕtvychvstania \nchceme, Pane, žiť\na Boží život z tvojej lásky \nzase obnoviť.",
      },
    ],
  },

  {
    cisloP: "227",
    nazov: "Pane, my sme ťa spoznali",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "[F]Pane, [C/E]my sme ťa [d]spozna[a7]li, \n[B]keď si nám [g7]lámal [C]chlieb, \n[F]naše [C/E]srdcia [d]jasajú, \nkeď [B]do nich [F]vchá[a7]dzaš ty [C]sám. \nDaj nám [a]síl, dôve[d]ru, [C/E]náš [F]Pán, \n[B/D]v chle[C7/E]be tu [F]prítom [C4]ný[C]. \n[B]Spájaj [C4]nás[C], [A/Cis]kráčaj [d]v nás \na [B]daj, [C]nech sme jednot[F]ní.",
      },
      {
        cisloS: "V2",
        textik:
          "Tajomne si tu prítomný, pred zrakom ukrytý, v chlebe, víne posvätnom, si väzňom lásky pre nás. Ty si dar pre život, náš Pán, v chlebe tu prítomný. Telo, krv dávaš nám, ty sám posilňuješ nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Skláňame sa tu, pred tebou, prijímame živý chlieb. Dobrý pastier, dvíhaj nás a vezmi na ramená. Tebe chvála buď, ó, náš Pán, v chlebe tu prítomný. Pretvor nás, cestou chráň. Si Pán, k sebe priveď nás.",
      },
      {
        cisloS: "V4",
        textik:
          "Dnes tvoj Duch, Pane, učí nás, zrieť v chlebe tvoju tvár. Veď v ňom si ty prítomný a kladený na oltár. Dotyk tvoj, Ježišu, náš Pán, v chlebe tu prítomný, je šťastím, radosťou, pre nás je uzdravením.",
      },
      {
        cisloS: "V5",
        textik:
          "Hladní sme, často bezradní, hĺbi sa prázdno v nás. Chlieb, ktorým ty sýtiš nás, je manna, čo život dá.  Ty si nám pokrmom, náš Pán, v chlebe tu prítomný. Pripoj nás k blaženým. Hlas náš teba velebí.",
      },
      {
        cisloS: "V6",
        textik:
          "Celá zem sa tu raduje z Pána, on žiari v nás. Stal sa pre nás človekom, on, Boh, je jedným z nás. Svätý zbor teba ctí, náš Pán, v chlebe tu prítomný. Kráľov Kráľ, vládni nám, tak príď, naveky ži v nás.",
      },
    ],
  },

  {
    cisloP: "228",
    nazov: "Poďme všetci k stolu Pána",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[F]Poďme [C]všetci [d]k stolu [a]Pána,\n[B]na kto[F]rom sa on [g]dáva [d]teraz [C]nám.\n[F]Ponúk[C]nime [d]srdcia [a]naše, \n[B]nech ich [F]sviatosťou [g]uzdra[C]vuje [F]Pán.",
      },
      {
        cisloS: "V2",
        textik:
          "Hľa, úžasné premenenie, \nkde Kristus berie na seba hriech náš.\nPrecíťme prítomnosť jeho, \nBožou láskou on zaodeje nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Vzdávame ti vďaku, Otče,\npre Syna tvojho, Ježiša Krista.\nVeď silu žiť z darov tvojich\numožní nám vždy len láska čistá.",
      },
    ],
  },

  {
    cisloP: "229",
    nazov: "Príď, túži za tebou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Príď, [e]túži za te[D]bou moja [a]du[H]ša. \nTy [e]sám si prameň [D]môj, \nv ňom [G]ná[A7]dej [H]mám.\nViem, [G]lás[D]kou napl[e]níš \nmôj [a]práz[H7]dny [e]džbán.",
      },
    ],
  },

  {
    cisloP: "230",
    nazov: "S láskou tebe dám",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[(E)]S lás[A]kou tebe [D]dám[A] \nživot [D]svoj, len ty [A]sám \n[(fis)]-vždy [cis]chráň ma, môj [D]Pán[h - E]! ",
      },
      {
        cisloS: "V1",
        textik:
          "Mne [A]skľúčenosť [D]viac neu[A]blíži, \nveď [D]dávaš mi priateľov [A]vzácnych. \nV nich [C]pôsobíš sám vernou [G]láskou \na [D]môj duch ťa chváli, ja[E]sá[G - E]. [E7] ",
      },
      {
        cisloS: "V2",
        textik:
          "Za cieľ pokladám svojho Pána, \nje sám odmenou bohatou, \na mzdou mojej úmornej práce. \nOn rád sa mi v Sviatosti dáva.",
      },
      {
        cisloS: "V3",
        textik:
          "Šťastím duša náhli sa k spáse, \njej túžbou je spájať sa s krásou, \nniet záhuby tam, kde je láska. \nTak smiem spočinúť v rukách Kráľa.",
      },
      {
        cisloS: "V4",
        textik:
          "Ja chválim ťa, môj Pane, s bázňou, \nsi útočiskom v čase hrôzy. \nDnes s nádejou vchádzam do chrámu \na svoj život s pokorou dávam.",
      },
    ],
  },

  {
    cisloP: "231",
    nazov: "Svätý Otče",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[G]Svätý Otče, hľa, [h]tvoj ľud ti [C]nesie[e] \ndary, [a]kto[G]ré si [C]daroval [D4]nám[D].\nMáme [G]radosť a [h]vzdávame [C]vďaky[e], \n[a]kladie[G]me [C]ich [D7]na ol[G]tár.",
      },
      {
        cisloS: "V2",
        textik:
          "Toto víno i chlieb, čo nám dávaš, \nSvätý Otče, Boh dobrotivý,\nmocou Ducha ich v telo, krv premeň, \nvo sviatosť spásy pre nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Aké nesmierne je to, čo činíš, \nseba samého darúvaš nám.\nŽivot náš nech je obetou chvály, \nčo chceme dať na oltár.",
      },
    ],
  },

  {
    cisloP: "232",
    nazov: "Tak ako laň",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[a]-Tak ako [e]laň, čo túži \n[d]po živej [a]vode,\n[a]tak aj ja [e]teba túžim \n[d]nájsť, ó, môj [a]Bože. \n[a]Veľmi [e]smädný [a]som, \npo te[e]be, môj [a]Pán.\n/: Chcem [F]v tvojom [G]dome [C]bý[d]vať, \n1)]uzrieť tvoju [E]tvár. :/ \nuzrieť [E4]tvo[E]ju [a]tvár.",
      },
      {
        cisloS: "V2",
        textik:
          "Daj mi dnes tvoje svetlo \naj tvoju pravdu,\nnech ony povedú ma \nk svätému stánku.\nNech mi robia štít, \nnohám určia smer.\nLen s nimi môžem kráčať \nza tebou, môj Pán. :/ \nza tebou, môj Pán.",
      },
      {
        cisloS: "V3",
        textik:
          "Dnes túžim prísť k oltáru \nPána a spievať\na jeho meno chváliť, \nz hĺbky ho vzývať.\nTy si skalou nám, \npevnosťou si sám.\nSi spásou mojej duše, \nbránou dokorán. :/ \nbránou dokorán.",
      },
    ],
  },

  {
    cisloP: "233",
    nazov: "Tak ako sa dá",
    slohy: [
      {
        cisloS: "R",
        textik:
          "/: [a]-Celý [e]som [F]tvoj, [d7]Je[G]žiš, \ncelý som [E]tvoj, Je[a]žiš. :/",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Tak ako [d]sa [a]dá \nhlina spraco[F]vávať\nna nový [d]džbán \npod majstrovou ru[a]kou, \n[C]tak v tvojich [d]ru[a]kách \nčlovek sa pre[F]tvára, \ntebe sa [d]dávam , Bože [a]môj.",
      },
      {
        cisloS: "V2",
        textik:
          "Ako zem suchá, tak aj moje vnútro \ndychtivo túži živú vodu nájsť. \nK tebe sa viniem, lebo z tvojich útrob\nprameň tryská, čo zaplaviť ma vie.",
      },
      {
        cisloS: "V3",
        textik:
          "Tak ako čaká strážca východ slnka, \ntak očakávam nádej z tvojich slov.\nVeď tvoje slová ako luna svietia \na ponesú ma cestou za tebou.",
      },
    ],
  },

  {
    cisloP: "234",
    nazov: "Toto je telo a toto je krv",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Toto je telo a [A]toto je [e]krv,\n[H]čo [e]dávaš za mňa na oltár, [h]Spasiteľ môj.\n[G]Pravý Boh za pokrm [D]ľuďom sa [h7]dal, \n[e7]aby večný život [A]v nás zacho[G]val[D].",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Keď už Golgota [h]Baránka čaká[A],\nJežiš [h]pozdvihol [Gmaj]víno a [A4]chlieb[A],\n[Fis/Ais]ono [h]krvou a [G]telom sa \n[G/H]stá[h]va,\naby [D]do svet[D/Cis]la [h]mohli sme [A4]prejsť[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Na zem zostúpil, v chlebe sa delí,v sebe dedičstvo daroval nám,aby nikto z nás neminul svoj cieľ,aby nikto viac nebol hladný.",
      },
      {
        cisloS: "V3",
        textik:
          "Iba vo viere rozpoznať musím,že si skutočne tu prítomný,v tomto posvätnom chlebe a víne,Vykupiteľ môj, oslávený.",
      },
      {
        cisloS: "V4",
        textik:
          "Naše ústa nech vždy ohlasujú veľký zázrak, čo urobil Pán,že nás zapálil ohnivou láskou,že sa ponúka svetu i nám.",
      },
    ],
  },

  {
    cisloP: "235",
    nazov: "Tvoje srdce, Pán môj",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[h]Tvoje srdce, [A]Pán [A7]môj, \nk nám horí [D]láskou,\n[G]v tvojom srdci [D]máme [A4]ú[A]kryt. \n[h]Srdce, ktoré [A]chráni \n[A7]lásky oh[D]nisko,\n[G]v ňom je čistá [h]Bo[A7]žia [D]láska.",
      },
      {
        cisloS: "V1",
        textik:
          "[A]Zvelebený [fis]chrám, \n[h]láska pre [A]nás, \n[G]svätostánok [D]tajom[A4]ný[A].",
      },
      {
        cisloS: "V2",
        textik: "Ty si prameňom lásky pre nás, srdce pre mňa strýznené.",
      },
      {
        cisloS: "V3",
        textik: "Víťaz nad smrťou, dávaš sa nám, z teba život pramení.",
      },
      {
        cisloS: "V4",
        textik: "Ježišu tichý, Boh pokorný, nech sa tebe podobám.",
      },
    ],
  },

  {
    cisloP: "236",
    nazov: "Ukáž nám svojho Otca, Pane",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Ukáž nám [G]svojho Otca, [G/A]Pa[A]ne,\n[D]učiteľ, [G]kadiaľ [e]máme [A4]ísť[A].\n[D]Ukáž nám [G]svojho Otca, [G/A]Pa[A]ne, \nto nám posta[D]čí.",
      },
      {
        cisloS: "V1",
        textik:
          "[h]Ja som [e]cesta, pravda, \n[A]život, vravím vám, \n[fis]kto mňa [e7]nájde, [G]Otca [A4]má[A]. \n[h]Ja som [e]v Otcovi a \n[A]on je vo mne [h]sám, \n[fis]aj vám [G]skrze mňa sa [A4]dá[A]va.",
      },
      {
        cisloS: "V2",
        textik:
          "Toľký čas som s vami ako brat, čo má nádej pre každého v tiesni. Láska Otcova sa priblížila k vám, vieru darovať vám túžim.",
      },
      {
        cisloS: "V3",
        textik:
          "Pozri na skutky, čo pre teba konám, aspoň pre ne uver láske. My sme s Otcom jedno, jeho vládu mám, dvíhaj pohľad k výšinám.",
      },
      {
        cisloS: "V4",
        textik:
          "Ten, kto uverí mi, bude robiť sám skutky, aké ja konám. Láskou šíriť vieru aj vás povolám, vchádzam do Otcovej slávy.",
      },
      {
        cisloS: "V5",
        textik:
          "Ak ma miluješ, to slovo zachováš. Otec otvára ti náruč. Chcem vás previesť po nebeských záhradách k žriedlam, tam, kde pokoj vládne.",
      },
    ],
  },

  {
    cisloP: "237",
    nazov: "Veľmi ďakujem, Pane",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[h]Veľmi ďakujem, Pane [e]môj, \nza dar [h]lás[Fis]ky,\n[h]že mi dávaš [e]svoje \n[A]otvo[fis]rené [D]srd[Fis]ce.\n[h]Veľmi ďakujem, Pane [e]môj, \nza ten [h]zá[Fis]zrak,\n[h]že mi dávaš [e]život, \n[Fis]svojho [Fis7]Ducha [h]dáš.",
      },
      {
        cisloS: "V1",
        textik:
          "[h]Boh môj a môj [Fis]Pán, \n[Fis7]len teba hľa[h]dám,\n[e]túžim po [h]tebe [Cis]celý život [Fis]svoj.\n[h]Prosím, Pane [Fis]môj, \n[Fis7]lásku mi da[h]ruj,\n[e]túžim za te[h]bou, [Fis]len za te[h]bou.",
      },
      {
        cisloS: "V2",
        textik:
          "Na teba myslím, v tebe nádej mám, len modlitbou smäd si uhasím. Ako suchá zem napojiť sa chcem vodou z prameňa, živou vodou.",
      },
      {
        cisloS: "V3",
        textik:
          "Chvála mojich úst prenikne cez púšť, ňou ospievam tvoju dobrotu.Ruky vystieram, svoje srdce dám tebe, Pane môj, tebe, môj Pán.",
      },
    ],
  },

  {
    cisloP: "238",
    nazov: "Vezmi si môj život",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "[d]Vezmi si môj život, \n[B]vezmi, [C]Pane [F]môj,\n[G7]tvoj [A7]plameň [d]vo mne \n[g]zastrie [A]nepo[d]koj.\n[d]Nech ti celé vnútro\n[B]spieva [C]hymnus [F]chvál,\n[G7]buď [A7]mojím [d]vládcom, \n[g]môj [A]božský [d]Kráľ.",
      },
      {
        cisloS: "R",
        textik:
          "[d]Ty, plameň [g]lásky, \n[C]žitia pocho[F]deň,\n[d]ku tebe [g]volám, \n[C]či je noc, či [F]deň.\n[G7]Vez[A7]mi môj [d]život, \n[g]vezmi [C7]život [F]môj,\n[G7]za[A7]sej v ňom, [d]Pane, \n[g]lásku [A]a po[d]koj.",
      },
      {
        cisloS: "V2",
        textik:
          "Chráň ma pred zlom, Pane, drž ma, keď padám, nech čistú vernosť tebe zachovám. Keď mi zloba tieni výhľad na teba, Pane, si hviezdou, žiariš mi z neba.",
      },
      {
        cisloS: "V3",
        textik:
          "Hľa, žiariš sťa slnko, jasom krášliš zem, vravím ti: 'Áno, teba milujem'. Nemusím sa báť, veď dnes si prišiel k nám, na teba hľadím, Ježiš, Boh a Pán.",
      },
    ],
  },

  {
    cisloP: "239",
    nazov: "Vybral som si vás",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "[fis]Vybral som si [D]vás, \naby [E]oheň nezha[A]sol, \n[h]vy ste svetlo [fis]sviec, \nste [D]ako v chlebe [Cis]soľ. \n[fis]Ak ste vsade[cis]ní \ndo [h]môjho prame[fis]ňa, \ntak [D]vo vás dozre[h]jú \nplody spa[Cis]se[fis]nia.",
      },
      {
        cisloS: "V2",
        textik:
          "Dotknite sa rúk, vložte prsty do boku, umyte sa v láske ako v potoku. Áno, vzkriesený som prišiel medzi vás, kým ma zavolá k sebe Otcov hlas. ",
      },
      {
        cisloS: "V3",
        textik:
          "Svojho Ducha vám pošlem v znaku pokoja, bratov povzbudzujte, nech sa neboja. Zložte na paténu život s nadšením, hladným vás rozdám, keď vás premením.",
      },
      {
        cisloS: "V4",
        textik:
          "Zhromaždite môj ľud, nech nie je mnoho stád, žiarte radosťou, veď všetkých vás mám rád. Nadľahčujte láskou, v duši každý tieň a s bázňou očakávajte Pánov deň.",
      },
    ],
  },

  {
    cisloP: "240",
    nazov: "Za nás vzal si kríž",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "Za [A]nás vzal si [A/Cis]kríž, \nsi [D]hoden všetkej [h]slá[E]vy, \n[D]ty, Baránok [A/Cis]náš, \nčo [h7]v nebi má svoj [E/Gis]trón. ",
      },
      {
        cisloS: "V2",
        textik:
          "[D]„Múdrosť a [Cis4]moc!“ volám \n[Cis/Eis]tebe, [fis]Ví[E]ťaz, [A/Cis]Kráľ. \nTebe [D]sláva vždy [E4]atrí. [E]A[fis]men. \n[A/Cis]Tebe [D]sláva vždy [E4]patrí. [E]A[A]men.",
      },
    ],
  },

  {
    cisloP: "241",
    nazov: "Zohni kolená",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "[G] Zohni kole[C] ná, \n[D/C] Pán prichádza [h] k nám,\n[e7] spájaj sa [C] s ním \n[h] tichou [a7] modlit[D] bou.",
      },
      {
        cisloS: "V2",
        textik:
          "[G] Sám uvi[C] díš, \n[D/C] on sa poze[h] rá,\n[e] piesňami [C] ví[h] tame \n[a7] Kráľa [D4-D] krá[G]ľov.",
      },
    ],
  },

  {
    cisloP: "242",
    nazov: "Tebe chvála navždy znie",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "/: Tebe [B]chvála navždy [g]znie. \nTebe [A]sláva vždy pat[D]rí, \npocta, [g]víťaz[d]stvo i [Es]vláda. \nLen [B]sám si Kráľ, [F]Syn Boží! \nTy si [g]zvíťa[d]zil, náš [Es]Pán. \nPrijmi [c]úctu, Baránok [F]náš. :/",
      },
      {
        cisloS: "R",
        textik:
          "/: A[B]men, a[g]men, \nty si [Es]zvíťa[c7]zil, náš [F4 - F]Pán. :/",
      },
    ],
  },

  {
    cisloP: "243",
    nazov: "Môj Otče, keď biedny som",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[hmi]Mocný Boh zástupov, [G9]záchranca môj,\n[D]spievam ti chválospev, [A4]viem, že som [A-A/Fis]tvoj.\n[hmi]Najvyšší, sláva ti [G9]k nebu volám:\n'[D]Ó, [A/Cis]kráľov [hmi] Kráľ,' život [G9]svoj ti [A4]s lás[A]kou [D4-D]dám.",
      },
      {
        cisloS: "V1",
        textik:
          "Môj [D9]Otče, keď biedny som, [fismi7]na zem padám.\nTy [G9]počuješ hlas, čo [D9/Fis]z hĺbky volá: 'Príď, [emi7]uzdrav ma zo všetkých [A4]rán!'\n[A]Ó, [D9]Ježiš, si spásou, si [fismi7]Boh môj a Pán, keď [G9]kráčam nocou,\nsi             [D/Fis]stále so mnou, ja [C2]do tvojich [C/H]rúk život [A4-A]dám.",
      },
      {
        cisloS: "V2",
        textik:
          "Ja túžim žiť s milosťou, o dar prosím: 'Ó, Duch Svätý, príď, si ohnivý štít. Chráň vieru, čo v srdci nosím.'Hoc bázeň vždy mám, tak pristúpiť smiem. Keď duša bolí, o pomoc prosí, ty vždy pri mne blízko si, viem.",
      },
      {
        cisloS: "B",
        textik:
          "[hmi]Vzácni sme, vieme, ty [G9]nad nami bdieš.\n[D]V dlaniach sme vpísaní, [A]o každom vieš.\n[G]Svieť v našich tmách, [D]premáhaj strach,\naž [A4]kým domov nás prive[A]dieš. [A/G - A/Fis]",
      },
    ],
  },

  {
    cisloP: "244",
    nazov: "Láskavý Pane",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Láska[A/Cis]vý Pane, [hmi7]prijmi [G2]nás, [D/Fis]biedni [emi]sme, vieš [A4-A]sám.\n[D]Príď a [A/Cis]láskou [hmi7]premeň [G2]nás, chceme [emi7]kráčať [A4]k vý[A]ši[D]nám.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Pri[A]niesť ti [fismi7]smiem [G2]dar [A]vína, [hmi7]chlieb,\n[G]v nich [A]dávaš [fismi7]seba [hmi]nám, [emi7]chvála [G]nech [emi7]ti [A4-A]znie.",
      },
      {
        cisloS: "V2",
        textik:
          "Skláňaš sa k nám, láskou horíš, si Kráľom našich sŕdc, rád ich premeníš.",
      },
    ],
  },

  {
    cisloP: "245",
    nazov: "Ó, môj Ježiš",
    slohy: [
      {
        cisloS: "R",
        textik: "[D]Je[E]žiš, \n[cis]Je[fis]žiš, \n[D]Je[E]žiš, adoramus [A]te",
      },
      {
        cisloS: "V1",
        textik:
          "Ó, [A]môj Ježiš, Pán môj [D]milovaný,\n[E]táto [fis]dôverná [A/E]chvíľa [D]slasťou je mi.\n[E]Potichu [fis]kľaknem [cis]na kolená [D] [A/Cis] \na táto [hmi]chvíľa [D]je radostná.[E]",
      },
      {
        cisloS: "V2",
        textik:
          "Tvoja láska mi vnútro rozochvieva. Aký žalm, Ježiš môj, smiem tebe spievať? Srdce mi žasne na tisíckrát: Si pre mňa všetkým, teba mám rád.",
      },
      {
        cisloS: "V3",
        textik:
          "Keď som skľúčený, dávaš odpustenie, keď som strápený, núkaš ovlaženie. Na moje hriechy nepozeráš, ale ma nesieš na ramenách.",
      },
      {
        cisloS: "V4",
        textik:
          "Žiadna pieseň tú krásu neobsiahne, ktorú sám v Božom Srdci ponúkaš mne. Cítim sa láskou pohladený, do tvojej krásy ponorený.",
      },
      {
        cisloS: "V5",
        textik:
          "Ježiš môj, s tebou vchádza radostný čas, svojou prítomnosťou vždy zaplavíš nás. Ja týmto chvíľam neodolám a plný lásky mocne volám:",
      },
      {
        cisloS: "V6",
        textik:
          "V tebe, Pán môj, som šťastný nekonečne, si mi slnkom, čo v lúčoch vie byť večné. Zažiar mi v tmách, môj Milovaný, nech môžem kráčať do nových dní.",
      },
    ],
  },

  {
    cisloP: "246",
    nazov: "Posvätný raj",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D]Posvätný raj, zem [A]nádherná več[]hminá,\nmesto [G]miest, kde [emi]smieme bývať s [A4]ním.\n[A]Baránkov [D]kraj, v ňom [A]víta nás Boh [hmi]sám, \nnebo [G]krásne, Jeruzal[D]em.",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Baránok [G]sám je v ňom pochodňou[D/Fis], \ntam slnko [emi]svietiť viac nemusí[A4]. \n[A]A žiadnu [G]vládu noc nemá.[D/Fis] \nNáš Boh je [emi]ten, kto v ňom žiari [A]sám.",
      },
      {
        cisloS: "V2",
        textik:
          "V ňom máme príbytok spolu s ním. On zotrieť nám každú slzu vie. Tam nie je plač a trápenie, veď starý svet už v ňom neplatí.",
      },
      {
        cisloS: "V3",
        textik:
          "Na spásu hľaď, veď zrieť sa už dá. Kráľovstvo Kráľa nás preniká. Nech radosť má, kto raj pozná, lebo dal Pán do sŕdc nebo nám.",
      },
    ],
  },

  {
    cisloP: "247",
    nazov: "Spásou si mojou",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "[F]Spásou si [ami]mojou, [dmi]Ježiš, môj [C]Kráľ. \n[F]K tebe sa [ami]modlím a k [dmi]tebe volám[gmi].\n[C]Pane [F]môj, pieseň ti [B]hrám, \nkaždým dňom, no[F/A]cou stále teba hľadám.[C]",
      },
      {
        cisloS: "V2",
        textik:
          "[F]Ku mne príď, [ami]ty ma chráň[dmi], \ntvoje slová[B] dnes mi [gmi]do srdca vpíš.\n[C]Daj nech [F]tvoj [ami]Duch Svätý \n[dmi]ma premení[B] a [gmi]život mi dá.",
      },
      {
        cisloS: "V3",
        textik:
          "[C]Ježiš môj [B]Kráľ, ty si ma [F/A]spasil, teba mám rád.[gmi][C7] \nJežiš môj [B]Kráľ, ty si ma [F]spasil, teba mám rád.[gmi][F]",
      },
    ],
  },

  {
    cisloP: "248",
    nazov: " Tou láskou ako Otec môj",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Tou [C]láskou [G]ako Otec [ami]môj,\nja [F]milujem [dmi]všetkých [G]vás. \n/: [G]Zachovajte [ami]lás[emi]ku, zachovajte [F]lás[C]ku! \n[F]Zostaňte vo mne, [C/E]ako som ja v ňom, \n[dmi]buďte v mojej [F/G][G]láske! :/",
      },
      {
        cisloS: "V1",
        textik:
          "[ami]Ja som ten vinič z Božích [emi]záhrad, \nOtec [F]môj je vinohradník v [G]nich. \n[emi]Každého, kto ostal vo mne [ami]rásť, \nOtec [F]ošetrí a v[dmi]zrastom požehná[G].",
      },
      {
        cisloS: "V2",
        textik:
          "Ratolesť bez viniča vädne, nikdy svieže plody nerodí. Márne hľadá zmysel svojich dní, kto sa rozhodol svoj život žiť len sám.",
      },
      {
        cisloS: "V3",
        textik:
          "Ak vo vás moje slovo vzklíči a vy stále zotrváte v ňom, potom Otec všetko splní vám, v ťažkých námahách on odmenou je sám.",
      },
      {
        cisloS: "V4",
        textik:
          "Navzájom milujte sa bratsky, takou láskou, akú ja mám k vám. Tento zákon lásky dávam vám, aby vaša radosť bola úplná.",
      },
      {
        cisloS: "V5",
        textik:
          "Vyberám si teba pre svoj plán, nech je láska dar pre celú zem. Lebo väčšej lásky svet nemá, ako keď svoj život za priateľov dáš.",
      },
    ],
  },

  {
    cisloP: "401",
    nazov: "Duch pravdy príď k nám",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "[F]Prosím, Duch Svätý príď[C]k nám, \nsvoje [d]deti láskou [F/A]chráň, \nDuchu [B]Svätý, ty [F]zažni oheň [C]v nás. \nVojdi [F]k nám a svieť, keď [C]v tmách \n[g/B]srdce [A]blúdi, nevie kam [d], \nDuchu [B]Svätý, dnes [F]premeň život[C]náš. ",
      },
      {
        cisloS: "R",
        textik:
          "Duch pravdy, príď [F]k nám \n[C/E]-a v srdci nám [d]svieť, \n[dmi/C]nech radosť, [B]láska, \n[F/A]tvoj oheň horí [C]v nás. \nTy, pravdivý [F]lúč, \n[C/E]-presvieť každý [d]kút, \n[d]ty, oheň [B]lásky, čo [C]zapáli [F4]nás. [F] ",
      },
      {
        cisloS: "V2",
        textik:
          "Čo je strápené, to kries, čo je zlámané, to lieč, Duchu Svätý, ty zažni oheň v nás. Znova svoj pokoj daj nám, svoju svätosť v nás ochráň, Duchu Svätý, dnes premeň život náš.",
      },
      {
        cisloS: "B",
        textik:
          "[F]Veni [C]Sancte [d]Spiri[B]tus, \n[F/C]veni [C4]Sancte [C7]Spiri[F]tus.",
      },
      {
        cisloS: "V3",
        textik:
          "Daj, nech láska miesto má, pravde zostáva verná, Duchu Svätý, ty zažni oheň v nás. Tvoje svetlo dvíha nás, smieme slobodne zas rásť, Duchu Svätý, dnes premeň život náš.",
      },
    ],
  },

  {
    cisloP: "402",
    nazov: "Duch Svätý Otcom nám daný",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Duch Svätý, Otcom [C]nám daný, \nsi [F]ohňom v nás, buď [C4]víta[A7]ný. \n[d]Túžiš v nás stavať [a]chrám svätý, \n[B]my svoje [d]srdcia [A]dáme [d]ti.",
      },
      {
        cisloS: "V1",
        textik:
          "[F]Zrodení z lásky [C4]Páno[C]vej \n[d]synovia svet[g6]la, [A4]soľ pre [A]zem,\n[B]chránený kvas, čo [C]rozmno[d]ží \n[g]lásku pre svet [g/C]i pre [C4]nás[C].",
      },
      {
        cisloS: "V2",
        textik:
          "Na obraz svoj nás Boh stvoril, milovať smieme, on je v nás. Veď jeho tvár sa zrkadlí v tých, čo lásku spoznajú.",
      },
      {
        cisloS: "V3",
        textik:
          "Tí, v ktorých vládne Duch Svätý, nemajú strach, sú chránení. Otec ich láskou vyzbrojil Božiu nádej hlásajú.",
      },
      {
        cisloS: "V4",
        textik:
          "Nemajme strach byť v ňom svätí, Ježiš prichádza v ústrety. Otvorme brány, vchádza k nám, on je svetlo svieti nám.",
      },
      {
        cisloS: "V5",
        textik:
          "Pred nami kráča Mária, Matka Božia i nás, ľudí. Počujme hlas, čo Pán vraví, cez Máriu vedie nás.",
      },
    ],
  },

  {
    cisloP: "403",
    nazov: "Duch Svätý, vojdi do našich sŕdc",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[D]Duch Svätý, [A]vojdi \n[h]do našich [fis]sŕdc, \n[G]láskou [D/Fis]zažni \n[e]knôt [(D)]našich [A]sviec,\n[fis]lúče [h]sln[(e)]ka \n[Fis4]ob[Fis]ráť [h]k nám. \n[G]Veni [fis]Sanc[(h)]te [G]Spi[A]ri[D]tus!",
      },
      {
        cisloS: "V2",
        textik:
          "Vojdi, ty, Otče ponížených, Darca darov sľúbených, ohňom lásky rozpáľ nás. Veni Sancte Spiritus!",
      },
      {
        cisloS: "V3",
        textik:
          "Najlepší Tešiteľ, zdroj všetkých krás, príď a dýchaj nám do duší, vzácnym vánkom osviež nás. Veni Sancte Spiritus!",
      },
      {
        cisloS: "V4",
        textik:
          "Pri ťažkej práci si poľahčenie, v každej súši nás ovlažíš, chlieb rodí sa z horkých sĺz. Veni Sancte Spiritus!",
      },
      {
        cisloS: "V5",
        textik:
          "Jas Božej radosti zažiari z nás, nádejou keď nás naplníš, múdrosť Pána ty nám dáš. Veni Sancte Spiritus!",
      },
      {
        cisloS: "V6",
        textik:
          "Škvŕn našich duší si očistenie, v súžení nás rád pohladíš, s útechou dnes objím nás. Veni Sancte Spiritus!",
      },
      {
        cisloS: "V7",
        textik:
          "Skrytý vo vánku blížiš sa k nám, tíško vchádza dych tvojich úst, krajšiu vôňu nepoznám. Veni Sancte Spiritus! Amen.",
      },
    ],
  },

  {
    cisloP: "404",
    nazov: "K prameňom nás priveď",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[B]K prame[A7]ňom [d]nás priveď, \n[C]nauč [C7]nás [F]žiť, \n[B]Duch Svä[A7]tý, [d]príď, prosím, \n[g]Duch Svä[C7]tý, [F]príď! ",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Zavej tichým [B]vánkom, \n[C7]prenikni do [F]sŕdc, \n[d]príď a [a]obnov [B]nás, \nnech [G]oži[C4]je[C]me.\n[d]Zavej tichým [B]vánkom, \n[C7]pozdvihni si [F]nás, \n[g]daj,[A7] nech [d]zahorí \n[g]každý [gmi7/C]z nás            [C].",
      },
      {
        cisloS: "V2",
        textik:
          "Z hrobov vyveď nás, nový život daj, obnov našu nádej v Boží život. K sebe priviň nás, vyučuj a bráň, láskou obdaruj všetkých nás. ",
      },
      {
        cisloS: "V3",
        textik:
          "Príď a prenes nás na vrch posvätný, v tvojich rukách len sa povznesieme. Príď a prenes nás, nech sa rozodní, v náruč velebnú prijmi nás.",
      },
    ],
  },

  {
    cisloP: "405",
    nazov: "Oslávený, buď ty, Duch",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[F]Osláve[B]ný, \n[F]buď ty, Duch, kto[C7]rý máš \n[d]oheň, čo [B]nás spá[C]ja. \n[F]Spievam a [B]hrám, \n[d]nech celý vesmír [a7]vie, \nže si [B]Pán. [C7]Alelu[F]ja.",
      },
      {
        cisloS: "V1",
        textik:
          "Duch Svä[F]tý, \nroznieť [B]posvätné [C]ohne \npre [d]nás za[B]pále[C]né. \nSlužob[d]níka [F]neobíď, [B]prosím ťa, \n[a7]vojdi, srdce [B]mám [C7]priprave[F]né.",
      },
      {
        cisloS: "V2",
        textik:
          "Duch Svätý, odhaľ tajomstvo Otcovej lásky nám dané. Bože príď a uzdravuj zranené, vojdi, srdce mám pripravené.",
      },
      {
        cisloS: "V3",
        textik:
          "Duch Svätý, príď a rozviaž v nás to, čo je hriechom spútané. Naprav k láske chodníky zblúdené, vojdi, srdce mám pripravené.",
      },
      {
        cisloS: "V4",
        textik:
          "Duch Svätý, vezmi môj život \ndo svojich rúk a sám ho chráň. Novú pieseň zaspievam, v náručí tvojom zaplesám, srdce ti dám.",
      },
    ],
  },

  {
    cisloP: "406",
    nazov: "Príď, do srdca nám sa vlej",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Príď, do srdca [g]nám sa [C7]vlej, \nDuch [F]lás[A7]ky. \n[d]Príď, nech do nás [g]prúdi \n[C]po[a7]koj [d]tvoj.",
      },
      {
        cisloS: "V1",
        textik:
          "[g7]Príď a Božiu [C7]lásku \n[F]vlej do [A]nás, \n[d]príď, rozpaľuj [C]túžbou \n[F]za [A7]te[d]bou.",
      },
      {
        cisloS: "V2",
        textik:
          "Príď, zdroj Božej lásky, príď a lieč, daj radostnú nádej všetkým nám.",
      },
      {
        cisloS: "V3",
        textik:
          "Príď a obnov vieru, lásku nám, sám sprevádzaj nás vždy na cestách.",
      },
    ],
  },

  {
    cisloP: "407",
    nazov: "Príď, Duch Svätý, vojdi do našich sŕdc",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[A]Príď, Duch Svätý, \n[G/A]vojdi do našich sŕdc, \n[D/A]príď, ó, Duch Svätý, [A]príď! \n[A]Príď, Duch Svätý, \n[G]príď a obnoviť ráč \n[D]tvárnosť zeme [A]láskou!",
      },
      {
        cisloS: "V1",
        textik:
          "Duchu [A]Svätý, spájaj [G]nás, \nDuchu [D]Svätý, vyučuj [A]nás. \nTy si múdrosť, prihovor sa [G]nám. \nDuchu, [D]príď a zažni oheň [A]v nás.",
      },
      {
        cisloS: "V2",
        textik:
          "Duchu Svätý, k nám dnes príď, Duchu Svätý, posilňuj nás. Ty si láska, oheň, pravdy zdroj, radosť dáš, čo nikdy nekončí.",
      },
    ],
  },

  {
    cisloP: "408",
    nazov: "Príď, Duchu Svätý, ako oheň",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Príď, Duchu Svä[A]tý, \n[C]ako oheň [a]na ce[D4]lú [D]Zem. \n[G]Príď, Duchu Svä[A]tý, \n[C]príď a [D]naplň [e]nás.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Lásku daruj [D]nám, \nnech [a]viera život [F]má, \ntak [e]príď a [fis7]ohňom zapáľ [H4]nás[H]!",
      },
      {
        cisloS: "V2",
        textik:
          "Pravdou obnov nás a Syna nám ukáž, tak príď a ohňom zapáľ nás!",
      },
      {
        cisloS: "V3",
        textik:
          "Silu daruj nám, do sveta pošli nás, tak príď a ohňom zapáľ nás!",
      },
      {
        cisloS: "V4",
        textik:
          "Príď a pomôž nám žiť život slobodný, nech pozná svet: Kristus žije v nás!",
      },
    ],
  },

  {
    cisloP: "409",
    nazov: "Príď, Duchu Svätý, príď, naplň nás",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Príď, Duchu [h]Svätý, \n[e]príď, naplň [D]nás, \n[G]príď, Duchu [D]Svätý, \n[e]Ute[h]šiteľ [e]náš.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Príď, Duchu Svätý [D]tvorivý, \npríď svojich [D7]verných [G]navštíviť.\nNaplň nám srdcia [D]milosťou, \n[e]ktoré si [C]stvoril [D]múdrosťou.",
      },
      {
        cisloS: "V2",
        textik:
          "Tešiteľom si nazvaný, dar Boží z neba nám daný, zdroj živý, láska, oheň v nej i pomazanie duchovné.",
      },
      {
        cisloS: "V3",
        textik:
          "Ty, darca darov sedmorých, prst Boží v dielach stvorených, ty, prisľúbenie Otcovo, dávaš reč, slovo Pánovo.",
      },
      {
        cisloS: "V4",
        textik:
          "Osvieť nás, ducha posilňuj, do sŕdc vlej lásku ohnivú. Keď telo klesá v slabosti, vzpriamuj ho silou milosti.",
      },
      {
        cisloS: "V5",
        textik:
          "Pred nepriateľom ochráň nás, svoj pokoj daj nám v každý čas. Nech vždy pod tvojím vedením vyhneme vplyvom škodlivým.",
      },
      {
        cisloS: "V6",
        textik:
          "Nauč nás Otca poznávať a jeho Syna milovať. A v teba, Ducha obidvoch, daj veriť vždy, vo všetkých dňoch.",
      },
    ],
  },

  {
    cisloP: "410",
    nazov: "Príď, Duchu Svätý, Tešiteľ",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Zjav [a]pravdu [G]nám a [F]stále [C]svieť, \nvlej [a]lásku [G]do našich [F]sŕdc. \n[E]Keď [a]príde [G]pád, ty [F]dvíhaj [C]nás, \n[F]príď, [G]uzdravuj [A]nás. \nTak [F]príď, Duchu [G]Svätý, [C]príď!",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Príď, Duchu [C4]Svätý, \n[C]príď, Tešiteľ [B]náš! \n[C]Príď, Duchu [C4]Svätý, \nskúmaj [D]nás, pretvor [G]nás.",
      },
      {
        cisloS: "V2",
        textik:
          "Príď, Duchu Svätý, príď, sprevádzaj nás! Príď, Duchu Svätý, keď sme v tmách, zažiar nám.",
      },
      {
        cisloS: "V3",
        textik:
          "Príď, Duchu Svätý, lásku rozmnožuj v nás! Príď, Duchu Svätý, plameň tvoj zapáľ v nás.",
      },
    ],
  },

  {
    cisloP: "411",
    nazov: "Príď, Duchu Svätý, zjav sa nám",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Príď, Duchu [C]Svätý, [h]zjav sa nám,\n[C]príď, Duchu Svätý, [G]lásky prúd.\n[e]Príď, Duchu [C]Svätý, [h]skloň sa [e]k nám,\n[a]vstúp do na[h]šich [e]sŕdc.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Ó, Duch Bo[h]ží, Otcom nám zosla[D]ný,\nty, [e]učiteľu [C]náš, ty [a]pravdy [D]lúč,\n[G]prosíme, [e]príď, [a]láskou [e]pre[a]meň [H]nás.",
      },
      {
        cisloS: "V2",
        textik:
          "Tvoj živý prúd vody nás uzdraví, ty, lekár nebeský a radca náš, rozpáľ a príď vieru pozdvihnúť.",
      },
      {
        cisloS: "V3",
        textik:
          "Daj, nech sa nádej aj v nás rozhorí, a zaplav naše vnútro plesaním. Pretváraj nás, nádej obnov v nás.",
      },
    ],
  },

  {
    cisloP: "412",
    nazov: "Príď k nám, Duch Svätý",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Príď k nám, Duch Svä[a]tý, \n[D]ty, ktorý napĺňaš ves[H4]mír[H],\n[e]príď ako Pán, vojdi [C]do našich sŕdc, \n[a]poznať daj sa [H4]nám. [H]\n[e]Príď k nám, Duch Svä[a]tý, \n[D]ty, ktorý napĺňaš ves[H4]mír[H],\n[e]daj, nech z [C]Božích polí \n [a]radostný spev [H7]zahlaho[e]lí.",
      },
      {
        cisloS: "V1",
        textik:
          "[e]Oheň Boží, \nvánok [C]z presvätých úst,\nty, [a]darca náde[H7]jí,\n[e]svojou mocou \nzbav ma [C]únavných pút,\n[a]hneď sa pristro[H7]jím.",
      },
      {
        cisloS: "V2",
        textik:
          "Viem, že poznáš pravdy aj tajomstvá, tak pomôž cestu nájsť, vyučuj nás láske, ujmi sa nás, príď a stoj pri nás.",
      },
      {
        cisloS: "V3",
        textik:
          "Silou, nehou, láskou, darom Božím len ty nás zahalíš. Otec slabých, Duch môj, Utešiteľ, vstúp do našich tiel.",
      },
    ],
  },

  {
    cisloP: "413",
    nazov: "Príď ku nám, ó, Duch Svätý",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[g]Príď ku nám, ó, [g]Duch Svä[d]tý, \n[g]príď, buď svetlom pre [F]náš svet, \n[B]príď a dvíhaj [F]nás, \n[d]príď, plameň svä[g]tý.",
      },
      {
        cisloS: "V1",
        textik:
          "[g]Príď [d]Zástanca [g]dávny, \n[d]príď nás o[g]brániť, \n[F]zrak túžobne [B]dvíham, \n[F]vstúp [g]dnes, [d]môj [g]Pán.",
      },
      {
        cisloS: "V2",
        textik:
          "Príď, ty prameň lásky, nápoj si vzácny. Prúd liečivej rieky, vlej lásku nám.",
      },
      {
        cisloS: "V3",
        textik:
          "Príď, Tešiteľ vzácny, vstúp k nám do chrámu. V nás rozdúchaj túžbu ísť k výšinám.",
      },
      {
        cisloS: "V4",
        textik:
          "Príď, Učiteľ slávny, daj nám dar viery. S ňou môžeme spúšťať siete na lov.",
      },
    ],
  },

  {
    cisloP: "414",
    nazov: "Príď, Svätý Duch",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[h]Príď, Svätý Duch, \nja ti [A]srdce otvo[D]rím. \n[G]Vojdi, ty [D]Posvätiteľ [e7]sláv[Fis]ny. \n[h]Príď, svätý Duch, \nnežný [A]Utešiteľ [D]môj. \n[G]Naplň moje [D]srdce tvojou [e]ra[Fis]dos[h]ťou.",
      },
      {
        cisloS: "V1",
        textik:
          "[h]V skľúčených srdciach [fis]vládni, \n[G]z nás malých radosť [D]máš. \n[D]Duch Svätý, oheň [e]lásky, \n[h]múdros[G]ťou pretvor [Fis4]nás[Fis]. \n[h]Príď, uzdrav bolesť [fis]vnútra, \n[G]následky ťažkých [D]rán. \n[D]Múr, čo nás delí, [e]zbúraj, \n[e]raj Boží otvor [Fis4]nám[Fis].",
      },
      {
        cisloS: "V2",
        textik:
          "Dar v tebe Otec sľúbil, krásu daj vidieť nám. Zjednotil si nás láskou, dnes tvoj krst mení nás. V mystickom tele spájaš tých, čo chcú s Kristom ísť. Pred tebou kľačím s túžbou: Duch Svätý, s ohňom príď!",
      },
      {
        cisloS: "V3",
        textik:
          "Zmeň skleslý pohľad smútku, nech radosť horí v nás, svet zbadá na nás hĺbku, tá mení život náš. Sám otváraj nám vnútro, dávaním sa dá rásť, Duch, pomáhaj nech smieme hľadaním teba nájsť. ",
      },
    ],
  },

  {
    cisloP: "415",
    nazov: "Spolu s Máriou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[G]Príď, Duchu Bo[D4]ží[D], \n[e]ó, [h]príď, ty, [G]Boh, tak než[A4]ný[A]. \n[D/Fis]Oheň, čo [G]tlie, rozpaľuj [D4]v nás[D], \n[e]ó, [h]príď a [G]ty miluj [A4]v nás[A].",
      },
      {
        cisloS: "V1",
        textik:
          "[D]Spolu s Mári[D9/Fis]ou \n[G]k nebu oči [D]dví[A/Cis]ham, \n[h7]večeradlo [G9]túžbou ho[A4]rí[A]. \n[D]Pane, rozžiar [D9/Fis]nás \n[G]jasom svojej [D]lás[A/Cis]ky, \n[h7]svetlom viery [G9]svieť, \nkeď sme [A4]v tmách[A].",
      },
      {
        cisloS: "V2",
        textik:
          "Otvor dokorán naše skleslé srdcia, prosím, znovu príď, objať nás. Dotyk tvojich úst otvorí nám ústa, hlásať chceme vždy: 'Ty si Pán!' ",
      },
      {
        cisloS: "V3",
        textik:
          "Vlej do našich sŕdc pravú bratskú lásku, nemeškaj a príď, zjednoť nás. Si vždy prítomný v našej skromnej chvále. Príď a obnov nás radosťou.",
      },
    ],
  },

  {
    cisloP: "416",
    nazov: "Túžime po tebe, Duchu Svätý",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[F]Túžime po tebe, [B]Duchu Svä[F]tý, \n[g]príď, len príď a [d]konaj [A]v nás, \n[g]posilňuj slabých a [B]ovlažuj [C]tých, \nčo [d]púšťou [a]kráča[d]jú.",
      },
      {
        cisloS: "V2",
        textik:
          "Vlahou si v púšti a svetlom si v  tmách, príď, len príď a pomôž nám prekonať úzkosti, temno i strach na ceste k výšinám.",
      },
      {
        cisloS: "V3",
        textik:
          "Bez teba, Duch Boží, prázdno je v nás, príď, len príď a naplň nás. Tvoj oheň vdýchni do zamdlených sŕdc, nech rozhoria sa zas.",
      },
      {
        cisloS: "V4",
        textik:
          "S dôverou voláme unavení, príď, len príď a pomôž nám rozpoznať, čo plameň Ducha hasí, čo pravda je, čo klam.",
      },
      {
        cisloS: "V5",
        textik:
          "Zostúp k nám tak, ako k apoštolom, príď, len príď a zapáľ nás, aby sme vstali a šli s odvahou. Ty svedčiť nás voláš.",
      },
      {
        cisloS: "V6",
        textik:
          "S Otcom i Synom si jediný Pán, príď, len príď a svoj ľud veď. Nech ti je oddaný, ochotný ísť a vôľu Otca žiť.",
      },
    ],
  },

  {
    cisloP: "417",
    nazov: "Veni Sancte Spiritus",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[E]Veni [cis]Sancte [fis7]Spiri[H]tus, \n[E]veni [cis]Sancte [fis7]Spiri[H]tus.\n[E]Veni [cis]Sancte [fis7]Spiri[H]tus, \n[E]veni [A]Sanc[fis7]te [H]Spiri[E]tus.",
      },
      {
        cisloS: "V1",
        textik:
          "[fis]Duch Boží, Duch [fis7]láskavý, \nty, [H4]oheň žiari[H]vý,\n[fis]príď a [fis7]jasným svetlom [H4]svieť[H]. \n[gis]Príď ku nám a [gis7]vlievaj nádej, \n[cis]ona oživí\n[fis]vieru, [fis7]ktorá musí [H4]vrieť[H].",
      },
      {
        cisloS: "V2",
        textik:
          "Príď ku nám nech obnoví sa v našich srdciach mier, príď a milosťou ži v nás. Príď ku nám, nech stále zneje chvála z našich pier, spieva duša slobodná.",
      },
      {
        cisloS: "V3",
        textik:
          "Príď ku nám, vo veľkej láske zjav Otcovu tvár,\npríď, nech srdce zahorí. Otvor náruč, nádenníkov svojich obdaruj, láska Cirkev obnoví.",
      },
    ],
  },

  {
    cisloP: "418",
    nazov: "Duchu Svätý, príď z neba (Ako víchor)",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Ako víchor, čo vládu má, ako dážď mocný, príď! Ako búrka nespútaná, ó, Duchu Boží, prebývaj v nás.",
      },
      {
        cisloS: "V1",
        textik:
          "Duchu Svätý, príď z neba a vyšli nám zo seba žiaru svetla pravého.",
      },
      {
        cisloS: "V2",
        textik:
          "Príď k nám Otče chudobných, Darca darov sľúbených, svetlo srdca bôľneho.",
      },
      {
        cisloS: "V3",
        textik:
          "Tešiteľ si najlepší, ó, hosť duše najsladší, ty, sladké občerstvenie.",
      },
      {
        cisloS: "V4",
        textik:
          "V práci si poľahčenie, v sparne si ovlaženie, v plači si potešenie.",
      },
      {
        cisloS: "V5",
        textik: "Svetlo oblažujúce, naplň myseľ i srdce ľudu tebe verného.",
      },
      {
        cisloS: "V6",
        textik:
          "Bez pomocnej milosti, človek žije v hriešnosti, nie je v ňom nič dobrého.",
      },
      {
        cisloS: "V7",
        textik:
          "Očisť čo je skalené, zavlaž, čo je znavené, uzdrav, čo je zranené.",
      },
      {
        cisloS: "V8",
        textik:
          "Ohni, čo je stŕpnuté, zohrej, čo je skrehnuté, naprav, čo je zblúdené.",
      },
      {
        cisloS: "V9",
        textik:
          "Daruj svojim veriacim, s dôverou ťa prosiacim, svätú milosť sedmorú.",
      },
      {
        cisloS: "V10",
        textik:
          "Daj za čnosti odmenu, daj smrť dobrú, blaženú, daj nám radosť trvalú.",
      },
    ],
  },

  {
    cisloP: "501",
    nazov: "Ave Maria, gratia plena",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[D-A/Cis]A[h-D/A]ve Ma[G-h/Fis]ri[e7-A]a, \n[D]gra[A/Cis]tia [h]ple[D/A]na, \n[G]Do[e7]minus [A]tecum. \n[G]Benedicta [D]tu in [fis]muli[e]eri[A]bus, \net [G]bene[A/Cis]dictus [D]fructus \n[e]ventris [A]tui, [D4]Je[D]sus.",
      },
      {
        cisloS: "V2",
        textik:
          "[D]Sancta Ma[fis]ria, \n[G]Ma[A/G]ter [D4]De[D]i, \n[G]ora pro [D]nobis [e7]pecca[D]tori[A4]bus[A] \n[G]nunc et in [D/A]hora \nmortis [A4-A]no[D]strae. \n[D-A/Cis]A[hmi - D/A]ve Ma[A4-A]ri [D4-D]a.",
      },
    ],
  },

  {
    cisloP: "502",
    nazov: "Ave, Mária, skláňaš sa k nám",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[D–A/D]Ave, [D]Mári[A]a, \n[h]sklá[fis]ňaš sa [h4]k nám[h], \n[G]naše [A]modlit[e]by [h]prenes \n[G]pred [D]Bo[A]žiu [D]tvár.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Tys’ naša [fis]Mat[h]ka, \n[G]za ruku [A]nás [D]veď, \n[G]zaodetá [fis]slá[h]vou \n[E4]na ces[E]tu nám [A]svieť.",
      },
      {
        cisloS: "V2",
        textik: "Milosti plná, dcéra sionská, vyvolená Otcom, Matka nebeská!",
      },
      {
        cisloS: "V3",
        textik:
          "Ty, Archa zmluvy, vieru živú máš, pomôž, aby Ježiš narodil sa v nás.",
      },
      {
        cisloS: "V4",
        textik:
          "Ty, naša nádej, stále si nás chráň, vyučuj nás láske, so Synom nás spoj.",
      },
      {
        cisloS: "V5",
        textik:
          "Presvätá Matka, biednych zastávaš, k Otcovi nás láskou svojou privádzaš.",
      },
    ],
  },

  {
    cisloP: "503",
    nazov: "Buď pozdravená",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Buď pozdrave[a]ná, \nty, [h]Pani presvä[G]tá[h], \n[e]tysʼ korunou [C]hviezd, \ncelá [a]slnkom ode[D]tá. \n[G]Ku tvojim no[e]hám \nsi [a]mesiac sklonil [D]tvár, \n[D7]ty [H7]v lone svojom [e]máš \nten [a]dar, čo [h]Boh dal [e]nám.",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Odveká radosť [D4]Pá[D]na, \n[e]tysʼ novou Evou [h]nám,\n[C]z rúk tvojich ku nám [G/H]vstáva \n[a]Syn Boží, tvoj [D4]Pán[D].\n[G]On otvára nám [D]brány, \n[e]môžeš nás domov [h]viesť,\n[C]slávna hviezda [(H7)]ran[e]ná, \nchcem[a]s tebou [h7]cestu [e]prejsť.",
      },
      {
        cisloS: "V2",
        textik:
          "Dnes zostávaš pod krížom, tam ťa vídame stáť, nám nesieš novú nádej, Matka, chráň v nás chrám. Viem, držíš v rukách žriedlo, v ňom živá voda vrie, vyliata svätá krv, čo spásu prinesie.",
      },
      {
        cisloS: "V3",
        textik:
          "Aj prvá Eva vstáva, úžasnú radosť má, veď to jej svätá dcéra je oslávená. Ó, aká radosť vládne, Panna Mária, v nás, keď necháme sa viesť ku nebeským dverám.",
      },
      {
        cisloS: "V4",
        textik:
          "Ó, svätá Matka, Pán ťa chcel nepoškvrnenú, on ťa vzal tam, ku trónu, s telom aj dušou. Tys` vyzdvihnutá v sláve, presvätá Kráľovná, snáď privítaš aj nás, tam, kde prebýva Pán.",
      },
    ],
  },

  {
    cisloP: "504",
    nazov: "Dnes prijímam ťa rád, ó, Mária",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[B]Mári[F]a, [C7]Kráľovná pokor[F]ná, \n[B]Mári[F]a, [C7]cez teba prišiel [F]Pán.",
      },
      {
        cisloS: "V1",
        textik:
          "Dnes [F]prijímam ťa [A7]rád, ó, [B]Mári[F]a, \nmne [F]vzácna si, [C7]Matka pokor[F]ná. \n[F7]Sám [B]Boh teba [C]láskou [F]na[C]pl[d]nil \na [g]vstúpil [C9]k nám náš [F]Pán.",
      },
      {
        cisloS: "V2",
        textik:
          "Dnes prijímam ťa rád, ó, Mária, veď Pán si ťa zo žien vyvolil. On - Kráľ svätý, plod tvojho života; ty Panna presvätá.",
      },
      {
        cisloS: "V3",
        textik:
          "Dnes prijímam ťa rád, ó, Mária, veď dal mi ťa Vykupiteľ môj. Ja som dnes ten Ján, tam pod krížom, a vzácnu matku mám.",
      },
    ],
  },

  {
    cisloP: "505",
    nazov: "Kráľovná nebeská",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[A]Kráľovná [D]nebeská, \n[A]Matka ľu[E/Gis]dí, \n[fis]niesla si [D]toho, čo [h]povznáša [E]nás, \n[A]ak už nás [D]jeho hlas [A]nezobu[E/Gis]dí, \n[fis]pros za [h]nás, Mári[E]a, pros za [A]nás.",
      },
      {
        cisloS: "V1",
        textik:
          "[A]'Boh vy[D]bral ťa [E]spomedzi [A]žien,' \n[h]anjel hovo[E]rí, \n[A]'z teba [D]vzíde [E]Knieža a [fis]Pán, \n[D]ak mu [h]otvo[E]ríš.'",
      },
      {
        cisloS: "V2",
        textik:
          "Nám pod krížom darovaná, Matka presvätá, ty nás môžeš za ruku viesť, svetlom odetá.",
      },
      {
        cisloS: "V3",
        textik:
          "Božou láskou naplnená, silou pokorných, spomeň tam aj naše mená v sieňach nebeských.",
      },
    ],
  },

  {
    cisloP: "506",
    nazov: "Mária, Panna pokorná",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[d]Mária, [g]Panna pokor[d]ná, \n[g]ty si poro[d]dila [g7]Ježiša [A]nám,\n[d]Mária [g]blahoslave[d]ná, \n[g]Matka, pro[d]síme, po[A]môž [d]nám.",
      },
      {
        cisloS: "V1",
        textik:
          "[d]Mária, v prítomnosti \ncelého nebeského [C]dvora \nvolíme si ťa [F]dnes \nza svoju Matku a [g]Krá[A7]ľov[d]nú.",
      },
      {
        cisloS: "V2",
        textik:
          "[d]V úplnej podriadenosti a láske \nzverujeme a zasväcujeme [C]ti \n[C]svoje telo a dušu, \nsvoje vonkajšie i vnútorné [F]dary, \n[F]ako aj hodnotu svojich \nminulých, terajších \ni bu[g]dúcich [A7]dobrých [d]skutkov.",
      },
      {
        cisloS: "V3",
        textik:
          "[d]Nechávame ti úplné právo \ndisponovať [C]nami \n[C]a všetkým, čo nám patrí bez výnimky \npodľa tvojej ľubo[F]vôle,\n[F]na väčšiu Božiu slávu \nteraz i [g]vo več[A7]nosti. [d]Amen.",
      },
    ],
  },

  {
    cisloP: "507",
    nazov: "Mária, vyvolená",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Mária, [G]vyvole[D]ná, \nMária, [h]požehna[e]ná,\n[e]Mária, [G]ujmi sa[D]nás, \nMária, [h]ochraňuj[e]nás,",
      },
      {
        cisloS: "V1",
        textik:
          "[G]Cez teba príde [D]Pán, \nty si [H7]prostrednicou [e]našou,\n[G]rád tebe [D]srdce o[a]tvo[H7]rím.",
      },
      {
        cisloS: "V2",
        textik:
          "Boh v tebe má svoj chrám, v tebe máme nový život, ľúbeznú vďaku tebe vzdám.",
      },
    ],
  },

  {
    cisloP: "508",
    nazov: "Ó, Mária",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Ó, [C]Mári[e7]a, \nskrze [F]'áno'[E7/9]prišiel [a]k nám \nBožej [Fmaj]lásky [e7]lúč, \naby [d]telom sa [C]stal, \n[Fmaj]Ježiš, náš [G4]Pán[G].",
      },
      {
        cisloS: "R1",
        textik:
          "Ó, Mária, modlitbami prepoj nás. Matka, nalaď nám srdcia na jednu niť. Duchu Svätý, príď!",
      },
      {
        cisloS: "V1",
        textik:
          "Vtedy [a]anjel niesol [e]správu tebe: \n[F]'Syn sa naro[C]dí, \nje to [As]Boh, ktorý \nsvoj [Es]ľud navštíviť [d7]prí[G]de. \nTeba [a]Duch Svätý za[e]tôni láskou, \n[F]tak neboj sa, [C]ver! \nNa zem [As]vchádza Boží [Es]Syn, \nEmanu[d7]el[G].'",
      },
      {
        cisloS: "V2",
        textik:
          "Matka, smieme láske znovu veriť, sľúbenej aj nám, ona vládu, moc má premôcť slabosť v nás. Toho dôkazom je láska, ktorá pretvoriť nás vie, lebo Božej moci všetko sa poddá.",
      },
      {
        cisloS: "V3",
        textik:
          "Pane, daj aj nám dnes tvojho Ducha podľa prísľubov, s tvojou drahou Matkou vrúcne ťa prosíme. Vezmi strach, ktorý dnes bráni ľuďom hlásať s odvahou to, že spása prišla, čaká, kto ju prijme.",
      },
      {
        cisloS: "V4",
        textik:
          "Moje vnútro v bázni tebe plesá, Boh a Pán verný, veď ty ľúbiš nás, my slúžime ti s láskou. Mocným zrútiš piedestály, ty sám dvíhaš strápených, neopustíš tých, čo milujú ťa s bázňou.",
      },
    ],
  },

  {
    cisloP: "509",
    nazov: "Ó, Matka nášho Pána",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Ó, [G]Matka nášho [h7]Pána, \n[C-a]Mári[D4]a[D], \nsi [G]najvzácnejším [h7]chrámom, \n[C]nesieš Boha [D4]nám[D]. \nCez [G]tvoje [D]áno \n[C]prišlo Svetlo [C/D]sve[D]ta. \n[a]Mária, [G]ty si radosť [D4]Pá[D]na, \nvždy [C]pros Boha [D4]Ot[D]ca za [G4]nás[G]!",
      },
      {
        cisloS: "V1",
        textik:
          "[C]Buď pozdrave[G/H]ná, \n[a]milosti [D4]pl[D]ná, \n[C]s tebou je tvoj [G/H]Pán, \nčo [C]zostupuje [D4]k nám[D]. \n[H/Dis]Nebesá žiaria, plesa[e]jú, \n[e/D]oroduj za [C]nás, \n[a]ty, Hviez[D]da ran[G4]ná[G].",
      },
      {
        cisloS: "V2",
        textik:
          "Buď pozdravená, ty, Archa zmluvy, pod tvojím srdcom sa Boh stal človekom. Emanuela dávaš nám, oroduj za nás, Brána nebeská.",
      },
      {
        cisloS: "V3",
        textik:
          "Buď pozdravená, ó, Pani naša, Ježiš, nebies Kráľ, bol tebou zrodený. Spása je darovaná nám, oroduj za nás, ty, milovaná.",
      },
      {
        cisloS: "V4",
        textik:
          "Buď pozdravená, Panna prečistá, Boh ti život dal a ty ho dávaš nám. Bránu otváraš do raja, oroduj za nás, Nepoškvrnená.",
      },
      {
        cisloS: "V5",
        textik:
          "Buď pozdravená, ty, nová Eva, ľudstvo zblúdené je znovuzrodené. Dala si Spasiteľa nám, oroduj za nás, nás, Nádej hriešnikov.",
      },
      {
        cisloS: "V6",
        textik:
          "Buď pozdravená, Panna pokorná, zaznej pieseň chvál, buď zvelebený Pán! Duchom Božím naplnená, oroduj za nás, ty, požehnaná.",
      },
      {
        cisloS: "V7",
        textik:
          "Buď pozdravená, Kráľovná naša, milovaný Syn ťa slávou zaodel. Sám Boh ťa prijal do nebies, oroduj za nás, Kráľovná svätých.",
      },
    ],
  },

  {
    cisloP: "510",
    nazov: "Totus tuus",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[g]Totus [d]tuus, Ma[Es - F]ri[B]a. \n[g]Gratia [d]plena, \n[C]Dominus [Es]te[F]cum. \n[B]Totus [F]tuus, \n[Des]ora pro [As]nobis, \nMa[c7]ri[F]a, Ma[c7]ri[F]a.",
      },
      { cisloS: "V1", textik: "" },
    ],
  },

  {
    cisloP: "511",
    nazov: "Veď nás, Mária",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[g]Veď nás, Mária, tam, \nkde [g]prebýva tvoj Pán. \n[F]S dôverou [d7]tvoj ľud \n[F]ku tebe vo[g]lá.",
      },
      {
        cisloS: "V1",
        textik:
          "[g]Spomeň si, svätá Panna Mária, \nže nikdy nebolo počuť, \nže by bol niekto opus[F]tený, \n[F]kto sa utiekal pod tvoju [d]ochranu, \nteba o pomoc alebo príhovor [g]žiadal.",
      },
      {
        cisloS: "V2",
        textik:
          "[g]Povzbudený touto dôverou \naj ja sa utiekam k tebe, \nMatka, Panna [F]panien, \n[F]k tebe prichádzam, pred tebou [d]stojím, \nako úbohý a kajúci [g]hriešnik.",
      },
      {
        cisloS: "V3",
        textik:
          "[g]Matka večného Slova, \nneodmietni moje [F]slová, \n[F]ale ma [d]vypočuj \na vyslyš. [g]Amen.",
      },
    ],
  },

  {
    cisloP: "512",
    nazov: "Zdravas buď, Mária",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[e]Zdravas buď, Mária, \n[h]milosti [e]plná, \nPán s tebou, [?]\nsi [D]požehna[G]ná [G]medzi [D]ženami, \n[e]požehna[h]ný je [e]plod tvojho [D]života, \n[C]Ježiš, [h]tvoj [e]Pán.",
      },
      {
        cisloS: "R1",
        textik:
          "[G]Svätá Mária, Matka Bo[D]žia, \n[e]pros za nás hriešnych tu, na ze[H]mi, \n[G]teraz i v hodinu smrti na[D]šej. \n[e]Amen, [D]amen, [C]ale[h]lu[e]ja.",
      },
    ],
  },

  {
    cisloP: "702",
    nazov: "Sviatosť tela tajomného",
    slohy: [
      {
        cisloS: "R",
        textik:
          "[Es]Je[F]žiš, [D/Fis]Je[g]žiš, \n[Es]klania[c7]me sa [F]te[B]be.",
      },
      {
        cisloS: "V1",
        textik:
          "[B]Sviatosť [F/A]tela [g7]tajom[Es]ného\nveleb, [g7/D]jazyk, [c7]vďačne [F]chváľ!\n[B]Veleb [F/A]predra[g7]hú krv [Es]jeho,\nktorú [g7/D]za nás [c7]vylie[D]va\n[g]on, plod [d/F]lona [c/Es]panen[g]ského,\n[Es]slávny, [c7]dobrý, [F]večný [B]Pán.",
      },
      {
        cisloS: "V2",
        textik:
          "Nám je daný, narodený z čistej Panny Boh a Kráľ, chodieval po tejto zemi, slovo pravdy rozsieval; deň pred svojím umučením zjavil, jak nás miloval.",
      },
      {
        cisloS: "V3",
        textik:
          "Keď si sadol večer k stolu, s učeníkmi večeral a baránka jedli spolu, jak zákon predpisoval; poslednú im zjavil vôľu: za pokrm sa všetkým dal.",
      },
      {
        cisloS: "V4",
        textik:
          "Slovo v tele slovu dáva moc chlieb v telo premeniť, z vína sa krv Krista stáva, akože to pochopiť? Čisté srdce viera pravá sama stačí presvedčiť.",
      },
      {
        cisloS: "V5",
        textik:
          "Ctime túto sviatosť slávnu, zbožne skloňme kolená, bohoslužbu starodávnu nahraď nová, vznešená; pomôž zmyslom, ktoré slabnú, viera s láskou spojená.",
      },
      {
        cisloS: "V6",
        textik:
          "Otcu, Synu jedinému chvála buď a plesanie, sláva, moc a česť ich menu, tak aj dobrorečenie; od obidvoch Poslanému rovnaké buď uctenie.",
      },
    ],
  },

  {
    cisloP: "703",
    nazov: "Zrel som tečúcu vodu",
    slohy: [
      { cisloS: "R", textik: "" },
      {
        cisloS: "V1",
        textik:
          "[g]Zrel som tečúcu [C]vodu, \nalelu[Es]ja, a[F]lelu[B]ja, \nprúdiť [g]z pravej strany [C]chrámu, \nalelu[Es]ja, a[F]lelu[g]ja.",
      },
      {
        cisloS: "V2",
        textik:
          "Zrel som prameň chrámu, aleluja, aleluja, ako rastie vo veľkú rieku, aleluja, aleluja.",
      },
      {
        cisloS: "V3",
        textik:
          "Tí, ktorých obmýva voda, aleluja, aleluja, budú chváliť tvoje meno, aleluja, aleluja.",
      },
      {
        cisloS: "V4",
        textik:
          "Tvoje srdce je prameň, aleluja, aleluja, odkiaľ prúdia pramene živé, aleluja, aleluja,",
      },
    ],
  },

  {
    cisloP: "704",
    nazov: "Hľa, v zástupoch prichádzajú",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Hľa, v zástupoch prichádzajú ku Kráľovi pred jeho trón všetci svätí, sväté, lebo zvíťazil nad smrťou Baránok náš.",
      },
      {
        cisloS: "V1",
        textik:
          "Ja zrel som najvyšší trón a na tróne Kráľa slávy. Spása, moc je v ňom, všade vôkol stúpa chvála: 'Svätý, svätý, svätý náš Pán!'",
      },
      {
        cisloS: "V2",
        textik:
          "Ja zrel som, ako Boh Syn živý kráča sieňou slávy. Víťazom je Pán, iba v ňom sa núka spása. 'Svätý, svätý, svätý náš Pán!'",
      },
      {
        cisloS: "V3",
        textik:
          "Ja zrel som Otcov dar nám, je to láska, Duch Svätý. On sa dáva nám, iba v ňom sme synmi Kráľa. 'Svätý, svätý, svätý náš Pán!'",
      },
    ],
  },

  {
    cisloP: "901",
    nazov: "Modlitba zasvätenia",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "Mária, v prítomnosti celého nebeského dvora, volíme si ťa dnes za svoju Matku a Kráľovnú.V úplnej podriadenosti a láske zverujeme a  zasväcujeme ti svoje telo a dušu,",
      },
      {
        cisloS: "V2",
        textik:
          "svoje vonkajšie i vnútorné dary, ako aj hodnotu svojich minulých, terajších i budúcich dobrých skutkov.Nechávame ti úplné právo disponovať nami a všetkým,",
      },
      {
        cisloS: "V3",
        textik:
          "čo nám patrí, bez výnimky, podľa tvojej ľubovôle, na väčšiu Božiu slávu teraz i vo večnosti.Amen.",
      },
    ],
  },

  {
    cisloP: "902",
    nazov: "Modlitba za blahorečenie Pierra Goursata",
    slohy: [
      {
        cisloS: "V1",
        textik:
          "Pane Ježišu, prosíme ťa za  blahorečenie Pierra Goursata. Poháňaný silnou túžbou po spáse duší a veľkou láskou k Cirkvi",
      },
      {
        cisloS: "V2",
        textik:
          "pracoval s vierou a nádejou na jej duchovnej a apoštolskej obnove. Prosíme ťa, na jeho príhovor, daruj nám, Pane, milosť úplne ti dôverovať, ",
      },
      {
        cisloS: "V3",
        textik:
          "štedro ti slúžiť a plniť tvoju vôľu. Daj nám srdcia otvorené pre adoráciu, pretekajúce súcitením ku všetkým  ľuďom, a zapáľ nás ohňom svojej lásky ",
      },
      {
        cisloS: "V4",
        textik:
          "pre evanjelizáciu sveta.Na príhovor Božieho služobníka Pierra Goursata prosíme ťa naliehavo, Pane, aby si udelil všetkým našim  bratom a sestrám ",
      },
      {
        cisloS: "V5",
        textik:
          "množstvo milostí v bratských vzťahoch, obzvlášť milosť stáť pri chudobných a zranených životom, milosť utešovať utláčaných, posilňovať slabých, uzdravovať chorých.",
      },
      { cisloS: "V6", textik: "Osobitne ti zverujeme..." },
      {
        cisloS: "V7",
        textik:
          "Pane Ježišu, prosíme ťa, ukáž všetkým, ktorí sa vzdialili od teba alebo ťa ešte nepoznajú, nekonečnú lásku svojho tichého a pokorného Srdca.",
      },
    ],
  },

  {
    cisloP: "1601",
    nazov: "Kyrie",
    slohy: [
      {
        cisloS: "R",
        textik: "",
      },
      {
        cisloS: "V1",
        textik: "Kyrie eleison, Kyrie eleison, Kyrie eleison.",
      },
      {
        cisloS: "V2",
        textik: "Christe eleison, Christe eleison, Christe eleison.  ",
      },
      ,
    ],
  },

  {
    cisloP: "1604",
    nazov: "Sanctus",
    slohy: [
      {
        cisloS: "R",
        textik: "Sanctus, Sanctus, Sanctus, Deus Sabaoth.",
      },
      {
        cisloS: "V1",
        textik:
          "Pleni sunt caeli et terra gloria tua. Hosanna in excelsis Deo. Hosana in excelsis.",
      },
      {
        cisloS: "V2",
        textik:
          "Benedictus qui venit in nomine Domini. Hosanna in excelsis Deo. Hosana in excelsis. ",
      },
    ],
  },

  {
    cisloP: "1605",
    nazov: "Agnus",
    slohy: [
      {
        cisloS: "R",
        textik: "",
      },
      {
        cisloS: "V1",
        textik: "Agnus Dei,  qui tollis peccata mundi, miserere nobis.",
      },
      {
        cisloS: "V2",
        textik: "Agnus Dei,  qui tollis peccata mundi, dona nobis pacem. ",
      },
    ],
  },
  {
    cisloP: "1603",
    nazov: "Gloria",
    slohy: [
      {
        cisloS: "R",
        textik: "Gloria in excelsis Deo, Gloria Deo Domino",
      },
      {
        cisloS: "V1",
        textik:
          "Chválime Ťa, velebíme ťa, klaniame sa Ti, oslavujeme ťa, vzdávame Ti vďaky, lebo je Tvoja sláva.",
      },
      {
        cisloS: "V2",
        textik:
          "Pane, Bože, Kráľ nebeský, Boh, Otec všemohúci, Pane Ježišu Kriste, ty jednorodený Syn, Pán a BohBaránok Boží, Syn Otca. ",
      },
      {
        cisloS: "V3",
        textik:
          "Ty snímaš hriechy sveta, zmiluj sa nad nami, ty snímaš htriechy sveta, prijmi našu úpenlivú prosbu, Ty sedíš po pravici Otca,zmiluj sa nad nami.",
      },
      {
        cisloS: "V4",
        textik:
          "VEeď len ty si svätý, len ty si Pán, len ty sio najvyšší, Ježišu Kriste, s Duchom svätým, v sláve Boha Otca, AMEN.",
      },
    ],
  },

  {
    cisloP: "1700",
    nazov: "STANTE SA SOľou",
    slohy: [
      {
        cisloS: "R",
        textik:
          "Staňte sa soľou, soľou zeme a hľadajte poklad viery.\n Buďte svetlom, svetlom sveta, ktoré do tmy. ",
      },
    ],
  },
]};
export default novePiesne;
