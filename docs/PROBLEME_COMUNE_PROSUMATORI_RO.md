# Probleme recurente ale prosumatorilor — cercetare din surse publice

**Verificat la:** 24 octombrie 2026. **Tema:** One Energy View — producție, consum, stocare, relația cu rețeaua și mentenanța.

**Bază documentară:** 37 de pagini/documente, din 18 domenii web distincte, descrise în registrul de la final. Acesta este numărul surselor consultate, nu numărul de prosumatori, interviuri sau incidente independente. Unele surse au fost disponibile doar prin fragmente indexate; accesul este declarat individual.

[Pagina proiectului](../README.md) · [Întrebări de interviu](INTREBARI_PROSUMATORI_RO.md) · [Battleplan](../CHALLENGE_1_ENERGY_BATTLEPLAN.md) · [Registru JSON al surselor](../data/energy-research/prosumer-problems-sources.json)

## Ce am găsit

Cele mai bine susținute teme recurente în materialele consultate sunt **facturarea/decontarea greu de urmărit**, **oprirea sau limitarea producției asociată tensiunii rețelei**, **neîncrederea în cifrele din aplicație versus contor/factură** și **dificultatea de a obține un diagnostic și un responsabil pentru rezolvare**.

Pentru One Energy View, prima problemă pe care merită să o testați este: **„Observ că energia nu se comportă cum mă aștept, dar nu pot stabili repede dacă este o problemă reală, ce date o demonstrează și cui trebuie să cer intervenția.”** Aceasta este sinteza noastră de cercetare, nu un citat și nu o concluzie deja validată comercial.

Nu am identificat în acest demers un sondaj reprezentativ care să permită un clasament procentual al tuturor problemelor prosumatorilor din România. „Comună” în acest raport înseamnă **recurentă în tipuri diferite de surse**, nu „afectează X% din piață”.

## 1. Metodă și limite

Am căutat în comunități românești Reddit și Softpedia, comunități tehnice Home Assistant, documentație de integrare GitHub, materiale ANRE/APCE, explicații ale furnizorului și operatorilor, manuale de producător, un studiu de industrie și interviuri din presă. Am păstrat relatări cu situații concrete și surse care explică mecanismul ori procesul; am eliminat rezultate despre telefoane/baterii de telefon, pagini comerciale generale și rezultate fără legătură.

Interpretarea dovezilor:

- **Relatare de utilizator:** arată ce spune o persoană că a trăit; cauza, configurația și costul pot rămâne neconfirmate.
- **Manual/FAQ oficial:** explică o posibilă cauză sau o limitare; nu măsoară frecvența problemei.
- **Asociație/studiu de industrie:** reflectă experiențe sau poziții ale unor părți interesate; nu presupunem neutralitate ori reprezentativitate.
- **Presă:** poate reproduce aceeași declarație APCE/EFdeN. O republicare nu este un incident independent în plus.
- **Comunități internaționale:** ajută la înțelegerea mecanismelor tehnice; nu stabilesc prevalența lor în România.

Nu am accesat postările grupului Facebook „Protecția Prosumatorului”. Raportul nu este un scrape al acelui grup. Nu am deduplicat persoane între platforme și nu am verificat instalațiile fizic. Comentariile din 2021–2024 dovedesc experiențe istorice, nu persistența automată a aceleiași probleme în octombrie 2026. Exemplele din 2025–2026 sunt marcate în registru.

Am evitat să folosesc un articol Reddit despre o presupusă scădere de 30% ca exemplu principal: comentariile ridică suspiciuni de conținut generat și nu există diagnostic verificabil. Am exclus și ghidurile care doar reformulează recomandări generale fără cazuri sau metodă.

**Nivelurile de mai jos sunt evaluări calitative ale susținerii documentare, nu scoruri statistice:** „convergență bună” = relatări și alt tip de sursă; „semnal de validat” = experiențe limitate sau dovezi predominant tehnice.

## 2. Harta problemelor

Ordinea este una de lectură și prioritizare pentru cercetare, nu un clasament național de frecvență.

| ID | Problema exprimată din perspectiva utilizatorului | Susținere documentară | Legătura cu One Energy View |
| --- | --- | --- | --- |
| P1 | „Nu știu ce mi s-a facturat, compensat sau plătit și ce sold am.” | Convergență bună; relatări istorice și materiale instituționale/asociative | Reconciliere și istoric; nu poate obliga furnizorul să plătească |
| P2 | „Am soare, dar invertorul se oprește sau nu pot injecta.” | Convergență bună; comunități, studiu de industrie, poziții publice | Detectare, cronologie și dovezi; nu repară rețeaua |
| P3 | „Aplicația, contorul și factura arată cifre pe care nu le pot împăca.” | Convergență bună; FAQ furnizor + comunități | Balanță energetică și proveniența măsurătorilor |
| P4 | „Nu știu cine trebuie să rezolve și pierd timp între interlocutori.” | Relatări concrete, cu experiențe pozitive ca termen de comparație | Dosar de incident și urmărirea intervenției |
| P5 | „Nu știu dacă producția mică este normală sau o defecțiune.” | Cazuri concrete + documentație tehnică; unele cauze neconfirmate | Referință corectă, verificări și alerte explicabile |
| P6 | „Nu înțeleg de ce bateria se încarcă/descarcă așa sau ce înseamnă SoC.” | Semnale românești și internaționale + manuale | Vizibilitate și diagnostic al setărilor; nu orice comportament este defect |
| P7 | „Nu pot folosi energia atunci când o produc; nu știu ce schimbare merită.” | Relatări despre autoconsum + materiale educaționale | Recomandări sub tariful real și constrângeri reale |
| P8 | „Nu am acces simplu și stabil la date; integrarea cere intervenții.” | Comunități tehnice + documentație maintainer/producător | Adaptoare, indicatori de prospețime și calitate |
| P9 | „Instalația este montată, dar pașii administrativi și activarea sunt neclare.” | Relatări + proceduri oficiale | Status și documente; parțial în afara MVP-ului energetic |
| P10 | „Configurația aleasă nu se potrivește cu nevoile sau extinderea mea.” | Comentarii concrete; eșantioane auto-selectate | Analiza consumului; limitat de hardware-ul deja instalat |
| P11 | „Mă așteptam la backup, dar sistemul are alte limite.” | Mai ales documentație și întrebări înainte de achiziție | Explicarea capabilităților; frecvența incidentelor nu este stabilită |
| P12 | „Cine vede datele și cine poate controla bateria?” | Discuții și presă + documentație de roluri | Consimțământ, permisiuni și încredere; semnal exploratoriu |

Sursele și limitele fiecărei teme sunt detaliate imediat mai jos; tabelul este sinteza noastră, nu rezultatul unui chestionar reprezentativ.

## 3. Problemele, cu dovezi și întrebări de verificare

### P1. Facturi întârziate, decontare și sold greu de urmărit

În discuții din 2023–2024 apar utilizatori care spun că nu primesc facturi sau nu înțeleg momentul decontării exportului. APCE descrie aceeași categorie de sesizări în 2024 și probleme de contractare/reconciliere în 2026. Acestea sunt relatări și poziții documentate, nu un verdict asupra tuturor furnizorilor. [S05 — experiență facturare](https://www.reddit.com/r/Romania/comments/1e1o2qv/facturi_neemise_din_2023_prosumator_hidroelectrica/), [S06 — discuție compensare](https://www.reddit.com/r/Romania/comments/15de9fs/prosumator_enel/), [S07 — APCE 2024](https://asociatiaprosumatorilor.ro/in-problema-facturilor-intarziate-anre-ii-ameninta-pe-furnizori-cu-un-pistol-cu-apa/), [S08 — APCE 2026](https://asociatiaprosumatorilor.ro/furnizorii-ti-au-luat-energia-fara-contract-si-nu-ti-au-platit-o/).

**Nevoia posibilă:** să știe ce perioadă și ce energie acoperă fiecare document, ce a fost reconciliat și ce nu. Nu trebuie confundată energia produsă de invertor cu energia livrată măsurată la contor.

**Întreabă:** „Cum ai verificat ultima factură și soldul pentru energia livrată? Ce document sau informație ți-a lipsit?”

**Dovadă de cerut:** facturi anonimizate, istoricul de import/export al contorului și sesizarea aferentă. Nu implementa reguli de azi copiind explicațiile legislative din comentarii vechi.

### P2. Opriri/limitări de producție asociate tensiunii rețelei

Un caz în limba română din 2021 descrie oprirea la export și investigații cu mai mulți interlocutori; amplasamentul nu este confirmat. O postare din 2025 descrie din nou producție întreruptă și sesizări. Softpedia discută supratensiune și interacțiunea cu bateria. AFEER tratează integrarea bidirecțională și calitatea tensiunii în studiul din ianuarie 2026. Nu preluăm cifrele de incidente din acel studiu drept prevalență națională verificată. [S01](https://www.reddit.com/r/Romania/comments/kv69o4), [S04](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/), [S02](https://forum.softpedia.com/topic/1232051-invertor-deye/page__st__2826), [S30](https://www.afeer.ro/pdf/studiu-2026.pdf).

**Nevoia posibilă:** dovadă temporală că pierderea de producție coincide cu un eveniment de rețea și un traseu de escaladare. O aplicație nu poate elimina singură o limitare fizică a rețelei.

**Întreabă:** „Povestește-mi ultima oprire când era soare. Ce arătau simultan tensiunea, producția și mesajele invertorului?”

**Dovadă de cerut:** intervale și alarme, măsurători cu proveniență clară, constatarea tehnicianului. Valorile istorice relatate nu sunt instrucțiuni pentru modificarea protecțiilor.

### P3. Cifre incompatibile între aplicație, contor, baterie și factură

FAQ-ul Hidroelectrica explică faptul că valorile aplicației și măsurarea de facturare pot diferi. În Home Assistant, un utilizator descrie un tablou de energie confuz și sensuri aparent inversate pentru baterie; documentația oficială explică diferența W/kWh și totaluri umflate de resetări asincrone. [S10 — FAQ](https://www.hidroelectrica.ro/article/835b1940-c0c9-b530-30de-f0fe959dc1e6), [S15 — experiență internațională](https://community.home-assistant.io/t/help-configuring-energy-with-huawei-solar-integration/838738), [S29 — documentație](https://www.home-assistant.io/docs/energy/faq/).

**Nevoia posibilă:** aceeași perioadă, unități și sensuri de flux, cu explicația punctului de măsurare și a datelor lipsă. Mai multe grafice nu rezolvă o balanță incorectă.

**Întreabă:** „Ultima dată când două cifre nu se potriveau, cum ai verificat dacă măsurau același lucru?”

**Dovadă de cerut:** capturi din același interval, definiția canalelor și configurația contorului. Nu promite egalitate perfectă între măsurători asincrone.

### P4. Diagnostic greoi și responsabilitate neclară

Un utilizator descrie trecerea între instalator, distribuitor și producător. În alt caz, autorul spune că a făcut mai multe sesizări fără contact tehnic. Aceste experiențe nu stabilesc culpa companiilor. Există și un contraexemplu în care un respondent relatează ticket automat și răspuns rapid din partea instalatorului. [S01](https://www.reddit.com/r/Romania/comments/kv69o4), [S04](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/), [S25 — experiențe inclusiv pozitive](https://www.reddit.com/r/Panouri_Fotovoltaice/comments/1u90ewc/c%C3%A2t_dureaz%C4%83_efectiv_instalarea/).

**Nevoia posibilă:** un caz cu date, verificări făcute, responsabil, termen și confirmarea rezolvării. Aici se leagă direct modelele GridVeda/kassi/HawkWatch din battleplan.

**Întreabă:** „La ultimul incident, care au fost pașii, cine a preluat fiecare pas și unde s-a pierdut cel mai mult timp?”

**Dovadă de cerut:** cronologie, mesaje sau tichet anonimizat și rezultatul intervenției. Un sumar AI nu înlocuiește constatarea.

### P5. Producție sub așteptări, fără certitudinea cauzei

Cazul PV2 arată descoperirea târzie a unui comportament perceput drept anormal. Autorul îl interpretează ca lipsă a jumătate dintre panouri, dar comentariile contestă configurația: **nu este o defecțiune de string confirmată**. SolarEdge explică faptul că vremea, umbrirea, rețeaua și comunicarea pot produce simptome diferite. [S04 — relatare și contradicții](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/), [S23 — suport producător](https://www.solaredge.com/us/support/system-owner/pv-production-and-system-issues).

**Nevoia posibilă:** o referință potrivită amplasamentului, condițiilor și istoricului sănătos, plus verificări înainte de alarmă. O curbă generică PVGIS nu dovedește un defect în vremea de azi.

**Întreabă:** „Cum ai decis ultima dată că producția era prea mică? Ce a confirmat sau infirmat suspiciunea?”

**Contraexemplu:** discuția despre primul an include producție stabilă și lipsa degradării observate; nu toate variațiile anuale sunt defecte. [S26](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/).

### P6. Comportamentul bateriei și SoC greu de interpretat

Softpedia descrie o interacțiune raportată între limitarea exportului și încărcarea bateriei. În EMHASS apar dificultăți de control și programe percepute drept nepotrivite. Manualele Victron și Fronius arată că sincronizarea/calibrarea poate influența interpretarea SoC. Aceste mecanisme nu dovedesc o problemă generală a bateriilor. [S02](https://forum.softpedia.com/topic/1232051-invertor-deye/page__st__2826), [S17](https://community.home-assistant.io/t/emhass-an-energy-management-for-home-assistant/338126?page=147), [S21](https://www.victronenergy.com/media/pg/SmartShunt/en/troubleshooting.html), [S22](https://manuals.fronius.com/html/4204260222/en.html).

**Nevoia posibilă:** explicație a fluxurilor, rezervei, programului și stării de măsurare. „Bateria nu se descarcă” poate însemna rezervă intenționată, limită BMS sau configurare, nu defect.

**Întreabă:** „La ultima situație în care bateria a făcut altceva decât te așteptai, ce setări și fluxuri ai verificat? Cine a confirmat explicația?”

**Dovadă de cerut:** SoC în timp, puteri de încărcare/descărcare, mod de operare, rezervă și concluzia instalatorului. Nu calcula bani pierduți ignorând intenția de backup.

### P7. Producție la prânz, consum în alt moment și rentabilitate neclară

Comentariile proprietarilor discută exportul mare și consumul propriu limitat, inclusiv diferențele sezoniere. Materialele EFdeN/energiaTa tratează autoconsumul ca problemă de proiectare și utilizare; scenariile lor nu sunt economii garantate. EMHASS arată atât posibilitatea automatizării, cât și complexitatea ei. [S26](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/), [S32](https://stirileprotv.ro/stiri/ilikeit/un-nou-ghid-gratuit-pentru-prosumatorii-din-romania-am-observat-ca-exista-niste-probleme.html), [S33](https://energiata.org/wp-content/uploads/2024/03/Ghidul-Prosumatorului-Sustenabil-teaser-4-martie.pdf), [S17](https://community.home-assistant.io/t/emhass-an-energy-management-for-home-assistant/338126?page=147).

**Nevoia posibilă:** o recomandare specifică și fezabilă pentru un consumator ori o baterie, cu economie calculată sub contractul real. Prețul PZU nu este automat tariful gospodăriei.

**Întreabă:** „Când ai mutat ultima dată un consum într-un alt interval? Ce ai câștigat și ce inconvenient a creat?”

**Dovadă de cerut:** consum orar, tarif, disponibilitatea aparatului și rezultatul real. Nu aplica procente de autoconsum ale unui ghid întregii piețe actuale.

### P8. Acces la date, integrare, firmware și lipsa actualizării

În comunitatea Huawei apar dificultăți de configurare și cazuri în care intervenția instalatorului/firmware-ul contează. Maintainerul integrării descrie condiții de conexiune și compatibilitate; manualul FusionSolar distinge roluri și permisiuni. SolarEdge separă explicit producția de comunicare. [S16](https://community.home-assistant.io/t/huawei-solar-integration/734391), [S18](https://github.com/wlcrs/huawei_solar), [S20](https://info.support.huawei.com/Energy/info/en_US/solar/docView/EDOC1100165054), [S23](https://www.solaredge.com/us/support/system-owner/pv-production-and-system-issues).

**Nevoia posibilă:** acces previzibil și un indicator clar „date vechi/indisponibile”. O valoare lipsă nu este zero producție. Comunitățile tehnice sunt un eșantion mai sofisticat decât proprietarul obișnuit.

**Întreabă:** „Ultima dată când aplicația nu mai actualiza, cum ai aflat dacă sistemul producea în continuare? Cine avea acces să verifice?”

**Implicație de produs:** validați accesul înainte de a promite conectarea oricărui Huawei/Deye/Fronius; păstrați un proprietar unic al sesiunii și statusul fiecărui canal.

### P9. Etape administrative, activare și contractare greu de urmărit

O relatare combină instalarea, întârzierile, statutul de prosumator și explicații contradictorii despre limitări. Materialele ANRE și Rețele Electrice arată că racordarea și contractarea au etape distincte. APCE semnalează și probleme privind contractul pentru energia livrată. Procedurile oficiale confirmă procesul, nu durata sau existența întârzierii în fiecare caz. [S04](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/), [S11](https://anre.ro/consumatori/energie-electrica/cum-devin-prosumator/), [S35](https://www.reteleelectrice.ro/informatii/cum-devii-prosumator/), [S08](https://asociatiaprosumatorilor.ro/furnizorii-ti-au-luat-energia-fara-contract-si-nu-ti-au-platit-o/).

**Nevoia posibilă:** să știe stadiul, documentul lipsă, responsabilul și ce mod de funcționare este autorizat. Este o problemă parțial diferită de monitorizarea unei instalații deja operaționale.

**Întreabă:** „După montaj, ce a mai trebuit să se întâmple până să folosești sistemul așa cum te așteptai? Unde ai aflat stadiul?”

**Decizie de scop:** nu construiți simultan un portal de racordare și un sistem de diagnostic fără să validați care nevoie este prioritară.

### P10. Dimensionare, compatibilitate și extinderi costisitoare

Discuția despre regrete include comentarii despre prețul bateriilor compatibile, capacitate și alegerea instalatorului. Discuțiile despre primul an și alegerea sistemului arată diferențe între producție anuală, necesar instantaneu și utilizarea sezonieră. Postarea inițială a sondajului sugerează explicit categorii de răspuns, deci nu o tratăm ca sondaj neutru. [S24](https://www.reddit.com/r/panourifotovoltaice/comments/1v8qlne/poll_cel_mai_mare_regret_legat_de_instalarea/), [S26](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/), [S27](https://www.reddit.com/r/panourifotovoltaice/comments/1r6exgs/ce_sistem_s%C4%83_aleg/).

**Nevoia posibilă:** o evaluare bazată pe utilizarea măsurată înainte de extindere. Un software nu schimbă puterea fizică sau compatibilitatea hardware.

**Întreabă:** „Ce nevoie nu acoperă configurația actuală? Când s-a văzut concret și ce soluție ai cerut deja?”

**Dovadă de cerut:** sarcini simultane, consum sezonier, specificații și ofertă de extindere. Nu repetați acuzații despre instalatori ca fapte confirmate.

### P11. Backup și autonomie înțelese diferit de proprietar

Manualul Fronius documentează condiții și limite ale funcției backup pentru modelele sale. Întrebările de achiziție arată că autonomia este o motivație, dar aceste surse nu stabilesc câți proprietari au avut efectiv un eșec de backup. [S22](https://manuals.fronius.com/html/4204260222/en.html), [discuție înainte de achiziție](https://www.reddit.com/r/Romania/comments/1l4112q).

**Nevoia posibilă:** să știe ce consumatori sunt acoperiți, cu ce rezervă și în ce condiții. O baterie instalată nu dovedește singură backup pentru toată casa.

**Întreabă:** „La ultima pană de curent, ce a alimentat sistemul și ce te așteptai să alimenteze?”

**Nivel de certitudine:** mecanism tehnic documentat; prevalență locală și durere comercială încă de validat. Nu prezentați această temă ca una dintre cele mai frecvente defecțiuni românești.

### P12. Controlul de la distanță, permisiuni și încredere

Discuția despre stimulente și controlul bateriilor include rezerve ale utilizatorilor privind disponibilitatea energiei proprii. Europa Liberă prezintă contextul unei propuneri de audit cibernetic. Manualul Huawei confirmă existența unor roluri/permisiuni. Niciuna nu demonstrează că o anumită instalație a fost compromisă. [S28](https://www.reddit.com/r/Romania/comments/1vr5qtg/prosumatorii_mesaj_pentru_bolojan_%C3%AEn_plin%C4%83_criz%C4%83/), [S34](https://romania.europalibera.org/a/33554532.html), [S20](https://info.support.huawei.com/Energy/info/en_US/solar/docView/EDOC1100165054).

**Nevoia posibilă:** control explicit asupra accesului și explicație pentru comenzile executate. Este o barieră de adopție de testat, nu o dovadă că majoritatea refuză automatizarea.

**Întreabă:** „Cui ai dat acces ultima dată la sistem și pentru ce operațiuni? Ce ai ales să nu permiți?”

**Implicație:** începeți cu citire și recomandări; validați separat acceptarea comenzilor, rezervei și condițiilor comerciale.

## 4. Citate scurte pentru orientarea interviurilor

Acestea sunt citate publicate online, **nu interviuri realizate de echipă**, iar relatarea nu confirmă automat cauza tehnică. Păstrăm textul original; nu corectăm unitățile din citate și nu le folosim ca măsurători verificate.

| Sursă | Citat exact | Ce susține / ce nu susține |
| --- | --- | --- |
| [S05](https://www.reddit.com/r/Romania/comments/1e1o2qv/facturi_neemise_din_2023_prosumator_hidroelectrica/) | „iar asta a fost ultima luna in care am primit factura de la ei.” | Experiență relatată în 2024; nu rata actuală a întârzierilor. |
| [S06](https://www.reddit.com/r/Romania/comments/15de9fs/prosumator_enel/) | „Nu am nici cea mai mica idee daca si cand o sa primesc vreo factura.” | Incertitudine de facturare; nu confirmarea unei încălcări legale. |
| [S04](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/) | „dar nu mi-am dat seama imediat (nu mă pricep deloc la partea tehnică).” | Descoperire târzie percepută; diagnosticul PV2 rămâne neconfirmat. |
| [S01](https://www.reddit.com/r/Romania/comments/kv69o4) | „vina este aruncata de la unii la altii :(” | Fricțiune între interlocutori; locația instalației nu este confirmată. |
| [S02](https://forum.softpedia.com/topic/1232051-invertor-deye/page__st__2826) | „Invertorul reduce puterea DC-AC conform V(W), dar nu reduce puterea PV.” | Observație tehnică a unui participant; nu un defect de model confirmat. |
| [S16](https://community.home-assistant.io/t/huawei-solar-integration/734391) | „cannot find household consumption” | Dificultate de integrare internațională; nu sondaj românesc. |
| [S17](https://community.home-assistant.io/t/emhass-an-energy-management-for-home-assistant/338126?page=147) | „the coding is a nightmare :-(.” | Efort perceput de automatizare; nu lipsa tuturor soluțiilor existente. |
| [S26](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/) | „Nu am observat nicio degradare.” | Contraexemplu: există și experiențe stabile, fără problema presupusă. |

## 5. Ce merită testat întâi pentru One Energy View

Evaluare proprie pe baza dovezilor de mai sus; nu este un rezultat de piață măsurat.

| Prioritate | Ipoteza de problemă | Testul imediat | Ce ar invalida direcția |
| --- | --- | --- | --- |
| 1 | Proprietarul/O&M nu poate transforma o scădere de producție într-un caz verificabil și o intervenție. | Cereți trei incidente recente, datele anterioare și rezultatul cunoscut. Reconstruiți cronologia fără a sugera cauza. | Platforma actuală rezolvă deja repede, datele lipsesc sau nu există consecință importantă. |
| 2 | Persoana nu poate reconcilia producția, import/export și factura. | Un caz anonimizat, aceleași intervale, canale bine definite; comparați cu metoda actuală. | Diferența se explică ușor, iar utilizatorul nu depune efort relevant. |
| 3 | Programul bateriei/consumului este greu de adaptat nevoilor reale. | Interviu cu proprietar BESS și o schimbare făcută deja; comparație cu rezervă și tarif reale. | Rezerva este intenționată, tariful nu susține economia sau schimbarea afectează prea mult confortul. |

**Formulare de problemă de verificat:** „Când observ o abatere în producție sau consum, nu pot demonstra rapid dacă este o problemă de echipament, rețea, configurare ori date și nu am un traseu clar până la rezolvare.”

Nu vindeți încă „predicție de defect cu zile înainte”, „economii exacte” sau „compatibilitate cu orice invertor”. Acestea necesită date și teste distincte. Nu confundați o problemă importantă pentru consumator cu una pe care produsul o poate rezolva: facturile lipsă și tensiunea rețelei pot avea responsabili externi.

## 6. Cum adăugăm concluziile în formular fără să influențăm răspunsurile

Puneți întâi o întrebare liberă despre ultimul incident. Abia apoi o listă neutră de categorii, cu „Altceva” și „Nu am întâmpinat dificultăți”.

1. „Ai deja un sistem fotovoltaic în funcțiune? Ai baterie? Ce rol ai în utilizarea/mentenanța lui?”
2. „Descrie ultima situație în care ai avut o nelămurire sau sistemul nu s-a comportat cum te așteptai.”
3. „Când s-a întâmplat și cum ai observat?”
4. „Ce ai făcut ca să înțelegi și să rezolvi situația?”
5. „Ce consecințe a avut, dacă a avut? Cum ai stabilit impactul?”
6. „Ce instrument sau persoană te-a ajutat și ce a rămas neclar?”
7. „Ai fi disponibil pentru o discuție scurtă despre acest caz?” — contact opțional.

Analizați separat gospodării, firme și tehnicieni. Un respondent poate relata mai multe teme; o postare și comentariile ei nu formează un eșantion independent de zeci de instalații. Urmăriți și experiențe fără incidente, fără a deduce rata de satisfacție din acest demers exploratoriu.

## 7. Registrul celor 37 de surse

„Fragment indexat” înseamnă că afirmațiile folosite au fost vizibile în rezultatul de căutare, dar nu pretindem lectura integrală a paginii. Documentele oficiale și manualele susțin procese/mecanisme, nu frecvențe ale durerii. Nicio sursă nu este prezentată ca interviu al echipei.

| ID | Pagină / document | Tip | Data materialului | Acces în această cercetare | Limită principală |
| --- | --- | --- | --- | --- | --- |
| S01 | [Supratensiune și responsabilitate între instalator/distribuitor](https://www.reddit.com/r/Romania/comments/kv69o4) | Relatare utilizator | 2021-01-11 | pagină deschisă | Română; amplasamentul nu este confirmat, autorul precizează că nu este conținut legat de România. |
| S02 | [Invertor Deye — discuție supratensiune/BMS, pagina 158](https://forum.softpedia.com/topic/1232051-invertor-deye/page__st__2826) | Discuție tehnică utilizatori | 2026-06-13 | pagină deschisă | Comunitate în română; simptome raportate, fără diagnostic independent. |
| S03 | [Probleme tehnice cauzate de prosumatori — pagina 2](https://forum.softpedia.com/topic/1250102-probleme-tehnice-cauzate-de-prosumatori/page__st__18) | Discuție utilizatori | 2025-07-19 | fragment indexat; pagina directă a dat eroare de decodare | Include vecini/consumatori, nu exclusiv prosumatori; acuzațiile nu sunt verificate. |
| S04 | [Probleme prosumator — producție, PV2, sesizări și racordare](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/) | Relatare utilizator | 2025-11-08 | pagină deschisă | PV2 inactiv nu demonstrează singur un string defect; configurația este contestată în comentarii. |
| S05 | [Facturi neemise din 2023 — prosumator Hidroelectrica](https://www.reddit.com/r/Romania/comments/1e1o2qv/facturi_neemise_din_2023_prosumator_hidroelectrica/) | Relatare utilizator | 2024-07-12 | pagină deschisă | Cazuri istorice și unități scrise informal; nu descriu obligatoriu situația actuală. |
| S06 | [Prosumator Enel — facturi și compensare neclare](https://www.reddit.com/r/Romania/comments/15de9fs/prosumator_enel/) | Relatare utilizator | 2023-07-30 | pagină deschisă | Comentarii din 2023–2024; nu folosi explicațiile juridice ca reguli actuale. |
| S07 | [APCE — facturi întârziate](https://asociatiaprosumatorilor.ro/in-problema-facturilor-intarziate-anre-ii-ameninta-pe-furnizori-cu-un-pistol-cu-apa/) | Asociație prosumatori | 2024-04-05 | pagină deschisă | Poziție a unei părți interesate; volumele reclamate nu sunt eșantionul nostru. |
| S08 | [APCE — energie livrată fără contract/compensare](https://asociatiaprosumatorilor.ro/furnizorii-ti-au-luat-energia-fara-contract-si-nu-ti-au-platit-o/) | Asociație prosumatori | 2026-03-19 | pagină deschisă | Semnale de reconciliere și contractare; argumentele juridice sunt ale asociației. |
| S09 | [APCE — schimbarea furnizorului](https://asociatiaprosumatorilor.ro/schimbarea-furnizorului-de-energie-pentru-prosumatori-nu-este-ca-si-cum-ai-emigra-din-romania/) | Asociație prosumatori | 2024-12-07 | fragment indexat | Aceeași familie de surse ca S07/S08; nu reprezintă încă un eșantion independent. |
| S10 | [Hidroelectrica — întrebări frecvente prosumatori](https://www.hidroelectrica.ro/article/835b1940-c0c9-b530-30de-f0fe959dc1e6) | Furnizor; FAQ oficial | nedatată | fragment indexat; deschiderea directă a expirat | Confirmă distincția dintre aplicație și contor; explicațiile de facturare pot reflecta regimuri istorice. |
| S11 | [ANRE — Cum devin prosumator](https://anre.ro/consumatori/energie-electrica/cum-devin-prosumator/) | Autoritate | actualizare afișată 2026-10-14 | pagină deschisă | Roluri instituționale și rapoarte; nu este o anchetă despre frecvența durerilor. |
| S12 | [ANRE — documente de discuție pentru prosumatori](https://anre.ro/category/documente-de-discutie/energie-electrica/prosumatori/) | Autoritate; consultări | 2026-08/09 | pagină deschisă | Consultările sunt proiecte; nu le eticheta norme finale în vigoare. |
| S13 | [ANRE — răspuns privind petiții și reglementări](https://anre.ro/comunicat-de-presa-reglementarile-anre-trebuie-sa-respecte-legislatia-primara-autoritatea-nu-poate-dribla-pe-langa-lege-iar-apce-stie-foarte-bine-acest-lucru-anre-atrage-atentia/) | Autoritate; poziție oficială | 2025-08-11 | fragment indexat | Petițiile descrise provin dintr-un demers coordonat; nu sunt o estimare de prevalență. |
| S14 | [APCE — complexitatea normelor propuse](https://asociatiaprosumatorilor.ro/legea-prosumatorului-de-o-jumatate-de-pagina-ingropata-in-61-de-pagini-de-norme-parca-scrise-dupa-dictarea-furnizorilor/) | Asociație prosumatori | 2026-08-23/24 | fragment indexat | Critică a asociației; nu dovedește singură nelegalitatea normelor. |
| S15 | [Home Assistant — configurare energie Huawei](https://community.home-assistant.io/t/help-configuring-energy-with-huawei-solar-integration/838738) | Relatare utilizator; internațional | 2025-01-30 | pagină deschisă | Utilizator din Italia; exemplu de configurare, nu frecvență în România. |
| S16 | [Home Assistant — Huawei solar integration](https://community.home-assistant.io/t/huawei-solar-integration/734391) | Discuție utilizatori; internațional | 2024–2025 | pagină deschisă | Include configurare, firmware și rezolvări; nu toate mesajele sunt reclamații. |
| S17 | [Home Assistant — EMHASS, pagina 147](https://community.home-assistant.io/t/emhass-an-energy-management-for-home-assistant/338126?page=147) | Discuție utilizatori; internațional | 2024-12/2025-01 | pagină deschisă | Automatizatori tehnici cu tarife diferite de cele românești. |
| S18 | [Huawei Solar — documentația integrării Modbus](https://github.com/wlcrs/huawei_solar) | Documentație maintainer | nedatată; versiune curentă consultată | pagină deschisă | Condiții tehnice ale integrării, nu rata problemelor pentru toate echipamentele Huawei. |
| S19 | [Huawei Solar — Elevated Permission #879](https://github.com/wlcrs/huawei_solar/discussions/879) | Discuție utilizatori | 2025-01/2026-01 | fragment indexat | Două întrebări despre configurare; nu un eșantion de proprietari. |
| S20 | [Huawei — FusionSolar App User Manual](https://info.support.huawei.com/Energy/info/en_US/solar/docView/EDOC1100165054) | Producător; manual | ediție 2026-06-30; publicare afișată 2026-09-30 | pagină deschisă | Roluri și permisiuni diferite; disponibilitatea depinde de produs/contract. |
| S21 | [Victron — SmartShunt troubleshooting](https://www.victronenergy.com/media/pg/SmartShunt/en/troubleshooting.html) | Producător; manual | nedatată | pagină deschisă | Mecanisme de citire/estimare SoC; nu statistici despre defectarea bateriilor. |
| S22 | [Fronius — Energy Package operating instructions](https://manuals.fronius.com/html/4204260222/en.html) | Producător; manual | copyright afișat 2025 | pagină deschisă | Calibrare și limitări backup pentru modelele documentate, nu toate sistemele. |
| S23 | [SolarEdge — PV Production and System Issues](https://www.solaredge.com/us/support/system-owner/pv-production-and-system-issues) | Producător; suport | nedatată | pagină deschisă | Producția și comunicația sunt distincte; documentație SUA, mecanism tehnic general. |
| S24 | [Regrete după instalare — discuție proprietari](https://www.reddit.com/r/panourifotovoltaice/comments/1v8qlne/poll_cel_mai_mare_regret_legat_de_instalarea/) | Discuție utilizatori | 2026-07/08 | pagină deschisă | Întrebarea inițială sugerează răspunsuri; folosim comentarii concrete, nu un sondaj reprezentativ. |
| S25 | [Cât durează instalarea — inclusiv experiențe pozitive](https://www.reddit.com/r/Panouri_Fotovoltaice/comments/1u90ewc/c%C3%A2t_dureaz%C4%83_efectiv_instalarea/) | Discuție utilizatori | 2026-06 | pagină deschisă | Există și relatări de suport rapid; nu toate firmele sau instalațiile au probleme. |
| S26 | [Primul an cu fotovoltaice — producție și autoconsum](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/) | Discuție utilizatori | 2026-03/04 | pagină deschisă | Include producție stabilă și satisfacție; cifrele personale nu sunt auditate. |
| S27 | [Ce sistem să aleg — iarnă și dimensionare](https://www.reddit.com/r/panourifotovoltaice/comments/1r6exgs/ce_sistem_s%C4%83_aleg/) | Discuție utilizatori | 2026-02/03 | fragment indexat | Amestecă întrebări înainte de achiziție cu experiențe reale; unități uneori greșite. |
| S28 | [Controlul bateriilor și acceptarea stimulentelor](https://www.reddit.com/r/Romania/comments/1vr5qtg/prosumatorii_mesaj_pentru_bolojan_%C3%AEn_plin%C4%83_criz%C4%83/) | Discuție utilizatori | 2026-08 | fragment indexat | Discuție politizată, tarife/unități contradictorii; semnal exploratoriu despre control și rezervă. |
| S29 | [Home Assistant — FAQ energy management](https://www.home-assistant.io/docs/energy/faq/) | Documentație oficială software | nedatată; versiune curentă consultată | pagină deschisă | Explică dublări, resetări, putere versus energie; nu sondaj. |
| S30 | [Studiu AFEER — integrarea prosumatorilor în rețea](https://www.afeer.ro/pdf/studiu-2026.pdf) | Studiu de industrie | 2026-01 | PDF deschis; secțiuni relevante indexate | Perspectivă a industriei furnizorilor; metodologia cifrelor despre incidente nu a fost auditată. |
| S31 | [Național — interviu APCE despre deconectări](https://national.ro/actualitate/smecherii-cu-energia-prosumatorii-expulzati-din-sistem-si-obligati-sa-consume-din-retea/) | Presă; interviu cu asociație | 2026-03-09 | fragment indexat | Aceeași voce APCE; suspiciunile de intenție nu sunt fapte confirmate. |
| S32 | [Știrile ProTV — EFdeN și ghidul prosumatorului](https://stirileprotv.ro/stiri/ilikeit/un-nou-ghid-gratuit-pentru-prosumatorii-din-romania-am-observat-ca-exista-niste-probleme.html) | Presă; interviu EFdeN | 2024-06-13 | fragment indexat | Context educațional istoric; nu reutilizăm procentele drept statistici actuale. |
| S33 | [energiaTa — ghidul prosumatorului sustenabil, teaser](https://energiata.org/wp-content/uploads/2024/03/Ghidul-Prosumatorului-Sustenabil-teaser-4-martie.pdf) | Ghid educațional; organizație | 2024 | fragment PDF indexat | Scenarii/modelare, nu economii observate în cohorta noastră. |
| S34 | [Europa Liberă — acces și securitate echipamente](https://romania.europalibera.org/a/33554532.html) | Presă | 2025-10-08 | fragment indexat | Context despre propuneri de audit; nu dovedește compromiterea unei instalații sau o lege finală. |
| S35 | [Rețele Electrice — Cum devii prosumator](https://www.reteleelectrice.ro/informatii/cum-devii-prosumator/) | Operator distribuție | nedatată | fragment indexat | Etape și conformitate; nu măsoară timpul efectiv al fiecărui dosar. |
| S36 | [Delgaz — indicatori de performanță 2024](https://delgaz.ro/getattachment/e7f7e922-1412-4b2f-be2a-ff7981f72b76/Indicatori-de-performanta-2024.pdf) | Operator distribuție; raport | 2024 | fragment PDF indexat | Indicatori pentru utilizatori în general; nu echivala cu reclamații exclusiv de prosumatori. |

| S37 | [Prosumator 2025 — recomandare și autonomie](https://www.reddit.com/r/Romania/comments/1l4112q) | Discuție utilizatori | 2025-06-05 | fragment indexat | Întrebări înainte de achiziție și opinii despre autonomie; nu incident demonstrat de backup. |

### Ce nu afirmă acest raport

Nu afirmă că au fost analizate toate sursele de pe internet, că am extras întregul conținut Facebook, că toate reclamațiile sunt adevărate, că un producător/furnizor este vinovat sau că sursele din aceeași organizație sunt independente. Nu estimează procentul prosumatorilor afectați. Rolul lui este să aleagă întrebări și cazuri pentru validare directă, cu dovezi și contraexemple.
