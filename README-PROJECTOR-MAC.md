# macOS + dataprojektor

Najjednoduchsi sposob pre Mac s DTP ako rozsirenou obrazovkou:

```bash
npm run projector:mac
```

Skript urobi toto:

- spusti Vite appku v LAN rezime
- spusti WebSocket server pre projector sync
- automaticky zisti lokalnu URL appky aj ked port 5179 je obsadeny
- otvori controller okno na `http://127.0.0.1:5179`
- otvori projector okno na `http://127.0.0.1:5179/projector` vo fullscreen

Poznamka pre macOS:

- skript vie otvorit obe okna, ale negarantuje, ze projector okno pojde rovno na druhy monitor
- ak sa otvori na hlavnom displeji, presun ho na dataprojektor a zapni fullscreen tam

Rucne alternativy:

```bash
npm run projector:start
npm run projector:fullscreen
```

Controller potom otvor v browseri na:

```text
http://127.0.0.1:5179
```
