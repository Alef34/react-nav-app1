# Raspberry Pi autostart pre projektor

Tento postup nastavi Raspberry Pi tak, aby po starte:

1. spustil Vite appku na `0.0.0.0:5173`
2. spustil projector WebSocket server na `0.0.0.0:8787`
3. po prihlaseni do desktopu otvoril fullscreen projektor na `http://127.0.0.1:5173/projector`

Postup je pisany pre Raspberry Pi OS s desktopom a uzivatelom `pi`.
Ak mas iny username alebo inu cestu k projektu, vsade to uprav.

## 1. Predpoklady

Na RPi si over:

```bash
cd /home/pi/react-nav-app1
npm install
npm run dev:lan
```

V inom terminali:

```bash
cd /home/pi/react-nav-app1
npm run projector:ws
```

Ak funguje:

- `http://127.0.0.1:5173/projector` sa otvori lokalne na RPi
- z ineho zariadenia v sieti funguje `http://<rpi-ip>:5173`
- `ss -ltnp | grep 5173` ukazuje `0.0.0.0:5173`

Potom ma zmysel riesit autostart.

## 2. Nainstaluj desktop browser

Ak este nemas Chromium:

```bash
sudo apt update
sudo apt install -y chromium-browser
```

Ak by balik `chromium-browser` neexistoval, pouzi:

```bash
sudo apt install -y chromium
```

Repo uz ma helper skript `npm run projector:fullscreen`, ktory sa pokusi otvorit `google-chrome`, `chromium-browser` alebo `chromium`.

## 3. Zapni automaticke prihlasenie do desktopu

Projektor vo fullscreen browseri potrebuje graficku session, preto nestaci iba `systemd` sluzba pre Node procesy.

Na RPi otvor:

```bash
sudo raspi-config
```

Nastav:

1. `System Options`
2. `Boot / Auto Login`
3. `Desktop Autologin`

Potom restartuj, ak ta o to poziada.

## 4. Vytvor systemd sluzbu pre app stack

Repo uz obsahuje skript `npm run projector:start`, ktory spusti:

- `npm run dev:lan`
- `npm run projector:ws`

Vytvor systemd jednotku:

```bash
sudo nano /etc/systemd/system/react-nav-projector.service
```

Obsah:

```ini
[Unit]
Description=React Nav projector stack
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/react-nav-app1
Environment=HOME=/home/pi
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run projector:start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Potom aktivuj sluzbu:

```bash
sudo systemctl daemon-reload
sudo systemctl enable react-nav-projector.service
sudo systemctl start react-nav-projector.service
```

Stav overis:

```bash
systemctl status react-nav-projector.service
journalctl -u react-nav-projector.service -b --no-pager
```

## 5. Vytvor autostart pre fullscreen projektor

Node procesy nech bezia cez `systemd`, ale browser je najlepsie spustit az po nabehnuti desktop session.

Najprv vytvor pomocny skript:

```bash
mkdir -p /home/pi/bin
nano /home/pi/bin/start-projector-kiosk.sh
```

Obsah:

```bash
#!/usr/bin/env bash
set -eu

cd /home/pi/react-nav-app1
sleep 12
/usr/bin/npm run projector:fullscreen -- http://127.0.0.1:5173/projector
```

Nastav spustitelnost:

```bash
chmod +x /home/pi/bin/start-projector-kiosk.sh
```

Potom vytvor LXDE autostart subor:

```bash
mkdir -p /home/pi/.config/lxsession/LXDE-pi
nano /home/pi/.config/lxsession/LXDE-pi/autostart
```

Obsah:

```text
@xset s off
@xset -dpms
@xset s noblank
@/home/pi/bin/start-projector-kiosk.sh
```

To spravi dve veci:

- vypne uspavanie a blank screen
- po prihlaseni spusti fullscreen projektor

## 6. Restart a test

Restartni Raspberry Pi:

```bash
sudo reboot
```

Po boote otestuj:

1. RPi sa samo prihlasi do desktopu
2. Projektor okno sa samo otvori vo fullscreen mode
3. Z Macu otvor `http://<rpi-ip>:5173`
4. Controller posiela obsah do projektora

## 7. Uzitocne kontroly

Ak sa po boote nic neotvori:

```bash
systemctl status react-nav-projector.service
journalctl -u react-nav-projector.service -b --no-pager
cat /home/pi/.config/lxsession/LXDE-pi/autostart
```

Ak browser otvori prilis skoro a stranka este nebezi, zvys `sleep 12` napr. na `sleep 20` v subore `/home/pi/bin/start-projector-kiosk.sh`.

Ak sa fullscreen neotvori, skus manualne:

```bash
cd /home/pi/react-nav-app1
npm run projector:fullscreen -- http://127.0.0.1:5173/projector
```

Ak `npm` nie je v `/usr/bin/npm`, zisti cestu:

```bash
which npm
```

A nahraď ju v:

- `/etc/systemd/system/react-nav-projector.service`
- `/home/pi/bin/start-projector-kiosk.sh`

## 8. Minimalna verzia konfiguracie

Ak chces len najkratsie zhrnutie:

1. `sudo raspi-config` -> `Desktop Autologin`
2. systemd sluzba s `ExecStart=/usr/bin/npm run projector:start`
3. LXDE autostart, ktory po `sleep 12` spusti `npm run projector:fullscreen -- http://127.0.0.1:5173/projector`

To je cele. `systemd` drzi backend a Vite pri zivote, desktop autostart otvori fullscreen projektor po starte.
