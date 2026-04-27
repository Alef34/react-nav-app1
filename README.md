# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Trvaly import skladieb (Supabase)

Appka podporuje trvaly import cez Supabase. Po importe sa skladby nacitavaju z DB bez noveho deployu.

### 1. Konfiguracia env

Skopiruj `.env.example` do `.env` a vypln hodnoty:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Priprava DB

V Supabase SQL editore spusti skript:

- `supabase-setup.sql`

Tym sa vytvori tabulka `songs`, unikatny index a RLS politiky.

### 3. Prihlasenie admina

V Supabase Authentication vytvor pouzivatela (email/heslo), ktory bude robit import.

### 4. Import v aplikacii

1. Spusti appku
2. Otvor route `/admin-import`
3. Prihlas sa admin uctom
4. Vyber JSON subor vo formate `{ verzia, piesne }`

Import pouziva upsert konflikt `cislo_p,nazov`.

## Raspberry Pi + DTP Projektor

Projekt je pripraveny na rezim controller vs projector cez lokalny WebSocket server.

### 1. Raspberry s IP adresou v LAN

Na Raspberry Pi spusti aplikaciu tak, aby bola dostupna v lokalnej sieti:

```bash
npm install
npm run dev:lan
```

Potom aplikacia bezi na adrese typu `http://192.168.1.50:5173`.

### 2. Realtime kanál pre projektor

V druhom terminali na Raspberry spusti WebSocket server:

```bash
npm run projector:ws
```

Server pocuva na `ws://<raspberry-ip>:8787`.

### 3. Controller vs projector rezim

- Controller je stranka s akordami (`/akordy`), kde klikas na `PROJ` a prepinas slohy.
- Projektor je stranka `/projector` otvorena na DTP obrazovke.
- Controller posiela stav skladby cez WebSocket.
- Projektor stav prijima a zobrazi ho v realnom case.

Ak WebSocket docasne vypadne, appka stale funguje lokalne cez `localStorage` fallback.

### 4. DTP pripojeny k Raspberry

Odporucany setup:

1. Pripoj DTP ako druhy display (HDMI).
2. Na Raspberry otvor fullscreen Chromium s adresou `http://127.0.0.1:5173/projector` na DTP.
3. Z mobilu/notebooku otvor `http://<raspberry-ip>:5173` a ovladaj skladby.

Pri kliknuti na `PROJ` alebo pri zmene casti (slohy) sa obsah posle na DTP.

### Volitelna konfiguracia WS URL

Ak potrebujes explicitne nastavit WebSocket URL, pridaj do `.env`:

```env
VITE_PROJECTOR_WS_URL=ws://192.168.1.50:8787
```

Alternativne mozes zadat iba port:

```env
VITE_PROJECTOR_WS_PORT=8787
```

Edit suboru kde su nastavene wifi siete
sudo nano /etc/wpa_supplicant/wpa_supplicant-wlan1.conf

Edit suboru, kde je popisana ProjectorAP
sudo nano /etc/hostapd/hostapd.conf

vypnutie payload
http://127.0.0.1:5179/projector?disableWsPayload=1 / 0

journalctl -u react-nav-projector.service -b --no-pager | tail -n 150

sudo systemctl restart react-nav-projector.service

/etc/systemd/system

- react-nav-projector.service
- wpa_supplicant@wlan1.service.d

Verzia:
Zvýš verziu bez auto-commitu:
npm version patch --no-git-tag-version --force

npm run gen:version

update:
git restore /home/adminik/react-nav-app1/src/version.ts
git pull
npm run build
npm run projector:start
