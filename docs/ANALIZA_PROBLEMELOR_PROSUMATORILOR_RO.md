# Analiza problemelor prosumatorilor din România și direcția One Energy View

24 octombrie 2026. Analiză bazată pe [Problemele prosumatorilor din România](PROBLEME_COMUNE_PROSUMATORI_RO.md) și [registrul celor 55 de surse](../data/energy-research/prosumer-problems-sources.json).

Am analizat materialele deja strânse, fără interviuri noi, verificări ale instalațiilor sau căutări online suplimentare. Recomandările de produs și criteriile pentru pilot sunt propunerile echipei; sursele ne ajută să le alegem, dar nu le validează.

## 1. Concluzia principală

Propun să testăm un serviciu care ajută utilizatorul să înțeleagă o anomalie energetică și să obțină o rezolvare. Când observă o schimbare, ar trebui să poată vedea datele care o susțin, impactul posibil și persoana care poate investiga. Incidentul rămâne în evidență până la rezolvare.

Materialele descriu dificultăți de interpretare a datelor, facturare și intervenție. Nu știm încă cât de răspândite sunt, cât costă în medie sau dacă oamenii ar plăti pentru ajutor. Avem suficiente motive să facem interviuri și un prototip restrâns; cererea comercială rămâne de verificat.

Facturarea apare în multe dintre materialele strânse. O parte dintre cauze țin însă de contracte și de procesele furnizorilor. Pentru primul prototip One Energy View aș începe cu opririle și abaterile de producție: le observăm și adunăm dovezile de care are nevoie tehnicianul. Compararea datelor cu factura poate veni ulterior.

## 2. Cât de solide sunt dovezile

Cele 55 de documente provin din 26 de domenii și acoperă perspective diferite. Din numărul lor nu putem deduce câți prosumatori sunt afectați sau câți ar cumpăra produsul.

În registru sunt consemnate 21 de pagini deschise și un PDF deschis, cu secțiuni relevante indexate. Pentru celelalte 33 de înregistrări am avut doar fragmente indexate; aici intră și o pagină a cărei deschidere a expirat. Putem folosi materialul ca să alegem ce investigăm. Afirmațiile pe care se va baza prezentarea cer însă reverificarea documentelor originale și exemple obținute direct de la intervievați.

La citirea surselor trebuie să ținem cont de câteva limite:

- Mai multe articole reiau poziția APCE, același comunicat sau aceeași dezbatere. Publicațiile diferite pot crea impresia unor confirmări independente.
- Comunitățile și presa fac nemulțumirile mai vizibile decât funcționarea normală. În plus, o întrebare despre „regrete” îi îndreaptă deja pe participanți spre anumite răspunsuri.
- Cazurile din 2023 și 2024 ne ajută să înțelegem ce s-a întâmplat atunci. Pentru a spune că problemele persistă în octombrie 2026 avem nevoie de cazuri recente.

Din aceste materiale putem alege incidentele și întrebările de investigat. Afirmația că „majoritatea prosumatorilor au aceste probleme” ar depăși dovezile. Articolele care repetă aceeași relatare și limitele fiecărei surse sunt indicate în [raportul de bază](PROBLEME_COMUNE_PROSUMATORI_RO.md).

## 3. Ce probleme merită prioritizate

Tabelul compară problemele după dovezile din materialele analizate și după ce poate face produsul. O susținere mai bună înseamnă că am găsit mai multe tipuri de dovezi relevante; nu înseamnă că problema afectează mai mulți prosumatori la nivel național.

| Problemă | Dovezi în materialele analizate | Ce poate face produsul | Limită principală | Prioritate propusă |
| --- | --- | --- | --- | --- |
| Facturare, sold și decontare neclare: P1/P3 | Relativ ridicată: relatări, cazuri din presă, explicații oficiale | Aliniază perioadele, explică fluxurile și identifică documente lipsă | Nu emite facturile furnizorului și nu rezolvă automat litigiile | Modul secundar; alternativă dacă interviurile o cer |
| Opriri de producție și documentarea lor: P2/P4 | Medie: cazuri concrete, răspunsuri și poziții instituționale; fără toate logurile | Corelează evenimentele, tensiunea și importul/exportul; pregătește un caz | Nu repară rețeaua și nu confirmă cauza doar din puterea PV | Primul caz de utilizare de testat |
| Producție sub așteptări: P5 | Limitată pentru defecte confirmate | Semnalează abateri și solicită verificări | Vremea, umbrirea și configurația pot explica abaterea | Detectare prudentă, fără diagnostic automat definitiv |
| Autonomie și utilizare baterie: P6/P7 | Medie pentru experiențe individuale; slabă pentru pierderi evitabile cuantificate | Explică profilul de utilizare și compară scenarii | Capacitatea insuficientă nu este neapărat o problemă de control | După accesul la date și contract |
| Compatibilitate și cost hardware: P8 | Reclamații și discuții locale relevante | Explică limitele configurației | Software-ul nu elimină incompatibilitatea fizică sau costul bateriei | Informație pentru suport |
| Racordare și reguli: P9/P10 | Procese și dispute documentate | Urmărește pașii și documentele | Dependență de terți și de actualizarea informației | În afara primului prototip |
| Acces și control asupra datelor: P11 | Dezbateri documentate, efect asupra cumpărării necunoscut | Arată permisiunile și istoricul acțiunilor | Preocuparea declarată nu dovedește motiv de achiziție | Cerință de proiectare |
| Așteptări de investiție și backup: P12 | Discuții și estimări personale | Explică scenarii și limite | Lipsesc comparații auditate între promisiune și rezultat | Descoperire, fără promisiuni de amortizare |

Cazurile de facturare și explicațiile furnizorilor susțin prima temă. Pentru alegerea unui prototip de monitorizare contează și relatările despre opriri și suport: [RO02: Facturi neemise din 2023: prosumator Hidroelectrica](https://www.reddit.com/r/Romania/comments/1e1o2qv/facturi_neemise_din_2023_prosumator_hidroelectrica/); [RO38: Gândul: cazul Petru din Prahova și răspunsul ENGIE](https://www.gandul.ro/actualitate/pe-1-octombrie-2022-petru-din-prahova-a-incheiat-un-contract-de-prosumator-cu-engie-ce-a-patit-acum-dupa-4-luni-19924461); [RO42: E.ON: ghid și întrebări de facturare](https://www.eon.ro/info-prosumatori); [RO27: Senat: cazul de tensiune din Buzeni](https://www.senat.ro/StiriSenatDetaliu.aspx?ID=B4FF3044-4015-4D07-8DD5-D459D3A90237); [RO30: Economedia: ANRE despre setările invertoarelor](https://economedia.ro/avertisment-de-la-anre-prosumatorii-care-modifica-softul-invertoarelor-vor-fi-deconectati-de-la-retea-si-amendati.html).

## 4. Unde se pierde timp între observație și rezolvare

În cazurile descrise, utilizatorul pornește de la date aflate în aplicații și documente separate. Observă ceva greu de explicat, adună manual dovezi și caută un responsabil. Urmează verificarea, intervenția și confirmarea rezultatului.

Acest traseu ne ajută să analizăm munca depusă. Cauzele diferă: poate fi o problemă contractuală, una fizică sau o diferență între așteptări și funcționarea sistemului. O interfață comună ar putea reduce efortul de investigație; trebuie să măsurăm dacă reușește.

Produsul trebuie să distingă următoarele situații:

| Situație | Exemplu din material | Răspuns potrivit |
| --- | --- | --- |
| Comportament normal, interpretat greșit | Producția totală diferă de energia injectată; bateria ajunge la rezerva setată | Explicație bazată pe fluxuri și configurație |
| Lipsă de date sau proces incomplet | Datele contorului nu ajung în facturare; un contract necesită clarificare | Identificarea golului și urmărirea solicitării |
| Incident tehnic posibil | Opriri repetate, evenimente și tensiune anormală corelate | Dosar de diagnostic și verificare de către specialist |

Eticheta de „defect” pusă tuturor acestor situații ar produce alarme inutile. Nici graficul singur nu scutește utilizatorul de interpretare. Diferențele se văd în explicațiile despre măsurare și în cazul contractual rezolvat: [RO42: E.ON: ghid și întrebări de facturare](https://www.eon.ro/info-prosumatori); [RO51: ENGIE: model explicat al facturii de consum](https://www.engie.ro/wp-content/uploads/2024/01/factura_consum_prosumatori.pdf); [RO38: Gândul: cazul Petru din Prahova și răspunsul ENGIE](https://www.gandul.ro/actualitate/pe-1-octombrie-2022-petru-din-prahova-a-incheiat-un-contract-de-prosumator-cu-engie-ce-a-patit-acum-dupa-4-luni-19924461).

## 5. Prosumator sau echipă O&M: de unde începem

| Segment | Valoare posibilă | Principalul necunoscut | Dovada cerută |
| --- | --- | --- | --- |
| Prosumator rezidențial | Claritate, mai puțină verificare manuală, ajutor la sesizare | Cât de des apare o problemă suficient de importantă și dacă ar plăti | Ultimul incident, timpul pierdut, date și acțiuni reale |
| Instalator / O&M cu instalații în mentenanță | Mai puțin timp pentru triere și urmărire pe mai multe platforme | Dacă platformele existente rezolvă deja și cine suportă costul intervențiilor | Trei tichete recente, fluxul de lucru și timpul consumat |
| Prosumator comercial / industrial | Decizii bazate pe profil de consum și impact operațional | Materialele conțin prea puține cazuri specifice acestui segment | Interviu separat, contract, măsurători și incidente proprii |

Aș începe discuțiile cu instalatori care oferă mentenanță și cu câțiva clienți ai lor. Gestionarea mai multor instalații poate aduce suficiente incidente într-un singur loc încât să putem măsura beneficiul. Este o presupunere de testat: materialele strânse nu ne spun dacă echipele O&M ar plăti.

La interviu trebuie să aflăm cine folosește produsul și cine decide achiziția. Tehnicianul îl poate folosi, proprietarul poate beneficia de rezultat, iar administratorul firmei poate aproba plata. Cereți un pilot pentru care partenerul pune la dispoziție date și timp; o părere favorabilă nu arată același nivel de interes.

## 6. Ce ne arată experiențele în care sistemul funcționează

Prosumatorul din Transilvania descrie integrarea Fronius, BYD, Shelly și Home Assistant. Există și un proiect pentru conectarea datelor Hidroelectrica. Soluțiile de agregare există deja. Trebuie să aflăm ce rămâne dificil la instalarea și întreținerea lor sau la gestionarea incidentelor și dacă acel efort justifică un produs nou. [RO48: Reddit: zece luni cu Fronius, BYD și automatizări](https://www.reddit.com/r/panourifotovoltaice/comments/1tc7hru/experien%C8%9Ba_primelor_10_luni_cu_panouri/); [RO35: GitHub: integrare Hidroelectrica pentru Home Assistant](https://github.com/cnecrea/hidroelectrica)

Bateria care se termină noaptea poate funcționa conform configurației, iar pentru un proprietar care consumă ziua poate fi potrivit și un sistem fără baterie. În experiențele cu producție stabilă și suport bun trebuie să înțelegem ce funcționează deja. Acești utilizatori pot avea puține motive să adopte produsul. [RO48: Reddit: zece luni cu Fronius, BYD și automatizări](https://www.reddit.com/r/panourifotovoltaice/comments/1tc7hru/experien%C8%9Ba_primelor_10_luni_cu_panouri/); [RO36: Reddit: sistem fotovoltaic în Buftea](https://www.reddit.com/r/panourifotovoltaice/comments/1vdkt5v/sfaturi_pentru_instalarea_panourilor_fotovoltaice/); [RO14: Primul an cu fotovoltaice: producție și autoconsum](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/); [RO13: Cât durează instalarea: inclusiv experiențe pozitive](https://www.reddit.com/r/Panouri_Fotovoltaice/comments/1u90ewc/c%C3%A2t_dureaz%C4%83_efectiv_instalarea/)

În pilot putem verifica dacă reunirea datelor necesare ajută la explicarea și rezolvarea unui incident cu mai puțin efort. Comparația cu aplicațiile existente trebuie făcută pe un caz real, urmărind timpul consumat și rezultatul.

## 7. Primul prototip recomandat

Tehnicianul deschide o instalație cu opriri recurente. Vede pe aceeași cronologie producția, bateria, schimbul cu rețeaua și evenimentele, apoi creează un tichet cu dovezile relevante.

Pentru acest scenariu, prototipul are nevoie de următorii pași:

1. Importă datele disponibile. Pentru început sunt suficiente exporturi autorizate de la invertor și contor; accesul automat la fiecare marcă trebuie demonstrat separat.
2. Aliniază momentele măsurătorilor și sensul valorilor. Păstrează sursa, unitatea, fusul orar, sensul import/export și intervalele lipsă. Separă puterea de energie și producția de injecție.
3. Semnalează o abatere observabilă. Oprirea apare împreună cu evenimente sau alte măsurători relevante. Lipsa datelor primește o etichetă separată. PVGIS istoric rămâne reper, fără a fi prezentat ca vreme măsurată în ziua incidentului.
4. Arată ce știm și ce trebuie verificat. Exemplu de text pentru interfață: „Producția s-a întrerupt în trei intervale; există evenimente de tensiune în aceleași perioade. Cauza necesită verificare.” Acesta este un exemplu de prezentare, fără a descrie un caz măsurat de echipă.
5. Creează și urmărește tichetul. Include intervalele, graficele, sursele și întrebările pentru tehnician. O acțiune externă se face printr-un canal configurat și autorizat; un tichet local este prezentat ca atare.
6. Verifică rezultatul după intervenție. Compară evenimentele în condiții comparabile și înregistrează confirmarea tehnicianului. O zi mai înnorată nu dovedește dispariția cauzei.

Prin acești pași, prototipul unește surse, păstrează istoricul și execută o acțiune. LLM-ul poate redacta explicația și organiza dovezile. Valorile și calculele, împreună cu regulile de detecție, trebuie să poată fi reproduse și verificate.

Când lipsesc datele despre vremea actuală, tariful sau contractul, impactul financiar rămâne necunoscut. Putem afișa un scenariu dacă îi precizăm ipotezele. Diferența dintre energia de referință și cea măsurată nu poate fi atribuită automat unui defect, iar prețul OPCOM nu se aplică automat tuturor fluxurilor de energie ale fiecărui client.

Controlul automat al bateriei, integrarea tuturor mărcilor și interpretarea completă a facturilor ar încărca prea mult primul prototip. Le putem aborda după ce avem acces la date și demonstrăm că produsul ajută la gestionarea incidentelor.

## 8. Cum validăm alegerea

Propun cinci discuții cu instalatori sau echipe O&M și cinci cu prosumatori. Recrutați și persoane mulțumite, pe lângă cele care au avut incidente; postările de reclamații acoperă doar o parte din experiențe. Cu acest eșantion putem explora problema, fără să obținem statistici naționale.

Pentru fiecare incident, notați când a fost observat și când a început probabil. Reconstituiți datele consultate, persoanele contactate și rezultatul, inclusiv ce rămâne neclar. Măsurați separat timpul de așteptare și timpul efectiv de lucru pentru investigație.

| Ipoteză | Test | Semnal de continuare propus | Semnal de schimbare a direcției |
| --- | --- | --- | --- |
| Trierea este o problemă repetată | Reconstruiți trei incidente recente de la cel puțin două firme | Datele arată muncă repetată și un pas concret pe care prototipul îl simplifică | Probleme rare sau deja rezolvate eficient |
| Sursele pot fi reunite practic | Aliniați două surse pentru o instalație autorizată | Obțineți o cronologie utilă și identificați lipsurile | Datele esențiale sunt inaccesibile ori nepotrivite pentru scop |
| Prototipul economisește timp | Comparați sarcini similare cu procesul actual și cu prototipul | Timp mai mic, fără creșterea concluziilor greșite | Explicațiile trebuie refăcute sau verificarea durează mai mult |
| Există interes comercial | Cereți responsabilului un pilot cu date, timp și criterii agreate | Un angajament concret pentru pilot; plata rămâne de testat | Doar aprecieri generale, fără acces sau implicare |

În pilot, urmăriți cât durează de la prima observație până la un tichet util și câte minute de lucru manual sunt necesare. Înregistrați alertele pe care tehnicianul le consideră utile, alarmele false și rezultatul intervențiilor. Păstrați separat alertele utile de defectele confirmate. Pentru economii în RON sunt necesare o metodă de calcul și date care o susțin.

Interviurile ne pot schimba ordinea de lucru. Dacă verificarea facturilor consumă mai mult timp decât incidentele tehnice, începeți cu compararea importului și exportului cu factura și soldul. Dacă majoritatea cazurilor sunt deja gestionate bine, opriți extinderea produsului și căutați o sarcină sau un segment unde a rămas o problemă de rezolvat.

## 9. Rezumat final (maximum 200 de cuvinte)

Din cele 55 de surse despre România reies probleme de facturare și decontare, opriri de producție, diferențe între aplicație și contor/factură și dificultăți în obținerea unui diagnostic. Materialele nu stabilesc cât de frecvente sunt problemele, pierderile medii sau disponibilitatea de plată. Unele repetă aceleași poziții, iar altele descriu cazuri istorice.

Pentru One Energy View aș testa un prototip care reunește datele invertorului, bateriei și contorului, ajută la identificarea unui incident și urmărește tichetul până la verificarea rezultatului. Aș începe cu instalatori care oferă mentenanță; interesul lor comercial rămâne de verificat.

Există deja integrări și automatizări locale. Trebuie să demonstrăm că produsul scurtează investigația și ajută la documentarea intervențiilor. Bateria descărcată sau producția sub așteptări nu indică automat un defect.

Următorul pas: reconstruirea a trei incidente recente de la cel puțin două firme, cu date autorizate, și compararea prototipului cu procesul actual. Vom urmări accesul la date, utilitatea alertelor și angajamentul pentru pilot. Verificarea facturilor și optimizarea bateriei pot urma după validare. Economiile financiare trebuie susținute de date și ipoteze verificabile.
