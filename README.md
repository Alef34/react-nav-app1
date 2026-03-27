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
