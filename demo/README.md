# One Energy View · demo complet

## Deschidere imediată, offline

Deschide **index.html** din acest folder. Include interfața React, toate ecranele Solar Studio și snapshotul dashboard.json, fără instalare sau conexiune la internet. Biletele și interacțiunile se salvează în browser când stocarea este disponibilă.

## Server local: SQLite, NASA și OCR

Din acest folder:

```sh
python3 energy_data_pipeline.py --synthetic-baseline --serve
```

Sau dublu click pe **START_DEMO.command** pe macOS. Deschide http://127.0.0.1:8765. Comanda generează un nou replay sintetic în data/energy-demo/ și folosește build-ul React inclus. Dacă portul 8765 este deja ocupat de demo-ul din folderul părinte, oprește acel server înainte de a porni copia.

Serviciile opționale de OCR/PDF folosesc requirements-solar-optional.txt și executabilul tesseract. NASA necesită internet. Furnizorul AI este opțional și se configurează server-side conform solar-services.env.example. CV/satelit, Dedalus și ElevenLabs nu sunt active; alternativele locale sunt etichetate.

## Modificarea aplicației

```sh
cd frontend
npm ci
npm run dev
# După modificări:
npm run build
npm test
```

Build-ul de producție este în frontend/dist/index.html. index.html din rădăcina demo este snapshotul autonom salvat la împachetare; o nouă rulare Python creează un nou dashboard cu build-ul curent.

## Conținut

- index.html + dashboard.json: demo autonom cu datele ultimei rulări salvate.
- frontend/: cod React/TypeScript, build, teste și package-lock.json.
- energy_data_pipeline.py + solar_services.py: pipeline și servicii locale.
- ui/: interfața inițială de rezervă și testele calculelor.
- docs/: arhitectură, referințe, surse și comparația Watts-Up.
- APPLE_UI_SPEC.md: specificația interacțiunilor.
- manifest.json: lista fișierelor și SHA-256 la împachetare.

Datele de telemetrie și tarifele sunt scenarii, nu o instalație conectată. Climatologia NASA inclusă are proveniență și nu este prognoză. Folderul este o copie independentă a aplicației; dependențele node_modules, conturile, cheile și baza existentă de bilete nu sunt incluse.
