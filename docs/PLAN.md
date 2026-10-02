# Old Red Chisel — plan strony i sklepu

> Status: **plan v0.2, decyzje podjęte**, 2026-10-02.
> Firma: stolarka + budownictwo/wykończenia, Irlandia.
> Cel: jedna strona, która **sprzedaje gotowe produkty**, **przyjmuje zamówienia na wymiar** i **zbiera zapytania o usługi budowlane**.

---

## 0. Decyzje (z formularza, 2026-10-02)

| Temat | Decyzja |
|---|---|
| Nazwa / logo | **Old Red Chisel**, logo już jest (do przesłania) |
| Zasięg | **Athlone i okolice** (Westmeath, Roscommon, Longford, Offaly — do doprecyzowania promienia) |
| Kuchnie | **Tak, pełne kuchnie na wymiar** (projekt, produkcja, montaż) |
| Język | **Tylko angielski** |
| Sklep na start | Szafki nocne, bary domowe, szafki/komody/RTV, półki i drobne akcesoria |
| Magazyn | **Mieszany**: część od ręki (tryb A), część na zamówienie (tryb B) |
| Dostawa | **Własny transport**, montaż **płatny osobno**, **odbiór z warsztatu** w Athlone |
| Pomiar | **Płatny, odliczany od zamówienia** |
| Technologia | **Własna strona: Next.js + Payload CMS + Stripe** |
| Materiały | Zdjęcia przed/po: później · Facebook: jest (link wkrótce) · **Domena: do kupienia** · **Google Business Profile: do założenia** |
| Termin | **Jak najszybciej**, MVP w ok. 4–6 tyg. |
| Budżet utrzymania | **€30–€100 / mies.** |

### Kierunek wyglądu (formularz, 2026-10-02)
| Temat | Decyzja |
|---|---|
| Kolejność | **Najpierw własny zestaw elementów wyglądu**, potem panel administracyjny i płatności |
| Styl | **Mieszany**: czysty, nowoczesny układ z rzemieślniczymi detalami (ramki, faktury, akcenty) |
| Animacje | **Subtelne**: płynne pojawianie się sekcji, efekty po najechaniu, suwak przed/po; strona ma pozostać szybka |
| Ikony i ilustracje | **Ręcznie rysowane**, jak szkice ołówkiem stolarza |
| Zasada | Wszystkie elementy widoczne na stronie robimy sami (bez gotowych bibliotek UI/ikon); gotowe tylko po przeróbce |

### Konsekwencje dla projektu
- **Kuchnie** stają się osobną, mocną kategorią w *Bespoke* (wysoka wartość zlecenia). Na stronie głównej powinny być widoczne obok szaf wnękowych.
- **SEO lokalne** skupione na Midlands: „carpenter Athlone”, „fitted wardrobes Westmeath”, „kitchens Athlone”, „renovations Roscommon”. Strony lokalne: Athlone, Mullingar, Roscommon, Longford, Tullamore, Ballinasloe (do potwierdzenia).
- **Strefy dostawy** liczone od warsztatu w Athlone (np. do 30 km / 30–60 km / 60+ km lub wg hrabstw), plus darmowy odbiór z warsztatu.
- **Pomiar płatny**: w kreatorze wyceny jest krok „Book a survey”. Opłata pobierana przez Stripe, później automatycznie odliczana od zaliczki.
- **Brak zdjęć na start**: projekt graficzny z miejscami na zdjęcia. Do czasu sesji zdjęciowej korzystamy z tymczasowych zdjęć warsztatu/drewna, a portfolio uruchamiamy, gdy przyjdą zdjęcia przed/po.

### Infrastruktura w budżecie €30–€100 / mies.
| Element | Usługa | Koszt orientacyjny |
|---|---|---|
| Hosting aplikacji | Vercel (Pro, gdy ruch wzrośnie) lub Railway | €0–€20 |
| Baza danych | PostgreSQL (Neon / Supabase) | €0–€20 |
| Zdjęcia | Cloudflare R2 | ~€0–€5 |
| E-maile transakcyjne | Resend | €0–€20 |
| Domena | .ie lub .com | ~€15–€30 / rok |
| Płatności | Stripe | brak abonamentu, prowizja od transakcji |

### Do zrobienia po Twojej stronie
- [ ] Przesłać **logo** (najlepiej SVG lub PNG w wysokiej rozdzielczości) + kolory, jeśli są ustalone
- [ ] Kupić **domenę** (propozycje: `oldredchisel.ie`, `oldredchisel.com`)
- [ ] Założyć **Google Business Profile** (adres warsztatu w Athlone)
- [ ] Podać **link do Facebooka**
- [ ] Lista produktów startowych: nazwa, wymiary, drewno/wykończenia, cena, czy jest na stanie
- [ ] Zdjęcia przed/po (gdy będą)
- [ ] Założyć konto **Stripe** (firma, IBAN) — potrzebne przed startem płatności

---

## 1. Koncepcja w jednym zdaniu

**„Rzemiosło z warsztatu — od jednej szafki po cały dom.”**

Strona nie jest „sklepem z doklejonym portfolio” ani „firmą budowlaną z doklejonym sklepem”. To **warsztat rzemieślniczy**, który klient może odwiedzić na trzy sposoby, zależnie od tego, czego potrzebuje:

| Ścieżka | Co klient chce | Co robi na stronie | Jak płaci |
|---|---|---|---|
| **1. Sklep (Ready-made)** | Gotowa szafka, szafka nocna, bar, półki itp. | Dodaje do koszyka, płaci online | Pełna płatność online |
| **2. Na wymiar (Bespoke)** | Szafa wnękowa, zabudowa, szafki pod konkretne miejsce | Konfiguruje lub wysyła wymiary/zdjęcia → wycena → pomiar | Zaliczka online, reszta po montażu |
| **3. Budowa i wykończenia (Build & Renovate)** | Remont, wykończenie wnętrza, taras, elewacja, rozbudowa — „wszystko” | Opisuje projekt, dodaje zdjęcia, umawia wizytę | Umowa + harmonogram płatności (poza stroną lub fakturą online) |

Te trzy ścieżki **wzajemnie się napędzają**: klient, który kupił szafkę nocną, widzi, że ta sama ekipa robi szafy wnękowe; klient remontu widzi, że może dostać zabudowę robioną ręcznie w tym samym warsztacie. To jest główna przewaga nad konkurencją — **jedna firma, jedna jakość, jeden kontakt**.

### Pozycjonowanie (dlaczego klient ma wybrać właśnie nas)
- **Handmade in Ireland** — robione ręcznie we własnym warsztacie, nie składane z płyt z marketu.
- **Od pomiaru do montażu** — jedna ekipa, bez podwykonawców „z łapanki”.
- **Duże i małe projekty** — nie odsyłamy klienta z małym zleceniem.
- **Przejrzystość** — ceny „od”, jasny proces, terminy, gwarancja.

> Nazwa: **Old Red Chisel** (potwierdzona).

---

## 2. Rynek i język

- **Język główny: angielski** (rynek irlandzki). Opcjonalnie **wersja polska** jako dodatek — duża polska społeczność w Irlandii to realni klienci i naturalny kanał poleceń.
- **Waluta: EUR**, ceny brutto z VAT.
- Terminologia, której szukają Irlandczycy (ważne dla SEO i nawigacji):
  - *fitted wardrobes, built-in wardrobes, bespoke joinery, carpenter, custom cabinets, alcove units, TV units, home bar, bedside lockers, shelving*
  - *renovations, home extensions, attic conversions, decking, fencing, garden rooms, interior fit-out, kitchen fitting, flooring, plastering*
  - Uwaga: w Irlandii „bedside table” to często **„bedside locker”** — warto używać lokalnych słów.

---

## 3. Mapa strony (sitemap)

```
Home
├── Shop (Sklep)
│   ├── Wszystkie produkty
│   ├── Kategorie: Bedside lockers · Cabinets & sideboards · Home bars · Shelving & storage · TV units · Akcesoria (np. deski, skrzynie)
│   ├── Gotowe od ręki (In stock)  /  Robione na zamówienie (Made to order)
│   └── Strona produktu
├── Bespoke / Na wymiar
│   ├── Fitted wardrobes (szafy wnękowe / garderoby)
│   ├── Alcove & media units (zabudowy wnęk, TV)
│   ├── Under-stairs & attic storage (pod schodami, poddasza)
│   ├── Kitchens & utility rooms (kuchnie na wymiar: projekt, produkcja, montaż)
│   ├── Home office, bathroom vanity, inne
│   └── Configurator / „Zaprojektuj swoją szafę” (faza 2)
├── Build & Renovate / Budowa i wykończenia
│   ├── Interior: wykończenia, podłogi, sufity, ściany, drzwi, schody
│   ├── Exterior: tarasy (decking), ogrodzenia, pergole, garden rooms, elewacje
│   ├── Extensions & conversions (rozbudowy, poddasza, garaże)
│   └── Small jobs / Handyman (małe zlecenia — osobna, szybka ścieżka)
├── Projects / Realizacje (portfolio)
│   ├── Filtry: typ (szafy, remont, taras…), hrabstwo, budżet
│   └── Case study: przed / po, zakres, czas, cytat klienta
├── How we work / Jak pracujemy (proces krok po kroku)
├── About / O nas (warsztat, ludzie, historia, film)
├── Reviews / Opinie
├── Guides / Poradnik (blog — SEO)
├── Get a quote / Darmowa wycena  ← zawsze widoczny przycisk
├── Contact
└── Konto klienta (zamówienia, status projektu — faza 2/3)

Stopka: Delivery & assembly · Returns · Warranty · Terms · Privacy · Cookies · Dane firmy (CRO, VAT)
```

### Strona główna — kolejność sekcji (zaprojektowana pod sprzedaż)
1. **Hero**: duże zdjęcie/film z warsztatu lub gotowej szafy + nagłówek + 2 przyciski: **„Shop handmade pieces”** i **„Get a free quote”**.
2. **Trzy drzwi** — trzy duże kafle: Shop / Bespoke / Build & Renovate.
3. **Pasek zaufania**: ocena Google ★ 4.9 (X opinii), lata doświadczenia, liczba realizacji, ubezpieczenie, gwarancja, obsługiwane hrabstwa.
4. **Bestsellery ze sklepu** (4–8 produktów).
5. **Wybrane realizacje** — suwak przed/po.
6. **Jak pracujemy** — 4–5 kroków z ikonami.
7. **Opinie klientów** (najlepiej ze zdjęciami realizacji).
8. **„Made in our workshop”** — krótki film/zdjęcia rąk przy pracy, drewna, narzędzi.
9. **FAQ** (ceny, terminy, obszar działania, płatności).
10. **CTA końcowe** + formularz krótkiego zapytania.

---

## 4. Trzy tryby produktu w sklepie

To jest serce koncepcji „sklep sprzedażowo-usługowy”. Każdy produkt ma jeden z trzech trybów:

| Tryb | Przykład | Przycisk | Logika |
|---|---|---|---|
| **A. Gotowy (In stock)** | Szafka nocna z dębu, sztuka gotowa w magazynie | **Add to cart** | Stan magazynowy, wysyłka/dostawa 2–5 dni |
| **B. Na zamówienie z opcjami (Made to order)** | Ta sama szafka, ale wybierasz drewno, kolor, uchwyty, rozmiar S/M/L | **Add to cart** (cena przelicza się od opcji) | Czas realizacji np. 3–5 tyg. — jasno pokazany |
| **C. Wariant custom (Request a quote)** | „Chcę taki bar, ale 2,4 m i z lodówką” | **Customise this / Ask for quote** | Formularz z wymiarami + zdjęcia → wycena w 48h → link do płatności zaliczki |

Każdy produkt w trybie A/B ma też mały link **„Need a different size? We'll make it for you”** → przenosi do trybu C z wypełnionymi danymi produktu. To zamienia sklep w generator zleceń na wymiar.

### Strona produktu — elementy sprzedażowe
- Galeria (zdjęcia w realnych wnętrzach + detale łączeń, drewna, wykończenia), krótki film 360°/w ruchu.
- Wymiary z rysunkiem, materiał, wykończenie, waga, pielęgnacja.
- Czas realizacji i dostawy wyraźnie przy cenie.
- Opcje: dostawa / dostawa + montaż / odbiór osobisty.
- Raty (np. Klarna/Humm — do sprawdzenia dostępności) przy wyższych kwotach.
- „Handmade by [imię]” — kto zrobił ten produkt (buduje więź).
- Opinie produktu + „Zobacz też w zabudowie na wymiar”.

---

## 5. Ścieżka klienta usługowego (Bespoke + Build)

```
1. Zapytanie online        → formularz: typ prac, wymiary/opis, zdjęcia, budżet, termin, Eircode
2. Wycena wstępna (24–48h) → widełki cenowe e-mailem / WhatsApp
3. Wizyta i pomiar         → rezerwacja terminu w kalendarzu online
                             (opcjonalnie płatna np. €50–€100, odliczana od zamówienia — filtruje „turystów”)
4. Projekt + wycena końcowa → wizualizacja/rysunek, dokładna cena, harmonogram
5. Akceptacja + zaliczka    → płatność online (np. 30–50%) z linku
6. Produkcja / prace        → status w panelu klienta lub e-maile („w produkcji”, „gotowe do montażu”)
7. Montaż / odbiór          → płatność końcowa, prośba o opinię Google + zdjęcia do portfolio
```

### Formularz wyceny — kluczowe zasady
- **Wieloetapowy** (kreator), nie jedna długa ściana pól: najpierw „Co planujesz?” (kafle z obrazkami), potem szczegóły, na końcu kontakt.
- **Upload zdjęć i rysunków** (telefon → zdjęcie wnęki → gotowe).
- **Widełki budżetu** (pomaga odsiać i dopasować ofertę).
- **Eircode** → automatyczna informacja, czy obsługujecie ten obszar.
- Po wysłaniu: strona podziękowania z „co dalej” + realny czas odpowiedzi.
- Alternatywa dla leniwych: przycisk **WhatsApp** „Wyślij zdjęcie i zapytaj”.

---

## 6. Co sprawia, że klienci „sami się rzucają” — psychologia sprzedaży

1. **Dowód społeczny wszędzie**: opinie Google na stronie głównej, przy produktach i przy formularzu wyceny.
2. **Przed / po**: suwak porównania na realizacjach — najsilniejszy argument w budowlance.
3. **Ceny „od”**: „Fitted wardrobes from €1,800”, „Decking from €X/m²”. Brak cen = klient idzie do konkurencji, która je pokazuje.
4. **Twarze i warsztat**: prawdziwe zdjęcia ludzi i miejsca pracy, nie stockowe zdjęcia.
5. **Jasny proces**: klient boi się chaosu w remoncie — pokazujemy, że go nie będzie.
6. **Gwarancja i ubezpieczenie**: wyraźnie podane (np. 5 lat na stolarkę, ubezpieczenie OC/public liability).
7. **Ograniczona dostępność (uczciwa)**: „Next available installation slots: listopad” — buduje pilność bez kłamstw.
8. **Niski próg wejścia**: tani produkt w sklepie (np. półka, deska do krojenia) = pierwszy kontakt → późniejsza duża zabudowa.
9. **Szybka odpowiedź**: obietnica wyceny w 48h i jej dotrzymanie.
10. **Raty / finansowanie** przy dużych kwotach.
11. **Program poleceń**: „Poleć nas znajomemu — oboje dostajecie €X / rabat”.
12. **Szybkość strony i mobile-first**: większość klientów przyjdzie z telefonu, często z Google Maps.

---

## 7. Marketing i SEO lokalne

- **Google Business Profile** — absolutny priorytet; zdjęcia, opinie, posty z realizacjami. Strona linkuje do niego i odwrotnie.
- **Strony lokalne** dla obsługiwanych hrabstw/miast: „Fitted wardrobes in Dublin / Kildare / Meath…” — z realizacjami z tej okolicy.
- **Poradnik/blog**: „Ile kosztuje szafa wnękowa w Irlandii 2026”, „Taras kompozytowy vs drewniany w irlandzkim klimacie”, „Czy potrzebuję planning permission na garden room?” — teksty, które przyciągają klientów z Google.
- **Instagram / Facebook / TikTok**: filmy z procesu (time-lapse budowy szafy) → link do sklepu. Integracja sklepu z Instagram/Facebook Shop (faza 2).
- **Analityka**: GA4 lub prostsze Plausible + śledzenie konwersji (zakup, wysłane zapytanie, klik w telefon/WhatsApp).
- **Newsletter** z rabatem na pierwszy zakup (zbieranie e-maili od dnia 1).

---

## 8. Kwestie prawne i biznesowe (Irlandia) — do potwierdzenia z księgowym/prawnikiem

- **VAT**: inne stawki dla towarów i usług budowlanych (np. 23% dla towarów, 13,5% dla wielu usług budowlanych) — system musi to obsłużyć. **Do potwierdzenia z księgowym.**
- **Prawo konsumenckie (Consumer Rights Act 2022)**: 14 dni na odstąpienie od umowy dla zakupów online — **z wyjątkiem produktów robionych na wymiar/spersonalizowanych**. Regulamin musi to jasno rozróżniać (tryb A vs B/C).
- **RODO/GDPR** + baner cookies (zgodny z wytycznymi irlandzkiego Data Protection Commission).
- **Dane firmy w stopce**: nazwa, adres, numer CRO, numer VAT.
- **Ubezpieczenie** (public liability, employer's liability) — warto pokazać na stronie.
- **CIRI** (Construction Industry Register Ireland) — rejestracja dobrowolna, ale buduje zaufanie przy usługach budowlanych.
- **Dostawa**: większość mebli nie pójdzie kurierem paczkowym — potrzebne strefy dostawy (wg Eircode/hrabstwa), własny transport lub przewoźnik meblowy, opcja odbioru z warsztatu.

---

## 9. Technologia — rekomendacja

### Opcje

| Opcja | Plusy | Minusy | Dla kogo |
|---|---|---|---|
| **A. Shopify** + aplikacje (quote request, product options) | Najszybciej, gotowe płatności, łatwy panel | Abonament + opłaty za aplikacje, ograniczona swoboda przy konfiguratorze i ścieżce usługowej | Jeśli chcesz wystartować w 2–4 tyg. i sam zarządzać bez programisty |
| **B. WordPress + WooCommerce** | Tanio, ogromna liczba wtyczek | Wolniejsze, wymaga aktualizacji i dbania o bezpieczeństwo, „patchwork” wtyczek | Budżet minimalny |
| **C. Własna strona: Next.js + Payload CMS + Stripe** ⭐ | Pełna kontrola: 3 tryby produktu, kreator wycen, konfigurator, panel klienta, statusy projektów — wszystko w jednym; bardzo szybka; brak opłat za wtyczki | Dłuższy start, potrzebny ktoś do rozwoju (np. dalej z Claude Code w tym repozytorium) | Gdy strona ma być głównym narzędziem sprzedaży i rosnąć razem z firmą |

### Rekomendacja: **Opcja C**
Ponieważ projekt łączy sklep + usługi + zamówienia na wymiar, gotowe platformy będą tu „sklejane wtyczkami”. Własne rozwiązanie da jedną spójną ścieżkę klienta.

Proponowany stos:
- **Next.js** (front, SEO, szybkość) + **Tailwind CSS**
- **Payload CMS** (panel admina: produkty, warianty, realizacje, opinie, zapytania/leady, blog) — działa wewnątrz tej samej aplikacji Next.js
- **PostgreSQL** (baza)
- **Stripe** — karty, Apple Pay/Google Pay, linki płatności dla zaliczek; sprawdzić dostępność Klarna w IE
- **Przechowywanie zdjęć**: S3/Cloudflare R2
- **E-maile**: Resend / Postmark (potwierdzenia, statusy)
- **Kalendarz pomiarów**: Cal.com (osadzony) lub własny moduł
- **Hosting**: Vercel / Railway / Fly.io (do decyzji wg kosztów)

---

## 10. Plan etapów (roadmapa)

### Faza 0 — Fundamenty (przed kodowaniem)
- [ ] Nazwa, logo, kolory, typografia (kierunek: ciepłe drewno, czerwony akcent „Red Chisel”, rzemieślniczy, premium ale przystępny)
- [ ] Lista usług (dokładnie co robicie, a czego nie)
- [ ] Lista produktów startowych (10–20 sztuk) z cenami i czasem realizacji
- [ ] Obszar działania (hrabstwa), zasady dostawy i montażu
- [ ] Zdjęcia: produkty + 10–15 najlepszych realizacji (przed/po)
- [ ] Opinie klientów, Google Business Profile
- [ ] Decyzja technologiczna (sekcja 9)

### Faza 1 — MVP (start sprzedaży), ok. 4–6 tyg.
- [ ] Strona główna, O nas, Jak pracujemy, Kontakt
- [ ] Sklep: tryby A i B, koszyk, płatności Stripe, strefy dostawy
- [ ] Strony usług: Bespoke + Build & Renovate
- [ ] Wieloetapowy formularz wyceny z uploadem zdjęć → e-mail + zapis w panelu
- [ ] Portfolio realizacji z przed/po
- [ ] Regulaminy, polityka prywatności, cookies
- [ ] SEO techniczne, analityka, WhatsApp, Google Business Profile

### Faza 2 — Wzrost
- [ ] Tryb C: „Customise this” z produktu + płatność zaliczki z linku
- [ ] Rezerwacja wizyt pomiarowych online
- [ ] Prosty konfigurator szafy (szerokość/wysokość/drzwi/wnętrze → orientacyjna cena)
- [ ] Strony lokalne (hrabstwa), poradnik/blog
- [ ] Raty, program poleceń, newsletter
- [ ] Chatbot na stronie (po bazie danych i panelu admina). Ustalone: mały model open source;
      gdy bot nie zna odpowiedzi albo klient chce człowieka, zbiera kontakt i pytanie,
      rozmowa trafia do panelu admina + e-mail. Do ustalenia: zakres, gdzie działa model
      (Vercel nie ma kart graficznych: w przeglądarce klienta, tani serwer albo API z modelem open source).

### Faza 3 — Pełna platforma
- [ ] Konto klienta ze statusem projektu (pomiar → projekt → produkcja → montaż) i dokumentami
- [ ] Wizualizacja 3D w konfiguratorze
- [ ] Automatyczna prośba o opinię po montażu
- [ ] Integracja z księgowością (faktury)

---

## 11. Model danych (szkic, dla wersji C)

- **Product**: nazwa, kategoria, tryb (`in_stock` / `made_to_order` / `quote_only`), cena bazowa, opcje (drewno, wykończenie, rozmiar → dopłaty), stan magazynu, czas realizacji, wymiary, zdjęcia, stawka VAT
- **Order**: pozycje, dostawa (strefa/montaż/odbiór), płatność, status
- **Lead / QuoteRequest**: typ (bespoke/build/small job/custom product), opis, wymiary, zdjęcia, budżet, Eircode, termin, status (`new` → `quoted` → `survey_booked` → `won`/`lost`), powiązany produkt
- **Project** (realizacja, portfolio + projekt klienta): zdjęcia przed/po, zakres, lokalizacja, opinia, status prac
- **Review**, **ServicePage**, **LocationPage**, **BlogPost**
- **DeliveryZone**: hrabstwa/prefiksy Eircode, cena dostawy, cena montażu

---

## 12. Pytania do Ciebie — ✅ odpowiedziane (patrz sekcja 0)

1. **Nazwa firmy i logo** — czy „Old Red Chisel” to docelowa nazwa? Masz już logo/kolory?
2. **Lokalizacja i zasięg** — gdzie jest warsztat i w których hrabstwach pracujecie?
3. **Kuchnie** — robicie kuchnie na wymiar, czy tylko szafy/zabudowy?
4. **Sklep na start** — ile produktów i jakie? Czy są gotowe sztuki na magazynie, czy wszystko robione po zamówieniu?
5. **Dostawa** — własny transport? Montaż w cenie czy płatny osobno? Odbiór z warsztatu?
6. **Pomiar** — darmowy czy płatny (z odliczeniem od zamówienia)?
7. **Język** — tylko angielski, czy też polski?
8. **Technologia** — wolisz łatwiejszy start (Shopify) czy własną, rozbudowywaną stronę (rekomendowana opcja C)?
9. **Materiały** — masz zdjęcia realizacji (przed/po) i opinie klientów? Profil Google Business?
10. **Domena** — masz już domenę (.ie / .com)? Uwaga: domena .ie wymaga wykazania powiązania z Irlandią (firma w Irlandii to spełnia).
11. **Budżet i termin** — kiedy strona ma wystartować?
