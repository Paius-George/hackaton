# Problemele prosumatorilor din România — dovezi pentru One Energy View

**Verificat: 24 octombrie 2026. Bază documentară: 55 de pagini/documente, din 26 de domenii web. Exclusiv context românesc.**

[Proiect](../README.md) · [Întrebări de interviu](INTREBARI_PROSUMATORI_RO.md) · [Battleplan](../CHALLENGE_1_ENERGY_BATTLEPLAN.md) · [Registru JSON cu proveniență](../data/energy-research/prosumer-problems-sources.json)

Problemele care reapar în tipuri diferite de surse sunt **facturarea și decontarea greu de urmărit, opririle producției, diferențele dintre aplicație și contor/factură și obținerea unui diagnostic sau a unei intervenții**. În jurul bateriilor apar și probleme de dimensionare, compatibilitate, cost și înțelegere a autonomiei.

Pentru hackathon, direcția de testat este: **prosumatorul vede o anomalie, dar îi este greu să demonstreze ce s-a întâmplat, cât îl afectează și cine trebuie să intervină**. Este interpretarea noastră, încă de validat prin interviuri și date reale.

## 1. Ce înseamnă „doar România” și cum citim dovezile

Am păstrat publicații și instituții românești, documente ale furnizorilor/distribuitorilor din România și discuții despre instalații, programe sau furnizori români. Reddit și GitHub au domenii internaționale, însă paginile incluse tratează România; nu am folosit experiențe din alte țări. Domiciliul fiecărui comentator anonim nu poate fi confirmat.

Am eliminat din această bază de dovezi discuțiile internaționale Home Assistant, manualele generale Huawei/Fronius/Victron/SolarEdge, exemplele cu localizare incertă și indicatorii generali de reclamații care nu identifică prosumatorii. Versiunea anterioară este păstrată în arhivă.

**55 de documente nu înseamnă 55 de prosumatori sau 55 de incidente independente.** Unele sunt explicații oficiale, altele poziții instituționale, iar câteva republică aceeași declarație. Nu avem un sondaj reprezentativ și nu putem afirma procente naționale sau un clasament statistic. Ordinea de mai jos este o prioritate calitativă de cercetare.

- **Relatări personale:** bune pentru întrebări și identificarea situațiilor; cauza și costul nu sunt automat verificate.
- **Cazuri din presă:** verificăm dacă jurnalistul are un caz propriu, un răspuns de companie sau doar un comunicat.
- **ANRE, furnizori și distribuitori:** explică procesul ori mecanismul, fără să măsoare frecvența durerii.
- **APCE și AFEER:** surse relevante, cu interese și perspective proprii. Un interviu APCE reluat de trei publicații nu este trei confirmări independente.
- **Ghiduri, exemple de facturi și instrumente software:** context și soluții existente, fără a le număra drept clienți nemulțumiți.

Registrul indică accesul: pagină deschisă sau numai fragment indexat. Nu am accesat direct postările grupurilor Facebook; unele articole citează astfel de postări și sunt marcate. Nu colectăm numere de telefon, profiluri sau date personale ale participanților.

## 2. Probleme recurente și dovezi românești

### P1. Nu știu ce mi s-a facturat, ce mi se datorează și când primesc banii

Există relatări istorice despre facturi neemise și incertitudine privind compensarea. Cazul unui prosumator din Prahova include o cronologie a sesizărilor și răspunsul ENGIE: incompatibilitatea unei oferte combinate a necesitat separarea contractelor, iar facturarea a fost reluată. În 2025, un jurnalist din Prahova descrie și propria experiență de prosumator. Nu presupunem că fiecare caz istoric este încă nerezolvat. [RO02 — Facturi neemise din 2023 — prosumator Hidroelectrica](https://www.reddit.com/r/Romania/comments/1e1o2qv/facturi_neemise_din_2023_prosumator_hidroelectrica/), [RO03 — Prosumator Enel — facturi și compensare neclare](https://www.reddit.com/r/Romania/comments/15de9fs/prosumator_enel/), [RO25 — Digi24 — prosumatori care așteaptă facturarea](https://www.digi24.ro/stiri/economie/energie/mii-de-prosumatori-spun-ca-sunt-inselati-de-stat-desi-dau-energie-in-retea-oamenii-se-plang-ca-nu-si-primesc-banii-2745811), [RO38 — Gândul — cazul Petru din Prahova și răspunsul ENGIE](https://www.gandul.ro/actualitate/pe-1-octombrie-2022-petru-din-prahova-a-incheiat-un-contract-de-prosumator-cu-engie-ce-a-patit-acum-dupa-4-luni-19924461), [RO26 — Observatorul Prahovean — experiență Electrica și interviu APCE](https://www.observatorulph.ro/exclusiv/2771902-prosumatorii-victimele-sistemului-produc-energie-dar-sunt-arsi-la-facturi)

**De cerut la interviu:** ultima perioadă lipsă, facturile anonimizate, cantitățile măsurate, data sesizării și răspunsul primit. **Utilitate posibilă:** cronologie import/export–facturi–sold–sesizări, cu evidențierea perioadelor lipsă. Un dashboard nu poate forța furnizorul să emită factura.

### P2. Producția se întrerupe exact în orele însorite

Un utilizator descrie opriri și tensiune ridicată, iar cazul din Buzeni apare într-o comunicare parlamentară care relatează răspunsul Delgaz. Economedia prezintă și poziția ANRE despre protecțiile invertoarelor. Presa și APCE discută fenomenul, dar amploarea lui nu poate fi dedusă din numărul articolelor. Nu avem raportul original de măsurare pentru toate aceste cazuri. [RO01 — Probleme prosumator — producție, PV2, sesizări și racordare](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/), [RO27 — Senat — cazul de tensiune din Buzeni](https://www.senat.ro/StiriSenatDetaliu.aspx?ID=B4FF3044-4015-4D07-8DD5-D459D3A90237), [RO30 — Economedia — ANRE despre setările invertoarelor](https://economedia.ro/avertisment-de-la-anre-prosumatorii-care-modifica-softul-invertoarelor-vor-fi-deconectati-de-la-retea-si-amendati.html), [RO55 — ProTV — opriri în intervalele de producție mare](https://stirileprotv.ro/stiri/pro-verde/panouri-fotovoltaice-oprite-automat-de-ce-prosumatorii-din-romania-pierd-energie-in-orele-de-varf.html), [RO16 — Studiu AFEER — integrarea prosumatorilor în rețea](https://www.afeer.ro/pdf/studiu-2026.pdf)

**De cerut:** jurnalul de evenimente, tensiunile pe faze, puterea PV/import/export pe același interval și răspunsul distribuitorului. **Utilitate posibilă:** dosar cu opriri și context, trimis către responsabilul potrivit. O simplă cădere de producție nu demonstrează cauza. Nu recomandăm modificarea protecțiilor electrice.

### P3. Aplicația invertorului, contorul și factura par să spună lucruri diferite

Furnizorii explică faptul că fluxurile facturate nu sunt identice cu producția totală. E.ON descrie și situația în care datele de măsură nu ajung la furnizor, rezultând estimări și lipsa injecției din factura estimată. Energis publică două exemple de facturi anonimizate; sunt cazuri explicative comerciale, fără auditul nostru asupra contractelor. [RO07 — Hidroelectrica — întrebări frecvente prosumatori](https://www.hidroelectrica.ro/article/835b1940-c0c9-b530-30de-f0fe959dc1e6), [RO42 — E.ON — ghid și întrebări de facturare](https://www.eon.ro/info-prosumatori), [RO33 — Energis — două facturi Hidroelectrica explicate](https://www.energis.ro/compensare-prosumatori-facturi-hidroelectrica/), [RO51 — ENGIE — model explicat al facturii de consum](https://www.engie.ro/wp-content/uploads/2024/01/factura_consum_prosumatori.pdf)

**De cerut:** exportul din aplicație, indexurile contorului și o factură pentru exact aceeași perioadă. **Utilitate posibilă:** separarea vizibilă a producției, autoconsumului, încărcării/descărcării bateriei și schimbului cu rețeaua; reconciliere cu proveniența fiecărei valori. Diferența nu trebuie etichetată automat „eroare” sau „furt”.

### P4. Nu știu cui să cer ajutor și cât durează rezolvarea

Există reclamații despre sesizări fără rezolvare rapidă, dar și comentarii despre instalatori care răspund și rezolvă. Cazul ENGIE din Prahova arată că o problemă aparent de facturare avea și o componentă contractuală. Acestea cer triere, nu un diagnostic universal. [RO01 — Probleme prosumator — producție, PV2, sesizări și racordare](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/), [RO13 — Cât durează instalarea — inclusiv experiențe pozitive](https://www.reddit.com/r/Panouri_Fotovoltaice/comments/1u90ewc/c%C3%A2t_dureaz%C4%83_efectiv_instalarea/), [RO32 — Reddit — alegerea instalatorului în Ilfov](https://www.reddit.com/r/panourifotovoltaice/comments/1tje4op/recomandare/), [RO38 — Gândul — cazul Petru din Prahova și răspunsul ENGIE](https://www.gandul.ro/actualitate/pe-1-octombrie-2022-petru-din-prahova-a-incheiat-un-contract-de-prosumator-cu-engie-ce-a-patit-acum-dupa-4-luni-19924461)

**De cerut:** primul semn observat, primul contact, fiecare transfer între echipe, timpul până la diagnostic și rezultatul intervenției. **Utilitate posibilă:** ticket cu istoric, date lipsă și ipoteze ordonate; validarea cauzei de către tehnician.

### P5. Nu pot spune dacă produc puțin din cauza vremii sau a unei probleme

O relatare despre intrarea PV2 inactivă generează explicații contradictorii în comentarii: nu este suficientă pentru a confirma un string defect. Alte experiențe locale descriu producție stabilă, fără degradare observată. Avem o problemă de interpretare plauzibilă; nu avem dovada că degradarea ascunsă afectează frecvent instalațiile rezidențiale din România. [RO01 — Probleme prosumator — producție, PV2, sesizări și racordare](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/), [RO14 — Primul an cu fotovoltaice — producție și autoconsum](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/)

**De cerut:** orientarea și puterea sistemului, umbrirea, istoricul, evenimentele și o verificare tehnică. **Utilitate posibilă:** alertă de abatere față de propriul istoric și instalații comparabile. PVGIS istoric oferă un reper modelat; singur nu este o măsurătoare a vremii actuale și nu dovedește o defecțiune.

### P6. Bateria nu acoperă perioada pentru care am cumpărat-o

Un prosumator din zona montană a Transilvaniei descrie o baterie de 5 kWh care ajunge la rezerva configurată înainte de dimineață iarna, deși în alte perioade situația diferă. Discuțiile despre regrete și alegeri includ capacitate, extindere și compatibilitate. Descărcarea până la rezerva configurată nu dovedește un defect al bateriei. [RO48 — Reddit — zece luni cu Fronius, BYD și automatizări](https://www.reddit.com/r/panourifotovoltaice/comments/1tc7hru/experien%C8%9Ba_primelor_10_luni_cu_panouri/), [RO12 — Regrete după instalare — discuție proprietari](https://www.reddit.com/r/panourifotovoltaice/comments/1v8qlne/poll_cel_mai_mare_regret_legat_de_instalarea/), [RO49 — Reddit — regrete după instalare, discuția din aprilie](https://www.reddit.com/r/panourifotovoltaice/comments/1slyjvg/poll_cel_mai_mare_regret_legat_de_instalarea/)

**De cerut:** profilul nocturn, rezerva setată, energia efectiv disponibilă și ultimele zile în care bateria nu a ajuns. **Utilitate posibilă:** autonomie estimată pe sezon și explicația utilizării bateriei. Nu am confirmat din această cercetare românească o prevalență a „SoC drift” sau a descărcării la ore greșite.

### P7. Nu știu când să consum și dacă automatizarea merită efortul

Există deja o experiență românească de automatizare cu Fronius, BYD, contoare Shelly și Home Assistant. Alte discuții din Ilfov descriu consum diurn/încărcare auto fără baterie. Acestea sunt contraexemple utile pentru ideea că nimeni nu unește datele sau că fiecare gospodărie are nevoie de aceeași optimizare. [RO48 — Reddit — zece luni cu Fronius, BYD și automatizări](https://www.reddit.com/r/panourifotovoltaice/comments/1tc7hru/experien%C8%9Ba_primelor_10_luni_cu_panouri/), [RO36 — Reddit — sistem fotovoltaic în Buftea](https://www.reddit.com/r/panourifotovoltaice/comments/1vdkt5v/sfaturi_pentru_instalarea_panourilor_fotovoltaice/), [RO44 — Europa Liberă — tarife diferențiate și autoconsum](https://romania.europalibera.org/a/consum-diferentiat-de-energie-electrica-prosumatori/33534035.html), [RO19 — energiaTa — ghidul prosumatorului sustenabil, teaser](https://energiata.org/wp-content/uploads/2024/03/Ghidul-Prosumatorului-Sustenabil-teaser-4-martie.pdf)

**De cerut:** ultimul consum mutat în alt interval, cum a decis persoana, ce efort a făcut și ce rezultat poate demonstra. **Utilitate posibilă:** recomandare pe consumul și contractul propriu. Nu echivalăm prețul OPCOM cu tariful de pe factura oricărui prosumator și nu promitem economii exacte fără datele reale.

### P8. Costul și compatibilitatea bateriei limitează alegerile

HotNews documentează nemulțumiri privind echipamentele oferite prin vouchere și include răspunsuri ale instalatorilor. Acuzațiile privind omologarea trebuie păstrate ca acuzații, nu diagnostice stabilite de noi. Alte discuții locale pun în evidență alegerea instalatorului și posibilitatea de extindere. [RO24 — HotNews — reclamații despre bateriile prin voucher](https://hotnews.ro/o-mare-golaneala-prosumatorii-care-primesc-vouchere-pentru-baterii-de-stocare-acuza-ca-instalatorii-le-monteaza-produse-ieftine-si-neomologate-ministerul-ii-trimite-pe-oameni-sa-s-2070469), [RO32 — Reddit — alegerea instalatorului în Ilfov](https://www.reddit.com/r/panourifotovoltaice/comments/1tje4op/recomandare/), [RO34 — Reddit roFrugal — alegerea firmei pentru fotovoltaice](https://www.reddit.com/r/roFrugal/comments/1nj7ezt/cum_va%C8%9Bi_hot%C4%83r%C3%A2t_%C8%99i_ales_o_firm%C4%83_pentru/)

**De cerut:** ofertele și modelul exact, alternativele refuzate, condițiile de garanție și cine gestionează suportul. **Utilitate posibilă:** identificarea configurației și a limitelor reale; nu promitem că software-ul rezolvă o incompatibilitate hardware.

### P9. Pașii de racordare și contractare sunt greu de urmărit

Ghidurile ANRE și ale distribuitorilor separă racordarea de contractul comercial. APCE relatează cazuri în care energia livrată nu este decontată și există dispute privind contractele. Ghidul oficial dovedește existența pașilor, nu că fiecare client întâmpină o întârziere. [RO08 — ANRE — Cum devin prosumator](https://anre.ro/consumatori/energie-electrica/cum-devin-prosumator/), [RO21 — Rețele Electrice — Cum devii prosumator](https://www.reteleelectrice.ro/informatii/cum-devii-prosumator/), [RO31 — DEER — ghidul prosumatorului](https://www.distributie-energie.ro/wp-content/uploads/2023/12/Ghidul-prosumatorului.pdf), [RO45 — DEER — pașii pentru racordare](https://www.distributie-energie.ro/ghid-racordare-la-retea/), [RO05 — APCE — energie livrată fără contract/compensare](https://asociatiaprosumatorilor.ro/furnizorii-ti-au-luat-energia-fara-contract-si-nu-ti-au-platit-o/), [RO52 — ENGIE — întrebări frecvente](https://www.engie.ro/intrebari-frecvente/)

**De cerut:** documentul lipsă, data depunerii, stadiul confirmat și ultima acțiune făcută. **Utilitate posibilă:** traseu cu documente și responsabil, dacă această problemă se dovedește prioritară față de monitorizarea energetică.

### P10. Regulile se schimbă și nu știu ce se aplică instalației mele

Consultările ANRE, criticile APCE și explicațiile furnizorilor arată nevoia de context contractual și temporal. În cazul finanțării bateriilor, criticile din august 2026 se refereau la un proiect; Ministerul Mediului a anunțat forma finală în septembrie, cu modificări. Nu prezentăm critica proiectului ca descriere automată a formei finale. [RO09 — ANRE — documente de discuție pentru prosumatori](https://anre.ro/category/documente-de-discutie/energie-electrica/prosumatori/), [RO11 — APCE — complexitatea normelor propuse](https://asociatiaprosumatorilor.ro/legea-prosumatorului-de-o-jumatate-de-pagina-ingropata-in-61-de-pagini-de-norme-parca-scrise-dupa-dictarea-furnizorilor/), [RO23 — ANRE — întrebări după liberalizarea din 2025](https://anre.ro/qa-despre-prosumatori-dupa-1-iulie-2025/), [RO41 — ANRE — răspuns la afirmațiile APCE](https://anre.ro/comunicat-de-presa-pozitia-anre-fata-de-afirmatiile-apce/), [RO39 — TVR — obiecții la proiectul ghidului pentru baterii](https://tvrinfo.ro/prosumatorii-au-identificat-7-probleme-in-ghidul-de-finantare-lansat-in-dezbatere-publica/), [RO29 — Ministerul Mediului — forma finală a ghidului pentru baterii](https://mmediu.ro/en/comunicare/comunicate-de-presa/ghidul-programului-pentru-baterii-finalizat-si-publicat-in-monitorul-oficial-dupa-analizarea-a-peste-200-de-puncte-de-vedere/)

**De cerut:** contractul și factura, ultima modificare comunicată și decizia concretă afectată. **Utilitate posibilă:** arătăm mecanismul configurat, perioada și documentul pe care se bazează. Acest raport cercetează problemele; nu stabilește un regim juridic unic pentru toate instalațiile.

### P11. Nu este clar cine poate vedea datele sau modifica echipamentele

HotNews publică atât acuzațiile APCE, cât și răspunsurile Distribuție Oltenia și Delgaz despre accesul la parametrii tehnici. Aceste poziții sunt în conflict; nu dovedesc că operatorii au provocat intenționat pierderi. În ghidul final pentru baterii, ministerul anunță eliminarea unei formulări generale despre accesul persoanelor autorizate la date. [RO54 — HotNews — acces la invertoare și replicile distribuitorilor](https://hotnews.ro/prosumatorii-sustin-ca-distribuitorii-de-energie-incearca-sa-le-controleze-productia-panourilor-solare-replica-unui-distribuitor-in-60-dintre-cazuri-instalatiile-prosumatorilor-nu-respecta-paramet-2075879), [RO20 — Europa Liberă — acces și securitate echipamente](https://romania.europalibera.org/a/33554532.html), [RO29 — Ministerul Mediului — forma finală a ghidului pentru baterii](https://mmediu.ro/en/comunicare/comunicate-de-presa/ghidul-programului-pentru-baterii-finalizat-si-publicat-in-monitorul-oficial-dupa-analizarea-a-peste-200-de-puncte-de-vedere/)

**De cerut:** cine are acces acum, ce acces acceptă proprietarul și o situație concretă în care acest lucru a contat. **Utilitate posibilă:** acces numai pentru citire, permisiuni explicite și istoric al acțiunilor, dacă interviurile confirmă valoarea lor.

### P12. Investiția sau autonomia reală nu corespund așteptărilor

Discuțiile despre alegerea sistemului, primul an de utilizare și motivațiile investiției includ economii, confort și independență. Există și experiențe pozitive. O întrebare despre backup înainte de cumpărare nu dovedește o pană de curent în care sistemul a eșuat. [RO47 — Reddit — merită sistemul fotovoltaic?](https://www.reddit.com/r/panourifotovoltaice/comments/1vtkgvo/merita_sa_iti_pui_sistem_fotovoltaic/), [RO14 — Primul an cu fotovoltaice — producție și autoconsum](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/), [RO22 — Prosumator 2025 — recomandare și autonomie](https://www.reddit.com/r/Romania/comments/1l4112q), [RO50 — Reddit roFrugal — investiție în panouri și baterie](https://www.reddit.com/r/roFrugal/comments/1ppl0at/panouri_fotovoltaice/)

**De cerut:** ce i s-a promis, ce s-a întâmplat concret, costul propriu și datele care arată diferența. **Utilitate posibilă:** explicarea separată a autonomiei energetice, rezervei bateriei și funcției efective de backup. Nu tratăm estimările personale de amortizare ca rezultate auditate.

## 3. Citate publice scurte pentru interviuri

Acestea sunt citate deja publicate, **nu interviuri realizate de echipa noastră**. Cauza tehnică sau prejudiciul nu sunt confirmate automat.

| Sursă | Citat exact | Ce putem investiga |
| --- | --- | --- |
| [RO02 — Facturi neemise din 2023 — prosumator Hidroelectrica](https://www.reddit.com/r/Romania/comments/1e1o2qv/facturi_neemise_din_2023_prosumator_hidroelectrica/) | „iar asta a fost ultima luna in care am primit factura de la ei.” | Perioadă lipsă, documente și timp consumat pentru clarificare. |
| [RO03 — Prosumator Enel — facturi și compensare neclare](https://www.reddit.com/r/Romania/comments/15de9fs/prosumator_enel/) | „Nu am nici cea mai mica idee daca si cand o sa primesc vreo factura.” | Lipsa predictibilității facturării, în contextul istoric al postării. |
| [RO01 — Probleme prosumator — producție, PV2, sesizări și racordare](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/) | „dar nu mi-am dat seama imediat (nu mă pricep deloc la partea tehnică).” | Cum a observat problema și ce ajutor a primit. |
| [RO14 — Primul an cu fotovoltaice — producție și autoconsum](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/) | „Nu am observat nicio degradare.” | Contraexemplu: ce funcționează și de ce nu ar avea nevoie de produs. |
| [RO26 — Observatorul Prahovean — experiență Electrica și interviu APCE](https://www.observatorulph.ro/exclusiv/2771902-prosumatorii-victimele-sistemului-produc-energie-dar-sunt-arsi-la-facturi) | „Sunt prosumator, client Electrica Furnizare.” | Cazul propriu descris de jurnalist, separat de interviul APCE. |
| [RO48 — Reddit — zece luni cu Fronius, BYD și automatizări](https://www.reddit.com/r/panourifotovoltaice/comments/1tc7hru/experien%C8%9Ba_primelor_10_luni_cu_panouri/) | „bateria de 5kWh nu rezistă până dimineața în nopțile lungi de iarnă” | Așteptări, consum nocturn și configurația rezervei. |

## 4. Surse care repetă aceeași relatare

| Familie | Documente | Cum le folosim |
| --- | --- | --- |
| Buzeni | RO27, RO28 | Același comunicat/caz; nu două instalații verificate independent. |
| Ghid baterii 2026 | RO39, RO40; răspuns final RO29 | Două relatări ale poziției APCE despre proiect, apoi răspunsul ministerului. |
| Ghid EFdeN 2024 | RO18, RO19 | Interviul despre ghid și documentul asociat; fără dublarea eșantionului. |
| Sondaje „regrete” | RO12, RO49 | Formulare similară, sugestivă; nu agregăm voturi sau persoane ca sondaj național. |
| Opriri/tensiune, perspectiva APCE | RO17, RO55 | Recurență mediatică a poziției asociației; nu număr de incidente noi. |
| Audit echipamente 2025 | RO20, RO46 | Relatări despre propuneri și reacții; nu dovada unei obligații finale. |
| Facturare și contracte, APCE | RO04, RO05, RO06, RO11 | Materiale ale aceleiași organizații; pot trata situații diferite, fără persoane deduplicate. |

Nici documentele rămase nu sunt garantat independente: persoanele se pot repeta între comunități, iar jurnaliștii pot cita aceleași organizații. Câmpul `family` din JSON marchează dependențele evidente, fără a pretinde deduplicare exhaustivă.

## 5. Ce validăm înainte de prototip

| Prioritate | Ipoteză de testat | Dovada cerută | Ce ar infirma-o |
| --- | --- | --- | --- |
| 1 | Un incident este observat târziu și greu de explicat tehnicianului. | Trei incidente recente, loguri, sesizări, data intervenției. | Aplicația existentă alertează și echipa rezolvă deja suficient de repede. |
| 2 | Proprietarul nu poate reconcilia producția, schimbul cu rețeaua și factura. | O lună completă de date și factură anonimizată. | Diferența este explicată simplu, fără efort repetat sau consecință relevantă. |
| 3 | Bateria/consumul pot fi folosite mai bine fără efort manual mare. | O săptămână de fluxuri, setări și contractul de energie. | Automatizarea existentă rezolvă deja sau beneficiul incremental este mic. |

Întrebări neutre pentru apel: „Povestiți-mi ultima situație în care sistemul nu s-a comportat cum vă așteptați”; „Cum ați observat?”; „Ce ați verificat și cui ați scris?”; „Cât a durat până la rezolvare?”; „Ce cost sau timp pierdut puteți arăta?”; „Ce folosiți acum și ce funcționează bine?”. Nu porniți de la presupunerea că persoana are problema și nu prezentați soluția înainte de relatare.

Pentru O&M, întrebați separat câte incidente gestionează, prin ce platforme, cine aprobă intervenția și ce dovadă trebuie trimisă. **Sursele publice de aici nu înlocuiesc interviurile cu echipe care gestionează 100+ situri.**

## 6. Registrul complet al surselor românești

Titlurile sunt etichete descriptive scurte. Data neverificată exact este marcată; nu este inventată din data indexării. Toate au fost consultate în cercetarea din 24 octombrie 2026. Ghidurile și FAQ-urile sunt păstrate pentru explicarea mecanismelor, distinct de dovezile despre experiențe.

### RO01. [Probleme prosumator — producție, PV2, sesizări și racordare](https://www.reddit.com/r/panourifotovoltaice/comments/1orkkg9/probleme_prosumator/)

**Tip:** Relatare utilizator. **Dată:** 2025-11-08. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** PV2 inactiv nu demonstrează singur un string defect; configurația este contestată în comentarii. **Familie:** `S04`.

### RO02. [Facturi neemise din 2023 — prosumator Hidroelectrica](https://www.reddit.com/r/Romania/comments/1e1o2qv/facturi_neemise_din_2023_prosumator_hidroelectrica/)

**Tip:** Relatare utilizator. **Dată:** 2024-07-12. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Cazuri istorice și unități scrise informal; nu descriu obligatoriu situația actuală. **Familie:** `S05`.

### RO03. [Prosumator Enel — facturi și compensare neclare](https://www.reddit.com/r/Romania/comments/15de9fs/prosumator_enel/)

**Tip:** Relatare utilizator. **Dată:** 2023-07-30. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Comentarii din 2023–2024; nu folosi explicațiile juridice ca reguli actuale. **Familie:** `S06`.

### RO04. [APCE — facturi întârziate](https://asociatiaprosumatorilor.ro/in-problema-facturilor-intarziate-anre-ii-ameninta-pe-furnizori-cu-un-pistol-cu-apa/)

**Tip:** Asociație prosumatori. **Dată:** 2024-04-05. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Poziție a unei părți interesate; volumele reclamate nu sunt eșantionul nostru. **Familie:** `APCE_FACTURARE_CONTRACTE`.

### RO05. [APCE — energie livrată fără contract/compensare](https://asociatiaprosumatorilor.ro/furnizorii-ti-au-luat-energia-fara-contract-si-nu-ti-au-platit-o/)

**Tip:** Asociație prosumatori. **Dată:** 2026-03-19. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Semnale de reconciliere și contractare; argumentele juridice sunt ale asociației. **Familie:** `APCE_FACTURARE_CONTRACTE`.

### RO06. [APCE — schimbarea furnizorului](https://asociatiaprosumatorilor.ro/schimbarea-furnizorului-de-energie-pentru-prosumatori-nu-este-ca-si-cum-ai-emigra-din-romania/)

**Tip:** Asociație prosumatori. **Dată:** 2024-12-07. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Aceeași familie de surse ca S07/S08; nu reprezintă încă un eșantion independent. **Familie:** `APCE_FACTURARE_CONTRACTE`.

### RO07. [Hidroelectrica — întrebări frecvente prosumatori](https://www.hidroelectrica.ro/article/835b1940-c0c9-b530-30de-f0fe959dc1e6)

**Tip:** Furnizor; FAQ oficial. **Dată:** nedatată. **Acces:** fragment indexat; deschiderea directă a expirat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Confirmă distincția dintre aplicație și contor; explicațiile de facturare pot reflecta regimuri istorice. **Familie:** `S10`.

### RO08. [ANRE — Cum devin prosumator](https://anre.ro/consumatori/energie-electrica/cum-devin-prosumator/)

**Tip:** Autoritate. **Dată:** actualizare afișată 2026-10-14. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Roluri instituționale și rapoarte; nu este o anchetă despre frecvența durerilor. **Familie:** `S11`.

### RO09. [ANRE — documente de discuție pentru prosumatori](https://anre.ro/category/documente-de-discutie/energie-electrica/prosumatori/)

**Tip:** Autoritate; consultări. **Dată:** 2026-08/09. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Consultările sunt proiecte; nu le eticheta norme finale în vigoare. **Familie:** `S12`.

### RO10. [ANRE — răspuns privind petiții și reglementări](https://anre.ro/comunicat-de-presa-reglementarile-anre-trebuie-sa-respecte-legislatia-primara-autoritatea-nu-poate-dribla-pe-langa-lege-iar-apce-stie-foarte-bine-acest-lucru-anre-atrage-atentia/)

**Tip:** Autoritate; poziție oficială. **Dată:** 2025-08-11. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Petițiile descrise provin dintr-un demers coordonat; nu sunt o estimare de prevalență. **Familie:** `S13`.

### RO11. [APCE — complexitatea normelor propuse](https://asociatiaprosumatorilor.ro/legea-prosumatorului-de-o-jumatate-de-pagina-ingropata-in-61-de-pagini-de-norme-parca-scrise-dupa-dictarea-furnizorilor/)

**Tip:** Asociație prosumatori. **Dată:** 2026-08-23/24. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Critică a asociației; nu dovedește singură nelegalitatea normelor. **Familie:** `APCE_FACTURARE_CONTRACTE`.

### RO12. [Regrete după instalare — discuție proprietari](https://www.reddit.com/r/panourifotovoltaice/comments/1v8qlne/poll_cel_mai_mare_regret_legat_de_instalarea/)

**Tip:** Discuție utilizatori. **Dată:** 2026-07/08. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Întrebarea inițială sugerează răspunsuri; folosim comentarii concrete, nu un sondaj reprezentativ. **Familie:** `POLL_REGRETE`.

### RO13. [Cât durează instalarea — inclusiv experiențe pozitive](https://www.reddit.com/r/Panouri_Fotovoltaice/comments/1u90ewc/c%C3%A2t_dureaz%C4%83_efectiv_instalarea/)

**Tip:** Discuție utilizatori. **Dată:** 2026-06. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Există și relatări de suport rapid; nu toate firmele sau instalațiile au probleme. **Familie:** `S25`.

### RO14. [Primul an cu fotovoltaice — producție și autoconsum](https://www.reddit.com/r/panourifotovoltaice/comments/1s666g8/cei_care_a%C8%9Bi_trecut_de_primul_an_cu_fotovoltaice/)

**Tip:** Discuție utilizatori. **Dată:** 2026-03/04. **Acces:** pagină deschisă.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Include producție stabilă și satisfacție; cifrele personale nu sunt auditate. **Familie:** `S26`.

### RO15. [Controlul bateriilor și acceptarea stimulentelor](https://www.reddit.com/r/Romania/comments/1vr5qtg/prosumatorii_mesaj_pentru_bolojan_%C3%AEn_plin%C4%83_criz%C4%83/)

**Tip:** Discuție utilizatori. **Dată:** 2026-08. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Discuție politizată, tarife/unități contradictorii; semnal exploratoriu despre control și rezervă. **Familie:** `S28`.

### RO16. [Studiu AFEER — integrarea prosumatorilor în rețea](https://www.afeer.ro/pdf/studiu-2026.pdf)

**Tip:** Studiu de industrie. **Dată:** 2026-01. **Acces:** PDF deschis; secțiuni relevante indexate.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Perspectivă a industriei furnizorilor; metodologia cifrelor despre incidente nu a fost auditată. **Familie:** `S30`.

### RO17. [Național — interviu APCE despre deconectări](https://national.ro/actualitate/smecherii-cu-energia-prosumatorii-expulzati-din-sistem-si-obligati-sa-consume-din-retea/)

**Tip:** Presă; interviu cu asociație. **Dată:** 2026-03-09. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Aceeași voce APCE; suspiciunile de intenție nu sunt fapte confirmate. **Familie:** `APCE_TENSIUNE_2026`.

### RO18. [Știrile ProTV — EFdeN și ghidul prosumatorului](https://stirileprotv.ro/stiri/ilikeit/un-nou-ghid-gratuit-pentru-prosumatorii-din-romania-am-observat-ca-exista-niste-probleme.html)

**Tip:** Presă; interviu EFdeN. **Dată:** 2024-06-13. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Context educațional istoric; nu reutilizăm procentele drept statistici actuale. **Familie:** `EFDEN_GHID_2024`.

### RO19. [energiaTa — ghidul prosumatorului sustenabil, teaser](https://energiata.org/wp-content/uploads/2024/03/Ghidul-Prosumatorului-Sustenabil-teaser-4-martie.pdf)

**Tip:** Ghid educațional; organizație. **Dată:** 2024. **Acces:** fragment PDF indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Scenarii/modelare, nu economii observate în cohorta noastră. **Familie:** `EFDEN_GHID_2024`.

### RO20. [Europa Liberă — acces și securitate echipamente](https://romania.europalibera.org/a/33554532.html)

**Tip:** Presă. **Dată:** 2025-10-08. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Context despre propuneri de audit; nu dovedește compromiterea unei instalații sau o lege finală. **Familie:** `AUDIT_2025`.

### RO21. [Rețele Electrice — Cum devii prosumator](https://www.reteleelectrice.ro/informatii/cum-devii-prosumator/)

**Tip:** Operator distribuție. **Dată:** nedatată. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Etape și conformitate; nu măsoară timpul efectiv al fiecărui dosar. **Familie:** `S35`.

### RO22. [Prosumator 2025 — recomandare și autonomie](https://www.reddit.com/r/Romania/comments/1l4112q)

**Tip:** Discuție utilizatori. **Dată:** 2025-06-05. **Acces:** fragment indexat.

**Legătura cu România:** România: furnizori, instituții, programe sau instalații locale descrise; profilul anonim nu dovedește domiciliul fiecărui comentator. **Limită:** Întrebări înainte de achiziție și opinii despre autonomie; nu incident demonstrat de backup. **Familie:** `S37`.

### RO23. [ANRE — întrebări după liberalizarea din 2025](https://anre.ro/qa-despre-prosumatori-dupa-1-iulie-2025/)

**Tip:** Autoritate; context. **Dată:** 2025-06-27. **Acces:** fragment indexat.

Explicații oficiale privind contractele și compensarea în contextul din 2025.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Material istoric, nu set complet de reguli actuale. **Familie:** `anreqa`.

### RO24. [HotNews — reclamații despre bateriile prin voucher](https://hotnews.ro/o-mare-golaneala-prosumatorii-care-primesc-vouchere-pentru-baterii-de-stocare-acuza-ca-instalatorii-le-monteaza-produse-ieftine-si-neomologate-ministerul-ii-trimite-pe-oameni-sa-s-2070469)

**Tip:** Presă; reclamații și replică. **Dată:** 2025-09-22; actualizat 23. **Acces:** pagină deschisă.

Beneficiarii contestă selecția și costul bateriilor; articolul include răspunsuri ale instalatorilor și instituțiilor.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Acuzațiile privind omologarea nu sunt un verdict tehnic independent. **Familie:** `voucher`.

### RO25. [Digi24 — prosumatori care așteaptă facturarea](https://www.digi24.ro/stiri/economie/energie/mii-de-prosumatori-spun-ca-sunt-inselati-de-stat-desi-dau-energie-in-retea-oamenii-se-plang-ca-nu-si-primesc-banii-2745811)

**Tip:** Presă; caz identificat. **Dată:** 2024-04-03. **Acces:** fragment indexat.

Relatarea lui Gheorghe Ionescu despre lipsa facturilor și a decontării.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Caz istoric; cifrele generale din titlu nu sunt eșantionul cercetării. **Familie:** `digi2024`.

### RO26. [Observatorul Prahovean — experiență Electrica și interviu APCE](https://www.observatorulph.ro/exclusiv/2771902-prosumatorii-victimele-sistemului-produc-energie-dar-sunt-arsi-la-facturi)

**Tip:** Presă; experiență proprie și asociație. **Dată:** 2025-11-29. **Acces:** pagină deschisă.

Autorul se declară prosumator și descrie diferențe între aplicație și facturi, apoi intervievează APCE.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Partea de interviu este poziția APCE, nu al doilea eșantion independent. **Familie:** `ph2025`.

### RO27. [Senat — cazul de tensiune din Buzeni](https://www.senat.ro/StiriSenatDetaliu.aspx?ID=B4FF3044-4015-4D07-8DD5-D459D3A90237)

**Tip:** Comunicare politică; caz local. **Dată:** 2026; dată exactă neconfirmată. **Acces:** pagină deschisă.

Un senator relatează răspunsul Delgaz și măsurători privind tensiunea rețelei din Buzeni.

**Legătura cu România:** Buzeni, județul Botoșani. **Limită:** Document publicat de un parlamentar, nu raportul original de măsurare al distribuitorului. **Familie:** `BUZENI`.

### RO28. [Botoșani Online — comunicatul despre Buzeni](https://btonline.ro/comunicat-de-presa-catalin-silegeanu-vrem-energie-verde-dar-ne-batem-joc-de-prosumatori/)

**Tip:** Presă locală; comunicat republicat. **Dată:** 2026-08-24. **Acces:** fragment indexat.

Publică poziția senatorului despre integrarea prosumatorilor.

**Legătura cu România:** Buzeni/Botoșani. **Limită:** Aceeași familie cu documentul Senatului; nu este un caz suplimentar. **Familie:** `BUZENI`.

### RO29. [Ministerul Mediului — forma finală a ghidului pentru baterii](https://mmediu.ro/en/comunicare/comunicate-de-presa/ghidul-programului-pentru-baterii-finalizat-si-publicat-in-monitorul-oficial-dupa-analizarea-a-peste-200-de-puncte-de-vedere/)

**Tip:** Autoritate; context și răspuns. **Dată:** 2026-09-14. **Acces:** pagină deschisă.

Anunță modificări după consultare, inclusiv capacitatea minimă și accesul la date.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Punctele de vedere primite nu sunt toate reclamații sau persoane distincte. **Familie:** `GHID_BESS_2026`.

### RO30. [Economedia — ANRE despre setările invertoarelor](https://economedia.ro/avertisment-de-la-anre-prosumatorii-care-modifica-softul-invertoarelor-vor-fi-deconectati-de-la-retea-si-amendati.html)

**Tip:** Presă; răspuns ANRE. **Dată:** 2025; dată exactă neconfirmată. **Acces:** pagină deschisă.

Descrie deconectările reclamate și solicită poziția ANRE despre modificarea protecțiilor.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Separă relatările/anunțurile online de cazurile oficial documentate; fără extrapolare națională. **Familie:** `economedia`.

### RO31. [DEER — ghidul prosumatorului](https://www.distributie-energie.ro/wp-content/uploads/2023/12/Ghidul-prosumatorului.pdf)

**Tip:** Distribuitor; ghid. **Dată:** fișier găzduit în 2023. **Acces:** fragment indexat.

Documentează traseul de racordare și documentele.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Explică procesul; nu dovedește întârzieri sau frecvențe. **Familie:** `deerguide`.

### RO32. [Reddit — alegerea instalatorului în Ilfov](https://www.reddit.com/r/panourifotovoltaice/comments/1tje4op/recomandare/)

**Tip:** Discuție utilizatori. **Dată:** 2026-05-21. **Acces:** fragment indexat.

Comentarii despre echipamente, capacitatea bateriei, echipe și rezolvarea problemelor.

**Legătura cu România:** Solicitare de instalare în Ilfov și comentarii în contextul românesc. **Limită:** Configurații și relatări neauditate; include și experiențe rezolvate. **Familie:** `recomandare`.

### RO33. [Energis — două facturi Hidroelectrica explicate](https://www.energis.ro/compensare-prosumatori-facturi-hidroelectrica/)

**Tip:** Companie; documente de caz. **Dată:** 2026-10-20. **Acces:** pagină deschisă.

Prezintă două facturi anonimizate și distinge energia activă de componentele rămase de plată.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Sursă comercială; nu am auditat contractele sau corectitudinea tuturor taxelor. **Familie:** `energis`.

### RO34. [Reddit roFrugal — alegerea firmei pentru fotovoltaice](https://www.reddit.com/r/roFrugal/comments/1nj7ezt/cum_va%C8%9Bi_hot%C4%83r%C3%A2t_%C8%99i_ales_o_firm%C4%83_pentru/)

**Tip:** Discuție utilizatori. **Dată:** 2025-09-17. **Acces:** fragment indexat.

Întrebări de selecție a instalatorului și experiențe ale comentatorilor.

**Legătura cu România:** București/Ilfov, inclusiv referințe la Popești-Leordeni. **Limită:** Autorul solicitării încă alege firma; nu transforma temerile sale în defecțiuni trăite. **Familie:** `frugalalegere`.

### RO35. [GitHub — integrare Hidroelectrica pentru Home Assistant](https://github.com/cnecrea/hidroelectrica)

**Tip:** Instrument dedicat României. **Dată:** nedatată; verificat 2026-10-24. **Acces:** fragment indexat.

Proiect pentru conectarea datelor contului Hidroelectrica la Home Assistant.

**Legătura cu România:** Integrare specifică furnizorului român Hidroelectrica. **Limită:** Dovedește existența unei soluții locale, nu numărul nemulțumirilor. **Familie:** `hidrointegration`.

### RO36. [Reddit — sistem fotovoltaic în Buftea](https://www.reddit.com/r/panourifotovoltaice/comments/1vdkt5v/sfaturi_pentru_instalarea_panourilor_fotovoltaice/)

**Tip:** Discuție utilizatori. **Dată:** 2026-08. **Acces:** fragment indexat.

Experiențe despre consum diurn, mașină electrică și alegerea de a nu monta baterie.

**Legătura cu România:** Buftea/Ilfov. **Limită:** Calcule personale neauditate; exemplu că bateria nu este automat prioritatea tuturor. **Familie:** `buftea`.

### RO37. [Electrica Furnizare — autocitire și prosumatori](https://www.electricafurnizare.ro/transmitere-index-autocitit/)

**Tip:** Furnizor; context. **Dată:** nedatată; verificat 2026-10-24. **Acces:** fragment indexat.

Descrie transmiterea indexului și particularitățile prosumatorilor cu măsurare inteligentă.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Procedura unui furnizor nu se generalizează la toți; nu este reclamație. **Familie:** `electricaindex`.

### RO38. [Gândul — cazul Petru din Prahova și răspunsul ENGIE](https://www.gandul.ro/actualitate/pe-1-octombrie-2022-petru-din-prahova-a-incheiat-un-contract-de-prosumator-cu-engie-ce-a-patit-acum-dupa-4-luni-19924461)

**Tip:** Presă; caz și replică. **Dată:** 2023-02-11. **Acces:** fragment indexat.

Reia cazul din presa locală: sesizări repetate, incompatibilitate contractuală explicată de ENGIE și facturare reluată.

**Legătura cu România:** Prahova. **Limită:** Caz istoric, ulterior rezolvat; nu îl numărăm din nou pentru fiecare republicare. **Familie:** `PETRU_PRAHOVA`.

### RO39. [TVR — obiecții la proiectul ghidului pentru baterii](https://tvrinfo.ro/prosumatorii-au-identificat-7-probleme-in-ghidul-de-finantare-lansat-in-dezbatere-publica/)

**Tip:** Presă; poziție APCE. **Dată:** 2026-08-19. **Acces:** fragment indexat.

Reia obiecțiile asociației privind dimensionarea și eligibilitatea finanțării.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Despre proiectul din august; consultă răspunsul final din septembrie. **Familie:** `GHID_BESS_2026`.

### RO40. [DigiEconomic — APCE și finanțarea bateriilor](https://www.digi24.ro/digieconomic/energie/prosumatorii-critica-proiectul-afm-pentru-finantarea-bateriilor-poate-produce-discriminari-si-investitii-prost-dimensionate-115263)

**Tip:** Presă; poziție APCE. **Dată:** 2026-08-19. **Acces:** fragment indexat.

Descrie riscul unor investiții insuficient adaptate gospodăriilor.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Aceeași poziție APCE ca la TVR, nu șapte incidente noi. **Familie:** `GHID_BESS_2026`.

### RO41. [ANRE — răspuns la afirmațiile APCE](https://anre.ro/comunicat-de-presa-pozitia-anre-fata-de-afirmatiile-apce/)

**Tip:** Autoritate; poziție oficială. **Dată:** 2025-06-04. **Acces:** fragment indexat.

Prezintă poziția autorității în disputa privind compensarea și componentele tarifare.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Poziție instituțională; nu tranșează fiecare litigiu individual. **Familie:** `anreapce`.

### RO42. [E.ON — ghid și întrebări de facturare](https://www.eon.ro/info-prosumatori)

**Tip:** Furnizor; FAQ. **Dată:** nedatată; verificat 2026-10-24. **Acces:** pagină deschisă.

Explică situația facturilor estimate când datele contorului nu ajung la furnizor.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Pagina combină explicații despre mecanisme anterioare și noi; verifică data și contractul. **Familie:** `eon`.

### RO43. [HotNews — preavize și sold de energie](https://hotnews.ro/legea-care-permite-prosumatorilor-sa-fie-platiti-lunar-pentru-energia-livrata-e-blocata-din-aprilie-in-parlament-dar-prosumatorii-primesc-preavize-ca-li-se-taie-curentul-daca-nu-platesc-lunar-1819301)

**Tip:** Presă; cazuri preluate din comunități. **Dată:** 2024-10-23. **Acces:** pagină deschisă.

Descrie persoane care reclamă preavize de plată deși au energie livrată și sold în favoarea lor.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Postările Facebook sunt citate de jurnalist; nu le-am accesat direct. Reguli istorice. **Familie:** `preavize`.

### RO44. [Europa Liberă — tarife diferențiate și autoconsum](https://romania.europalibera.org/a/consum-diferentiat-de-energie-electrica-prosumatori/33534035.html)

**Tip:** Presă; interviu. **Dată:** 2025; dată exactă neconfirmată. **Acces:** fragment indexat.

Discută valoarea tarifelor pe intervale pentru gospodăriile care produc deja ziua.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Argumente și estimări din interviu, nu beneficii măsurate pentru fiecare prosumator. **Familie:** `eltarif`.

### RO45. [DEER — pașii pentru racordare](https://www.distributie-energie.ro/ghid-racordare-la-retea/)

**Tip:** Distribuitor; proces. **Dată:** nedatată; verificat 2026-10-24. **Acces:** fragment indexat.

Prezintă traseul administrativ de acces la rețea.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Context procedural, nu dovadă a duratei reale pentru clienți. **Familie:** `deerportal`.

### RO46. [Radio România Actualități — disputa despre auditarea echipamentelor](https://www.romania-actualitati.ro/stiri/romania/romania-ar-putea-deveni-prima-tara-care-taxeaza-echipamentele-energetice-private-ale-cetatenilor-id218358.html)

**Tip:** Presă; poziție APCE. **Dată:** 2025-10-27. **Acces:** fragment indexat.

Prezintă criticile asociației privind o propunere de verificare a echipamentelor.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Propunere contestată, nu taxă sau obligație finală demonstrată. **Familie:** `AUDIT_2025`.

### RO47. [Reddit — merită sistemul fotovoltaic?](https://www.reddit.com/r/panourifotovoltaice/comments/1vtkgvo/merita_sa_iti_pui_sistem_fotovoltaic/)

**Tip:** Discuție utilizatori. **Dată:** 2026-08-20. **Acces:** fragment indexat.

Experiențe pozitive și întrebări despre cost, independență și utilizarea energiei.

**Legătura cu România:** Referințe la Timiș/Salonta și context de instalare românesc. **Limită:** Autoselecție, calcule personale și configurații diferite. **Familie:** `merita`.

### RO48. [Reddit — zece luni cu Fronius, BYD și automatizări](https://www.reddit.com/r/panourifotovoltaice/comments/1tc7hru/experien%C8%9Ba_primelor_10_luni_cu_panouri/)

**Tip:** Relatare utilizator; contraexemplu și problemă sezonieră. **Dată:** 2026-05-13. **Acces:** pagină deschisă.

Publică fluxuri lunare, limitele bateriei iarna și un sistem Home Assistant care unește mai multe surse.

**Legătura cu România:** Autorul declară Transilvania, zonă montană, Casa Verde 2024. **Limită:** Valorile și economiile sunt declarate de autor; nu sunt măsurători auditate. **Familie:** `transilvania`.

### RO49. [Reddit — regrete după instalare, discuția din aprilie](https://www.reddit.com/r/panourifotovoltaice/comments/1slyjvg/poll_cel_mai_mare_regret_legat_de_instalarea/)

**Tip:** Discuție utilizatori. **Dată:** 2026-04-15. **Acces:** fragment indexat.

Comentarii despre așteptare, alegerea sistemului și extindere.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Întrebare sugestivă, similară sondajului ulterior; nu sondaj reprezentativ. **Familie:** `POLL_REGRETE`.

### RO50. [Reddit roFrugal — investiție în panouri și baterie](https://www.reddit.com/r/roFrugal/comments/1ppl0at/panouri_fotovoltaice/)

**Tip:** Discuție utilizatori. **Dată:** 2025-12-18. **Acces:** fragment indexat.

Discuție despre investiție și opțiuni disponibile local.

**Legătura cu România:** Furnizori/livrare în România și contextul investiției locale. **Limită:** Întrebările înaintea achiziției nu sunt dovezi ale unor defecțiuni. **Familie:** `frugalpanouri`.

### RO51. [ENGIE — model explicat al facturii de consum](https://www.engie.ro/wp-content/uploads/2024/01/factura_consum_prosumatori.pdf)

**Tip:** Furnizor; exemplu de factură. **Dată:** fișier 2024-01. **Acces:** fragment indexat.

Arată componentele documentului de consum pentru prosumatori.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Exemplu istoric; prețurile și taxele nu se folosesc drept valori curente. **Familie:** `engiefactura`.

### RO52. [ENGIE — întrebări frecvente](https://www.engie.ro/intrebari-frecvente/)

**Tip:** Furnizor; FAQ. **Dată:** nedatată; verificat 2026-10-24. **Acces:** fragment indexat.

Include documente, contractare și explicații pentru prosumatori.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Pagina este amplă și include și alte categorii de clienți; folosim doar contextul relevant. **Familie:** `engiefaq`.

### RO53. [ENGIE — explicația facturii de report](https://www.engie.ro/wp-content/uploads/2023/01/Ghid-explicativ-factur%C4%83-de-report.pdf)

**Tip:** Furnizor; ghid istoric. **Dată:** fișier 2023-01. **Acces:** fragment indexat.

Explică evidența energiei reportate în mecanismul descris atunci.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Nu este dovadă că mecanismul istoric se aplică tuturor contractelor din 2026. **Familie:** `engiereport`.

### RO54. [HotNews — acces la invertoare și replicile distribuitorilor](https://hotnews.ro/prosumatorii-sustin-ca-distribuitorii-de-energie-incearca-sa-le-controleze-productia-panourilor-solare-replica-unui-distribuitor-in-60-dintre-cazuri-instalatiile-prosumatorilor-nu-respecta-paramet-2075879)

**Tip:** Presă; poziții contradictorii. **Dată:** 2025-09-29; actualizat 30. **Acces:** pagină deschisă.

Pune alături acuzațiile APCE și răspunsurile Distribuție Oltenia/Delgaz despre accesul tehnic.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Procentul distribuitorului privește instalațiile controlate, nu toată România; intenția de limitare nu este demonstrată. **Familie:** `acceshotnews`.

### RO55. [ProTV — opriri în intervalele de producție mare](https://stirileprotv.ro/stiri/pro-verde/panouri-fotovoltaice-oprite-automat-de-ce-prosumatorii-din-romania-pierd-energie-in-orele-de-varf.html)

**Tip:** Presă; interviu APCE. **Dată:** 2026-04-17. **Acces:** pagină deschisă.

Discută opririle invertoarelor și dificultatea documentării pierderii.

**Legătura cu România:** România: subiect, instituție, furnizor sau amplasament explicit. **Limită:** Se bazează pe interviul APCE; numerele din titlu nu sunt prevalență verificată de noi. **Familie:** `APCE_TENSIUNE_2026`.

## 7. Ce nu putem susține încă

Nu avem procente reprezentative ale problemelor, costuri medii auditate, dovezi că fiecare invertor sau furnizor are aceeași problemă ori validarea că oamenii ar plăti pentru One Energy View. Nu avem confirmarea unei cauze tehnice doar dintr-o captură de aplicație. Cazurile istorice rămân istorice, iar paginile despre proiecte legislative nu sunt tratate drept norme finale. Următorul pas este colectarea voluntară a câtorva incidente recente și a datelor anonimizate care permit reconstruirea lor.
