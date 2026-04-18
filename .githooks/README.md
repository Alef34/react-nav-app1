# Git Hooks

This repository uses a local hooks directory via `core.hooksPath=.githooks`.

## Hook behavior

- `pre-commit`: runs `npm run gen:version` and stages `src/version.ts`.

## Setup

Run:

```bash
npm run setup:hooks
```

`npm install` also runs this automatically through the `prepare` script.
