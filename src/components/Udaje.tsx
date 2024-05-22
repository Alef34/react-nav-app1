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

export const fetchDataTQ = async (): Promise<Song[]> => {
  //await query:any

  //new Promise((resolve)=>setTimeout(resolve, 1000));

  //const queryna = query.trim();
  const poslaneData = novePiesne.filter((piesen) =>
    Object.values(piesen).some(
      (value) => typeof value === "string" && value.toLowerCase().includes("")
    )
  );
  //queryna.toLowerCase()
  //console.log("UUUA:", "+", "", "+", poslaneData.length);
  return [...poslaneData];
};

const novePiesne = [
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
          "[F]Vstaň a vzdaj Bohu [B]chválu, česť,\n[g]ospevuj Kráľa, [a]ktorý [B]láme [C7]chlieb,\n[F]prijmi sám večnej [B]spásy dar,\n[d]nájdeš novú [g7/C]tvár[C7].",
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
];
//export default novePiesne;
