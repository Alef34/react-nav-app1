# Postup premietania cez Mac (DTP)

Tento postup popisuje, ako pouzit Mac ako centrálu na premietanie textov piesni na projektor alebo TV.

---

## Co potrebujes

- Mac s nainstalovanum Node.js 18+
- Projektor alebo TV pripojeny k Macu cez HDMI (pripadne USB-C adaptér)
- Volitelne: mobil alebo tablet v rovnakej Wi-Fi sieti ako ovladac

---

## 1. Pripoj projektor k Macu

1. Zapoj projektor/TV cez HDMI (príp. USB-C → HDMI adaptér).
2. Na Macu otvor **System Settings → Displays**.
3. Nastav rezim **Extended Display** (rozšírená plocha) — **NIE zrkadlenie**.
   - Tak mozes mat ovladaci panel na Macu a projekcia pojde iba na DTP.

---

## 2. Spusti servery

Otvor **dva terminaly** v priecinku projektu:

**Terminal 1 — web aplikacia:**

```bash
npm install        # len pri prvom spusteni
npm run dev:lan
```

Aplikacia bezi na `http://127.0.0.1:5173` (a tiez na IP Macu v sieti, napr. `http://192.168.1.25:5173`).

**Terminal 2 — projektor WebSocket server:**

```bash
npm run projector:ws
```

Server pocuva na `ws://127.0.0.1:8787`.

---

## 3. Otvor projektor okno na DTP

1. V prehliadaci (Chromium/Chrome) otvor:
   ```
   http://127.0.0.1:5173/projector
   ```
2. Premiesni okno prehliadaca na projektovany displej (DTP).
3. Zapni fullscreen — klaves **F11** alebo **Cmd+Ctrl+F** (Mac).

---

## 4. Ovladaj z Macu

1. V druhom okne prehliadaca (na hlavnom displeji) otvor:
   ```
   http://127.0.0.1:5173
   ```
2. Vyber skladbu, otvor ju (klik na nazov).
3. Pri tlacidlu **PROJ** uvidis badge `Projektor online` — to znamena, ze WebSocket server bezi.
4. Klikni **PROJ** — skladba sa posle do projektoroveho okna.
5. Prepinaj slohy kliknutim na V1, V2... — kazda zmena sa okamzite zobrazi na DTP.

### Split rezim na desktope

Na sirokom displeji je hlavne okno rozdelene na 2 casti:

- Vlavo: zoznam skladieb
- Vpravo: nahlad skladby (obsah ako v Akordoch) + tlacidlo PROJ

Po kliknuti na skladbu vlavo sa text zobrazi vpravo bez prechodu na novu stranku.

#### Skratky pre prepianie sloh (v split rezime)

- Dalsia sloha: `ArrowRight` alebo `PageDown`
- Predosla sloha: `ArrowLeft` alebo `PageUp`

#### Manualna sirka panelov

V hornej casti (pri filtroch) je slider **Sirka zoznamu**.

- Posuvas nim pomer laveho/praveho panelu
- Hodnota sa ulozi do localStorage a po dalsom spusteni zostane zachovana

---

## 5. Ovladaj z mobilu (volitelne)

Ak chces mat telefon ako dialkovac a projektor nechat bezat na Macu:

1. Zisti IP adresu Macu:
   ```bash
   ipconfig getifaddr en0
   ```
   Typicky nieco ako `192.168.1.25`.
2. Na mobile otvor (v rovnakej Wi-Fi sieti):
   ```
   http://192.168.1.25:5173
   ```
3. Projektor nech ostane otvoreny na Macu na adrese `/projector`.
4. Ovladat mozes rovnako — vyber skladbu, klikni PROJ, prepinaj slohy.

> Ak mobil nevidí stranku: skontroluj macOS Firewall (System Settings → Network → Firewall)
> a povol prichadzajuce spojenia pre Node.js / Vite.

---

## Skratena verzia (nedeľný rezim)

```bash
# Terminal 1
npm run dev:lan

# Terminal 2
npm run projector:ws
```

Potom:

- Hlavny displej Mac: `http://127.0.0.1:5173` — ovladanie
- DTP fullscreen: `http://127.0.0.1:5173/projector` — premietanie
