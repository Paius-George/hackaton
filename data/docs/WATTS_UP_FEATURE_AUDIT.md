# Watts-Up → One Energy View: audit și implementare

Sursă inspectată efectiv: [deepanshgandhi/Watts-Up](https://github.com/deepanshgandhi/Watts-Up), commit **d5849f4682b47855f815efb6ea03470833b012de**, 24 octombrie 2026. Au fost citite README, algorithm.md, rutele, calculatoarele și componentele React. Nu am rulat proiectul terț și nici nu am folosit conturile, credențialele sau agentul vocal al autorilor. Repository-ul include chiar și node_modules; acestea nu au fost importate în proiect.

Implementarea nouă este independentă. În arborele rădăcină inspectat nu apare un fișier LICENSE; de aceea am adaptat conceptele și comportamentele, fără a copia componentele și serviciile originale.

## Comparație funcțională

| Concept și sursă exactă | Ce exista la noi | Ce s-a adăugat |
|---|---|---|
| [Selecție locație / hartă](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/ui/src/components/FullscreenMap.tsx) | Selectarea a trei instalații de replay | Solar Studio: localități RO, adresă de referință, coordonate, geolocație la cerere, hartă OSM opțională online. Nu pretinde autocomplete Google sau imagini satelit. |
| [Geometria acoperișului](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/core/geometry.py) | Capacitate fixă a instalației | Desen / editare poligon cu pointer capture, calcul m² cu corecție latitudine, respingere intersecții, suprafață manuală, scară metrică și imagine proprie de referință. |
| [Roof analysis](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/roof_analysis.py) | Fără planificare panouri | Arie utilizabilă, putere / dimensiune modul, număr de panouri, capacitate kWp. Nu include layout electric sau verificare structurală. |
| [NASA POWER](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/solar_data.py) | PVGIS istoric de 14 zile | Apel NASA real prin serverul local, 12 luni, cache 24h, coordonate verificate. Snapshot NASA București inclus pentru offline, cu URL, moment și perioada climatologică. |
| [Solar potential / score](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/solar_calculations.py) | Abatere măsurat/model, nu potențial anual | Grafic lunar, energie anuală, factor capacitate, scor euristic 0–100 cu cinci componente și ponderi inspectabile. Orientare, umbrire, murdărie și PR editabile. |
| [Financial outlook](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/financial_analysis.py) | Costuri operaționale de replay în patru registre | Model separat în RON pe 25 de ani: investiție, grant introdus, autoconsum / export, degradare, prețuri, O&M, curățare, ROI, NPV, recuperare cu costuri de operare. Fără recuperare: „—”, nu 25 ani inventați. Export CSV. |
| Finanțare din același modul | Fără cash vs credit | Cash, credit amortizat cu avans, durată și APR inclusiv dobândă zero; PPA ipotetic separat, fără ofertă reală. |
| Impact CO₂ din solar_calculations.py | Fără impact anual | CO₂ anual / 25 ani cu degradare și arbori echivalenți; factori editabili, analogie explicită, nu certificate de carbon. |
| [Savings Mirror](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/ui/src/components/BillComparisonUpload.tsx) | Import CSV de consum, fără factură | PDF text în browser, TXT lipit/importat, OCR local pentru imagini/PDF scanat când dependențele există. Candidați pentru total/kWh; confirmare umană obligatorie. Factură import și credit export separate. Factura post-PV nu este transformată fictiv într-o factură pre-PV. |
| [Equity calculator](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/equity_calculator.py) | Fără acces energetic | Indice de scenariu cu venit, chiriași, povară, adopție; praguri RO editabile, bariere explicate, comparație de zone salvate. Fără Census SUA sau statistici INS inventate. Nu stabilește eligibilități. |
| [Equity actions](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/ui/src/components/EquityActionsPanel.tsx) | Ticket O&M existent | Ciornă pentru comunitate/primărie descărcabilă, surse românești, raport printabil/salvare PDF. Nu trimite emailuri automat. În original, butonul raport afișa doar toast; aici există raport concret. |
| [Installer finder](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/installer_finder_agent.py) | Contacte doar în documentele de cercetare | Director de cinci instalatori din cercetarea locală, telefoane și pagini-sursă, plus căutare Maps la cerere. Fără ratinguri sau disponibilitate inventate. Nu este căutare Dedalus live. |
| [Incentive agent](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/incentive_agent.py) | Context de brief | AFM, ANRE, APCE, Fii Prosumator în asistent, cu eligibilitatea neconfirmată. Grant implicit 0 RON. Nu importăm creditul fiscal american de 30%. |
| [Orchestrator](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/agent_orchestrator.py) și [summary agent](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/business_logic/summary_agent.py) | Brief diagnostic local | Flux local inspectabil în cinci etape, întrebări despre date, rezumat determinist; opțional explicație prin furnizor AI propriu compatibil chat/completions. Fără cheie: buton dezactivat și explicație clară. |
| [Voice widget](https://github.com/deepanshgandhi/Watts-Up/blob/d5849f4682b47855f815efb6ea03470833b012de/ui/src/components/VoiceWidget.tsx) | Fără voce | Citire și oprire cu SpeechSynthesis din browser, fără microfon sau script extern. Nu reutilizează agent-id ElevenLabs al autorului. |

## Ce NU este implementat ca integrare identică

- **Google Places / satellite / SegFormer CV:** ar necesita acces API, imagini licențiate, greutăți de model și validare locală. Alternativa implementată este desenul manual pe plan metric / hartă stradală / imagine încărcată. Nu apare un diagnostic AI fals.
- **Dedalus cu cercetare web în timp real și ElevenLabs conversațional:** necesită propriile servicii/conturi. Există director, surse oficiale, reguli locale, voce de browser și adaptor AI configurabil, dar nu afirmăm echivalență cu acele integrări.
- **EIA / LBNL / Census SUA și federal ITC:** nu se aplică automat României. Sunt înlocuite de ipoteze RON și date manuale explicit etichetate. Nu sunt ascunse drept date locale reale.
- **Reconstrucția exactă a facturii românești / eligibilitate AFM:** necesită contracte și condiții verificate. Comparația rămâne un scenariu revizuit de utilizator.

## Fișiere și limite

- `frontend/src/SolarStudio.tsx`: noua zonă cu șapte subecrane.
- `frontend/src/solar-planning.ts`: geometrie, energie, finanțe, acces, parser și raport.
- `frontend/src/bill-pdf.ts`: PDF.js cu worker inclus în HTML-ul standalone.
- `frontend/src/nasa-bucharest.json`: răspuns NASA real pentru 44.4268, 26.1025; climatologie 2001–2025 la momentul preluării.
- `solar_services.py`: NASA, extragere locală din factură, adaptor AI opțional. Pipeline-ul PVGIS/simulare/dispatch nu a fost rescris.
- Persistență: `oev-solar-studio-v1` și `oev-solar-studio-v1-areas`. Profilul este independent de instalația selectată; nu înlocuiește telemetria sau registrele de cost.
- Imaginile de referință și textul brut de factură nu se salvează automat în localStorage. Profilul numeric poate conține date financiare introduse de utilizator și rămâne local.
- Harta OSM, geolocația, NASA, OCR și AI sunt acțiuni explicite. Modul offline păstrează desenul, calculele, snapshotul NASA, factura manuală, raportul și exportul.
- Model anual simplificat: autoconsum constant, iradiere orizontală cu factori aproximativi, fără simulare anuală orară, taxe, costuri de înlocuire sau garanții de randament. Aceste ipoteze nu trebuie confundate cu optimizatorul bateriei din replay.

## Verificări

`npm run build` și `npm test` în frontend. Teste unitare de geometrie/calcul și testarea bundle-ului construit în jsdom pentru noile subecrane și fluxurile existente, cu/fără reduced motion. `python3 -m unittest discover -s tests -p test_solar_services.py -v`: NASA cu răspuns mock/cache, erori de date, PDF real, OCR local real și adaptor AI mock/fără cheie. A fost executat și un apel real NASA pentru București. OCR a fost verificat pe imagine sintetică; nu dovedește acuratețe pe orice factură.

Nu au fost folosite instrumente MCP. Verificarea vizuală finală în browser, workerul PDF din browser și vocea sistemului nu au fost exercitate prin automatizare; există alternativă de extragere PDF/OCR prin server local și intrare manuală. Snapshotul NASA este însoțit de proveniență; nu este o predicție pentru ziua curentă.
